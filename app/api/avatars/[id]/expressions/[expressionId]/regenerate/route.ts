import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import { avatarExpressions, avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  createRateLimitHeaders,
  expressionRegenerateLimiter,
  getRateLimitIdentifier,
} from "@/lib/middleware/rate-limit";
import { processBackgroundRemoval } from "@/lib/services/background-removal";
import {
  consumeWithRecord,
  refundWithUpdate,
  TASK_COSTS,
} from "@/lib/services/credits-transaction";
import {
  type ArtStyle,
  type ExpressionType,
  getGenerationAdapter,
} from "@/lib/services/generation";
import { deleteFromR2, ensureOwnStorage, generateAvatarKey } from "@/lib/services/storage";

/**
 * POST /api/avatars/[id]/expressions/[expressionId]/regenerate
 *
 * Regenerate a single expression image.
 * Uses atomic transactions for credit operations.
 * On success: replaces old image
 * On failure: refunds credits atomically, keeps old image
 *
 * Auth: Required (must own avatar)
 * Cost: 200 credits
 * Rate Limit: 10 requests per minute per user
 * Response: { expressionId, type, status, imageUrl }
 */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; expressionId: string }> },
) {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit check
    const identifier = getRateLimitIdentifier(req, session.user.id);
    const rateLimitResult = expressionRegenerateLimiter.check(identifier);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many regeneration requests. Please try again in ${Math.ceil(
            (rateLimitResult.reset * 1000 - Date.now()) / 1000,
          )} seconds.`,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        },
      );
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

    // Use original (pre-bg-removal) image for AI generation — external APIs
    // may timeout downloading _nobg images from R2 CDN
    const aiBaseImageUrl = a.originalBaseImageUrl ?? a.baseImageUrl;

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

    // 5. Atomic operation: Consume credits AND update status
    const cost = TASK_COSTS.expression_edit;

    const consumeResult = await consumeWithRecord(
      session.user.id,
      cost,
      `Regenerate ${expr.type}`,
      async (tx, transactionId) => {
        // Update status to generating within the transaction
        await tx
          .update(avatarExpressions)
          .set({ status: "generating" })
          .where(eq(avatarExpressions.id, expressionId));

        return { transactionId };
      },
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

    // 6. Generate new expression (outside transaction - involves external API)
    try {
      const adapter = getGenerationAdapter();
      const result = await adapter.generateExpression({
        baseImageUrl: aiBaseImageUrl,
        expression: expr.type as ExpressionType,
        style: a.style as ArtStyle,
        prompt: a.prompt,
      });

      if (result.status !== "completed" || !result.imageUrl) {
        throw new Error(result.error || "Generation failed");
      }

      const newKey = generateAvatarKey(
        session.user.id,
        avatarId,
        "expression",
        expr.type,
      );
      // Fallback providers return temporary upstream URLs — persist to our
      // R2 so the stored URL can't expire if background removal fails.
      const newImageUrl = await ensureOwnStorage(result.imageUrl, newKey);

      // 8. Delete old image from R2 (only on success; never the key we just wrote)
      if (oldImageR2Key && oldImageR2Key !== newKey) {
        try {
          await deleteFromR2(oldImageR2Key);
        } catch (error) {
          console.warn(
            `[Regenerate] Failed to delete old image: ${oldImageR2Key}`,
            error,
          );
        }
      }

      // 9. Update expression record
      await db
        .update(avatarExpressions)
        .set({
          status: "completed",
          imageUrl: newImageUrl,
          imageR2Key: newKey,
          provider: result.provider ?? null,
        })
        .where(eq(avatarExpressions.id, expressionId));

      // 10. Async background removal (fire-and-forget)
      //     Uploads to new _nobg key and updates DB to avoid CDN cache issues
      after(async () => {
        await processBackgroundRemoval(newImageUrl, newKey, {
          onComplete: async (result) => {
            await db
              .update(avatarExpressions)
              .set({
                imageUrl: result.imageUrl,
                imageR2Key: result.imageR2Key,
              })
              .where(eq(avatarExpressions.id, expressionId));
          },
        });
      });

      // 11. Return success response
      return NextResponse.json({
        expressionId,
        type: expr.type,
        status: "completed",
        imageUrl: newImageUrl,
      });
    } catch (error) {
      console.error("[Regenerate] Expression generation failed:", error);

      // 11. On failure: atomically refund credits and revert status
      await refundWithUpdate(
        session.user.id,
        cost,
        `Regenerate ${expr.type} failed - refund`,
        async (tx) => {
          // Revert to previous status (completed if had image, failed if didn't)
          const previousStatus = expr.imageUrl ? "completed" : "failed";
          await tx
            .update(avatarExpressions)
            .set({ status: previousStatus })
            .where(eq(avatarExpressions.id, expressionId));

          return { reverted: true };
        },
        { avatarId, expressionId },
      );

      return NextResponse.json(
        {
          error: "Generation failed",
          message: error instanceof Error ? error.message : "Unknown error",
          refundedCredits: cost,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(
      "[API] Unhandled error in POST /api/avatars/[id]/expressions/[expressionId]/regenerate:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
