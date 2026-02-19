import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { avatarExpressions, avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  consumeCredits,
  refundCredits,
  TASK_COSTS,
} from "@/lib/services/credits";
import {
  type ExpressionType,
  getGenerationAdapter,
} from "@/lib/services/generation";
import { generateAvatarKey, uploadImageToR2 } from "@/lib/services/storage";

/**
 * POST /api/avatars/[id]/expressions
 *
 * Generate expression variants for a base avatar.
 * Processes expressions sequentially to avoid rate limits.
 * Refunds credits for any failed generations.
 *
 * Auth: Required (must own avatar)
 * Body: { expressions: ['talking', 'happy', 'sad'] }
 * Cost: 200 credits × expressions.length
 *
 * Response: { avatarId, expressions: [{ id, type, status, imageUrl }] }
 */

// Valid expression types (defined in schema)
// "idle" | "talking" | "happy" | "sad" | "angry" | "surprised"

const generateSchema = z.object({
  expressions: z
    .array(z.enum(["idle", "talking", "happy", "sad", "angry", "surprised"]))
    .min(1)
    .max(6)
    .refine((items) => new Set(items).size === items.length, {
      message: "Expressions must be unique",
    }),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: avatarId } = await params;

  // 2. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = generateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const { expressions } = parseResult.data;

  // 3. Fetch avatar and verify ownership
  const db = getDatabase();
  const avatar = await db
    .select()
    .from(avatars)
    .where(and(eq(avatars.id, avatarId), eq(avatars.userId, session.user.id)))
    .limit(1);

  if (avatar.length === 0) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  const a = avatar[0];

  // 4. Verify avatar is completed (has base image)
  if (a.status !== "completed" || !a.baseImageUrl) {
    return NextResponse.json(
      { error: "Avatar base image not ready" },
      { status: 400 },
    );
  }

  // 5. Calculate cost and consume credits
  const costPerExpression = TASK_COSTS.expression_edit;
  const totalCost = costPerExpression * expressions.length;

  const consumeResult = await consumeCredits(
    session.user.id,
    totalCost,
    `Expression pack: ${expressions.join(", ")}`,
    { avatarId, expressions, taskType: "expression_edit" },
  );

  if (!consumeResult.success) {
    return NextResponse.json(
      {
        error: "insufficient_credits",
        balance: consumeResult.newBalance,
        required: totalCost,
      },
      { status: 402 },
    );
  }

  // 6. Create expression records (status: pending)
  const expressionRecords: {
    id: string;
    type: ExpressionType;
    status: string;
    imageUrl: string | null;
  }[] = [];

  for (const expressionType of expressions) {
    const expressionId = crypto.randomUUID();
    await db.insert(avatarExpressions).values({
      id: expressionId,
      avatarId,
      type: expressionType,
      status: "pending",
      creditsUsed: costPerExpression,
    });

    expressionRecords.push({
      id: expressionId,
      type: expressionType,
      status: "pending",
      imageUrl: null,
    });
  }

  // 7. Generate expressions sequentially
  const adapter = getGenerationAdapter();
  let failedCount = 0;

  for (const record of expressionRecords) {
    try {
      // Update status to generating
      await db
        .update(avatarExpressions)
        .set({ status: "generating" })
        .where(eq(avatarExpressions.id, record.id));

      // Generate expression
      const result = await adapter.generateExpression({
        baseImageUrl: a.baseImageUrl,
        expression: record.type,
        style: a.style as "anime" | "chibi",
        prompt: a.prompt,
      });

      if (result.status === "completed" && result.imageUrl) {
        // Fetch and upload to R2
        const imageResponse = await fetch(result.imageUrl);
        if (!imageResponse.ok) {
          throw new Error(
            `Failed to fetch generated image: ${imageResponse.status}`,
          );
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        const key = generateAvatarKey(
          session.user.id,
          avatarId,
          "expression",
          record.type,
        );
        const publicUrl = await uploadImageToR2(imageBuffer, key, "image/png");

        // Update record
        await db
          .update(avatarExpressions)
          .set({
            status: "completed",
            imageUrl: publicUrl,
            imageR2Key: key,
          })
          .where(eq(avatarExpressions.id, record.id));

        record.status = "completed";
        record.imageUrl = publicUrl;
      } else {
        throw new Error(result.error || "Generation failed");
      }
    } catch (error) {
      console.error(`[Expressions] Failed to generate ${record.type}:`, error);

      // Update status to failed
      await db
        .update(avatarExpressions)
        .set({ status: "failed" })
        .where(eq(avatarExpressions.id, record.id));

      record.status = "failed";
      failedCount++;
    }
  }

  // 8. Refund credits for failed expressions
  if (failedCount > 0) {
    const refundAmount = costPerExpression * failedCount;
    await refundCredits(
      session.user.id,
      refundAmount,
      `Expression generation failed - ${failedCount} expression(s) refunded`,
      { avatarId, failedCount },
    );
  }

  // 9. Return response
  return NextResponse.json({
    avatarId,
    expressions: expressionRecords.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      imageUrl: r.imageUrl,
    })),
    failedCount,
    refundedCredits: failedCount > 0 ? costPerExpression * failedCount : 0,
  });
}
