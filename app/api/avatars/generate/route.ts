import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import {
  avatarGenerationLimiter,
  createRateLimitHeaders,
  getRateLimitIdentifier,
} from "@/lib/middleware/rate-limit";
import {
  consumeWithRecord,
  refundWithUpdate,
  TASK_COSTS,
} from "@/lib/services/credits-transaction";
import {
  canUseFreeTrial,
  consumeFreeTrial,
  revertFreeTrial,
} from "@/lib/services/free-trial";
import { type ArtStyle, getGenerationAdapter } from "@/lib/services/generation";

/**
 * POST /api/avatars/generate
 *
 * Generate candidate character images from a text prompt (1 per model, parallel).
 * Uses atomic transaction: credits are deducted and avatar record is created together.
 * If generation fails, credits are refunded atomically.
 *
 * Auth: Required
 * Body: { prompt: string, style: ArtStyle, aspectRatio?: string }
 * Cost: 300 credits (TASK_COSTS.avatar_generation)
 * Rate Limit: 3 requests per minute per user
 * Returns: { avatarId: string, images: string[], aspectRatio: string }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit check
    const identifier = getRateLimitIdentifier(req, session.user.id);
    const rateLimitResult = avatarGenerationLimiter.check(identifier);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many generation requests. Please try again in ${Math.ceil(
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

    const userId = session.user.id;

    // 2. Parse & validate body
    let body: {
      prompt: string;
      style: string;
      aspectRatio?: string;
      referenceUrl?: string | null;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { prompt, style, aspectRatio, referenceUrl } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: "Prompt must be at least 10 characters" },
        { status: 400 },
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: "Prompt must be at most 1000 characters" },
        { status: 400 },
      );
    }

    const validStyles = ["anime", "chibi", "cartoon", "pixel-art", "none"];
    if (!style || !validStyles.includes(style)) {
      return NextResponse.json(
        {
          error: `Invalid style. Must be one of: ${validStyles.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // 3. Check free trial eligibility before credit consumption
    const cost = TASK_COSTS.avatar_generation;
    const normalizedAspectRatio = aspectRatio || "1:1";
    const avatarId = crypto.randomUUID();
    const isTrialEligible = await canUseFreeTrial(userId);

    if (isTrialEligible) {
      // ── Free trial path: no credits consumed ──────────────────────────
      const trialResult = await consumeFreeTrial(userId);
      if (!trialResult.success) {
        return NextResponse.json(
          { error: "insufficient_credits", balance: 0, required: cost },
          { status: 402 },
        );
      }

      // Create avatar row directly (no credit transaction link)
      const { getDatabase } = await import("@/lib/db");
      const db = getDatabase();
      await db.insert(avatars).values({
        id: avatarId,
        userId,
        name: "My PNGTuber",
        prompt: prompt.trim(),
        style: style as ArtStyle,
        aspectRatio: normalizedAspectRatio,
        status: "generating",
        creditsUsed: 0,
      });

      try {
        const adapter = getGenerationAdapter();
        const result = await adapter.generateCharacter({
          prompt: prompt.trim(),
          style: style as ArtStyle,
          referenceUrl: referenceUrl || undefined,
        });

        if (result.status === "failed" || result.images.length === 0) {
          // Generation failed — delete avatar row + trial transaction so user can retry
          await db
            .update(avatars)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(avatars.id, avatarId));
          await revertFreeTrial(userId);

          return NextResponse.json(
            { error: result.error || "Generation failed" },
            { status: 500 },
          );
        }

        const r2Urls = result.images;
        await db
          .update(avatars)
          .set({
            candidateImages: r2Urls,
            status: "selecting",
            updatedAt: new Date(),
          })
          .where(eq(avatars.id, avatarId));

        return NextResponse.json({
          avatarId,
          images: r2Urls,
          aspectRatio: normalizedAspectRatio,
        });
      } catch (error) {
        console.error("Avatar generation error (trial):", error);
        const db2 = getDatabase();
        await db2
          .update(avatars)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(avatars.id, avatarId));
        await revertFreeTrial(userId);

        return NextResponse.json(
          { error: "Generation failed unexpectedly" },
          { status: 500 },
        );
      }
    }

    // ── Normal paid path: consume credits AND create avatar record ─────
    const consumeResult = await consumeWithRecord(
      userId,
      cost,
      `Character generation: ${style}`,
      async (tx, transactionId) => {
        // Create avatar record within the same transaction
        const [avatar] = await tx
          .insert(avatars)
          .values({
            id: avatarId,
            userId,
            name: "My PNGTuber",
            prompt: prompt.trim(),
            style: style as ArtStyle,
            aspectRatio: normalizedAspectRatio,
            status: "generating",
            creditsUsed: cost,
            transactionId,
          })
          .returning();
        return avatar;
      },
      { taskType: "avatar_generation", style },
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

    // 4. Call generation adapter (outside transaction - may take time)
    try {
      const adapter = getGenerationAdapter();
      const result = await adapter.generateCharacter({
        prompt: prompt.trim(),
        style: style as ArtStyle,
        referenceUrl: referenceUrl || undefined,
      });

      if (result.status === "failed" || result.images.length === 0) {
        // Generation failed — atomically refund credits and update status
        await refundWithUpdate(
          userId,
          cost,
          "Character generation failed — refund",
          async (tx) => {
            await tx
              .update(avatars)
              .set({ status: "failed", updatedAt: new Date() })
              .where(eq(avatars.id, avatarId));
          },
          { avatarId },
        );

        return NextResponse.json(
          { error: result.error || "Generation failed" },
          { status: 500 },
        );
      }

      // 5. CocoRouter already uploaded images to R2 — use CDN URLs directly
      const r2Urls = result.images;

      const { getDatabase } = await import("@/lib/db");
      const db = getDatabase();
      await db
        .update(avatars)
        .set({
          candidateImages: r2Urls,
          status: "selecting",
          updatedAt: new Date(),
        })
        .where(eq(avatars.id, avatarId));

      return NextResponse.json({
        avatarId,
        images: r2Urls,
        aspectRatio: normalizedAspectRatio,
      });
    } catch (error) {
      // Unexpected error — atomically refund and fail
      console.error("Avatar generation error:", error);

      await refundWithUpdate(
        userId,
        cost,
        "Character generation error — refund",
        async (tx) => {
          await tx
            .update(avatars)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(avatars.id, avatarId));
        },
        { avatarId },
      );

      return NextResponse.json(
        { error: "Generation failed unexpectedly" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(
      "[API] Unhandled error in POST /api/avatars/generate:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
