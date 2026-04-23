import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  createRateLimitHeaders,
  getRateLimitIdentifier,
  referenceSheetLimiter,
} from "@/lib/middleware/rate-limit";
import {
  consumeWithRecord,
  refundWithUpdate,
  TASK_COSTS,
} from "@/lib/services/credits-transaction";
import { GptImageAdapter } from "@/lib/services/generation/gpt-image-adapter";
import { REFERENCE_SHEET_PROMPT } from "@/lib/services/generation/reference-sheet-prompt";
import { uploadImageToR2 } from "@/lib/services/storage";

/**
 * POST /api/avatars/[id]/reference-sheet
 *
 * Generate (or regenerate) a character reference sheet for a completed avatar.
 * Overwrites any existing reference sheet; no refund for overwrites.
 *
 * Auth: Required (must own avatar)
 * Cost: 200 credits (TASK_COSTS.reference_sheet)
 * Rate Limit: 5 requests per minute per user
 * Response: { avatarId, referenceSheetUrl, referenceSheetR2Key, referenceSheetGeneratedAt }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = getRateLimitIdentifier(req, session.user.id);
    const rl = referenceSheetLimiter.check(identifier);
    if (!rl.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Retry in ${Math.ceil(
            (rl.reset * 1000 - Date.now()) / 1000,
          )}s.`,
          reset: rl.reset,
        },
        { status: 429, headers: createRateLimitHeaders(rl) },
      );
    }

    const { id: avatarId } = await params;

    const db = getDatabase();
    const rows = await db
      .select()
      .from(avatars)
      .where(and(eq(avatars.id, avatarId), eq(avatars.userId, session.user.id)))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    const a = rows[0];
    if (a.status !== "completed" || !a.baseImageUrl) {
      return NextResponse.json({ error: "Avatar not ready" }, { status: 400 });
    }

    const sourceImageUrl = a.originalBaseImageUrl ?? a.baseImageUrl;
    const cost = TASK_COSTS.reference_sheet;

    // Atomic credit consumption (no DB write yet — we only mutate avatars row after success)
    const consumeResult = await consumeWithRecord(
      session.user.id,
      cost,
      `Reference sheet generation for avatar ${avatarId}`,
      async (_tx, _transactionId) => {
        return { ok: true };
      },
      { avatarId, taskType: "reference_sheet" },
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

    // Generate via GPT-Image-2 edit (1024×1024)
    const adapter = new GptImageAdapter();
    let generatedUrl: string | null = null;
    try {
      generatedUrl = await adapter.editWithPrompt(
        sourceImageUrl,
        REFERENCE_SHEET_PROMPT,
      );
    } catch (err) {
      console.error("[ReferenceSheet] adapter threw:", err);
    }

    if (!generatedUrl) {
      await refundWithUpdate(
        session.user.id,
        cost,
        `Reference sheet generation failed for avatar ${avatarId}`,
        async () => ({ refunded: true }),
        { avatarId, taskType: "reference_sheet" },
      );
      return NextResponse.json({ error: "generation_failed" }, { status: 502 });
    }

    // Download, upload to R2
    let finalUrl: string;
    let r2Key: string;
    try {
      const imgRes = await fetch(generatedUrl);
      if (!imgRes.ok) {
        throw new Error(`fetch ${generatedUrl} -> HTTP ${imgRes.status}`);
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());

      const timestamp = Date.now();
      r2Key = `avatars/${session.user.id}/${avatarId}/reference-sheet/${timestamp}.png`;
      finalUrl = await uploadImageToR2(buf, r2Key, "image/png");
    } catch (err) {
      console.error("[ReferenceSheet] post-processing failed:", err);
      await refundWithUpdate(
        session.user.id,
        cost,
        `Reference sheet upload failed for avatar ${avatarId}`,
        async () => ({ refunded: true }),
        { avatarId, taskType: "reference_sheet" },
      );
      return NextResponse.json({ error: "upload_failed" }, { status: 500 });
    }

    const now = new Date();
    await db
      .update(avatars)
      .set({
        referenceSheetUrl: finalUrl,
        referenceSheetR2Key: r2Key,
        referenceSheetGeneratedAt: now,
        updatedAt: now,
      })
      .where(eq(avatars.id, avatarId));

    return NextResponse.json({
      avatarId,
      referenceSheetUrl: finalUrl,
      referenceSheetR2Key: r2Key,
      referenceSheetGeneratedAt: now.toISOString(),
    });
  } catch (error) {
    console.error(
      "[API] Unhandled error in POST /api/avatars/[id]/reference-sheet:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
