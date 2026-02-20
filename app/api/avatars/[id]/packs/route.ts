import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { avatarExpressions, avatars, expressionPacks } from "@/database/schema";
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
 * POST /api/avatars/[id]/packs
 *
 * Create an expression pack for a completed avatar.
 * - base pack: idle (copy from baseImageUrl), talking, blink, blink_talking (3 generated)
 * - custom pack: a single expression of the given subtype (1 generated)
 *
 * Auth: Required (must own avatar)
 * Body: { packType: 'base' | 'custom', subtype?: 'happy' | 'angry' | 'sad' }
 * Cost: 200 credits per generated expression
 *
 * Response: { packId, expressions: [...], failedCount, refundedCredits }
 */

const packSchema = z
  .object({
    packType: z.enum(["base", "custom"]),
    subtype: z.enum(["happy", "angry", "sad"]).optional(),
  })
  .refine(
    (data) => {
      if (data.packType === "custom" && !data.subtype) return false;
      return true;
    },
    { message: "subtype is required for custom packs" },
  );

const BASE_EXPRESSIONS: ExpressionType[] = [
  "idle",
  "talking",
  "blink",
  "blink_talking",
];

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

  const parseResult = packSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const { packType, subtype } = parseResult.data;

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

  // 4. Verify avatar is completed with a base image
  if (a.status !== "completed" || !a.baseImageUrl) {
    return NextResponse.json(
      { error: "Avatar base image not ready" },
      { status: 400 },
    );
  }

  // 5. Determine expression types to generate
  // Custom packs get static + talking variant (e.g. "happy" + "happy_talking")
  const expressionTypes: ExpressionType[] =
    packType === "base"
      ? BASE_EXPRESSIONS
      : [subtype as ExpressionType, `${subtype}_talking` as ExpressionType];

  // idle is copied from baseImageUrl, not generated
  const toGenerate = expressionTypes.filter((t) => t !== "idle");

  // 6. Calculate cost and consume credits
  const costPerExpression = TASK_COSTS.expression_edit;
  const totalCost = costPerExpression * toGenerate.length;

  const consumeResult = await consumeCredits(
    session.user.id,
    totalCost,
    `Expression pack (${packType}${subtype ? `: ${subtype}` : ""}): ${toGenerate.join(", ")}`,
    { avatarId, packType, subtype, taskType: "expression_edit" },
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

  // 7. Insert expression_packs record
  const packId = crypto.randomUUID();
  await db.insert(expressionPacks).values({
    id: packId,
    avatarId,
    packType,
    subtype: subtype ?? null,
    status: "generating",
    creditsUsed: totalCost,
  });

  // 8. Insert expression records
  const expressionRecords: {
    id: string;
    type: ExpressionType;
    status: string;
    imageUrl: string | null;
  }[] = [];

  for (const expressionType of expressionTypes) {
    const expressionId = crypto.randomUUID();
    const isIdle = expressionType === "idle";

    await db.insert(avatarExpressions).values({
      id: expressionId,
      avatarId,
      packId,
      type: expressionType,
      status: isIdle ? "completed" : "pending",
      imageUrl: isIdle ? a.baseImageUrl : null,
      creditsUsed: isIdle ? 0 : costPerExpression,
    });

    expressionRecords.push({
      id: expressionId,
      type: expressionType,
      status: isIdle ? "completed" : "pending",
      imageUrl: isIdle ? a.baseImageUrl : null,
    });
  }

  // 9. Generate expressions sequentially (skip idle)
  const adapter = getGenerationAdapter();
  let failedCount = 0;

  for (const record of expressionRecords) {
    if (record.status === "completed") continue; // skip idle

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
      console.error(`[Packs] Failed to generate ${record.type}:`, error);

      await db
        .update(avatarExpressions)
        .set({ status: "failed" })
        .where(eq(avatarExpressions.id, record.id));

      record.status = "failed";
      failedCount++;
    }
  }

  // 10. Refund credits for failed expressions
  if (failedCount > 0) {
    const refundAmount = costPerExpression * failedCount;
    await refundCredits(
      session.user.id,
      refundAmount,
      `Expression pack generation failed - ${failedCount} expression(s) refunded`,
      { avatarId, packId, failedCount },
    );
  }

  // 11. Update pack status
  const allCompleted = expressionRecords.every((r) => r.status === "completed");
  const allFailed = expressionRecords
    .filter((r) => r.type !== "idle")
    .every((r) => r.status === "failed");

  await db
    .update(expressionPacks)
    .set({
      status: allFailed ? "failed" : allCompleted ? "completed" : "completed",
    })
    .where(eq(expressionPacks.id, packId));

  // 12. Return response
  return NextResponse.json({
    packId,
    packType,
    subtype: subtype ?? null,
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
