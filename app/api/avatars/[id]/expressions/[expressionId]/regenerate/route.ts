import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatarExpressions, avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  consumeCredits,
  refundCredits,
  TASK_COSTS,
} from "@/lib/services/credits";
import { type ArtStyle, getGenerationAdapter } from "@/lib/services/generation";
import {
  deleteFromR2,
  generateAvatarKey,
  uploadImageToR2,
} from "@/lib/services/storage";

/**
 * POST /api/avatars/[id]/expressions/[expressionId]/regenerate
 *
 * Regenerate a single expression image.
 * On success: replaces old image
 * On failure: refunds credits, keeps old image
 *
 * Auth: Required (must own avatar)
 * Cost: 200 credits
 *
 * Response: { expressionId, type, status, imageUrl }
 */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; expressionId: string }> },
) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: avatarId, expressionId } = await params;

  // 2. Fetch avatar and verify ownership
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

  // 3. Verify avatar has base image
  if (!a.baseImageUrl) {
    return NextResponse.json(
      { error: "Avatar base image not ready" },
      { status: 400 },
    );
  }

  // 4. Fetch expression record
  const expression = await db
    .select()
    .from(avatarExpressions)
    .where(
      and(
        eq(avatarExpressions.id, expressionId),
        eq(avatarExpressions.avatarId, avatarId),
      ),
    )
    .limit(1);

  if (expression.length === 0) {
    return NextResponse.json(
      { error: "Expression not found" },
      { status: 404 },
    );
  }

  const expr = expression[0];
  const oldImageR2Key = expr.imageR2Key;

  // 5. Consume credits for regeneration
  const cost = TASK_COSTS.expression_edit;
  const consumeResult = await consumeCredits(
    session.user.id,
    cost,
    `Regenerate ${expr.type}`,
    { avatarId, expressionId, expressionType: expr.type },
  );

  if (!consumeResult.success) {
    return NextResponse.json(
      {
        error: "insufficient_credits",
        balance: consumeResult.newBalance,
        required: cost,
      },
      { status: 402 },
    );
  }

  // 6. Update status to generating
  await db
    .update(avatarExpressions)
    .set({ status: "generating" })
    .where(eq(avatarExpressions.id, expressionId));

  // 7. Generate new expression
  try {
    const adapter = getGenerationAdapter();
    const result = await adapter.generateExpression({
      baseImageUrl: a.baseImageUrl,
      expression: expr.type as
        | "idle"
        | "talking"
        | "happy"
        | "sad"
        | "angry"
        | "surprised",
      style: a.style as ArtStyle,
      prompt: a.prompt,
    });

    if (result.status !== "completed" || !result.imageUrl) {
      throw new Error(result.error || "Generation failed");
    }

    // 8. Fetch and upload new image
    const imageResponse = await fetch(result.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch generated image: ${imageResponse.status}`,
      );
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    const newKey = generateAvatarKey(
      session.user.id,
      avatarId,
      "expression",
      expr.type,
    );
    const newImageUrl = await uploadImageToR2(imageBuffer, newKey, "image/png");

    // 9. Delete old image from R2 (only on success)
    if (oldImageR2Key) {
      try {
        await deleteFromR2(oldImageR2Key);
      } catch (error) {
        console.warn(
          `[Regenerate] Failed to delete old image: ${oldImageR2Key}`,
          error,
        );
      }
    }

    // 10. Update expression record
    await db
      .update(avatarExpressions)
      .set({
        status: "completed",
        imageUrl: newImageUrl,
        imageR2Key: newKey,
      })
      .where(eq(avatarExpressions.id, expressionId));

    // 11. Return success response
    return NextResponse.json({
      expressionId,
      type: expr.type,
      status: "completed",
      imageUrl: newImageUrl,
    });
  } catch (error) {
    console.error("[Regenerate] Expression generation failed:", error);

    // 12. On failure: refund credits and revert status
    await refundCredits(
      session.user.id,
      cost,
      `Regenerate ${expr.type} failed - refund`,
      { avatarId, expressionId },
    );

    // Revert to previous status (completed if had image, failed if didn't)
    const previousStatus = expr.imageUrl ? "completed" : "failed";
    await db
      .update(avatarExpressions)
      .set({ status: previousStatus })
      .where(eq(avatarExpressions.id, expressionId));

    return NextResponse.json(
      {
        error: "Generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        refundedCredits: cost,
      },
      { status: 500 },
    );
  }
}
