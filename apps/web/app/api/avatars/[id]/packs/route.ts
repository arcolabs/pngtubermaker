import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { avatarExpressions, avatars, expressionPacks } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  createRateLimitHeaders,
  expressionPackLimiter,
  getRateLimitIdentifier,
} from "@/lib/middleware/rate-limit";
import { processBackgroundRemovalBatch } from "@/lib/services/background-removal";
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
import { ensureOwnStorage, generateAvatarKey } from "@/lib/services/storage";
import { staggeredAllSettled } from "@/lib/utils";

/**
 * POST /api/avatars/[id]/packs
 *
 * Create an expression pack for a completed avatar.
 * Uses atomic transactions for credit operations.
 * - base pack: idle (copy from baseImageUrl), talking, blink, blink_talking (3 generated)
 * - custom pack: happy/angry/sad → 2 generated (subtype + subtype_talking)
 *                surprised → 1 generated (reaction expression, no _talking variant)
 *
 * Auth: Required (must own avatar)
 * Body: { packType: 'base' | 'custom', subtype?: 'happy' | 'angry' | 'sad' | 'surprised' }
 * Cost: 200 credits per generated expression
 * Rate Limit: 5 requests per minute per user
 * Response: { packId, expressions: [...], failedCount, refundedCredits }
 */

const packSchema = z
  .object({
    packType: z.enum(["base", "custom"]),
    subtype: z.enum(["happy", "angry", "sad", "surprised"]).optional(),
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
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit check
    const identifier = getRateLimitIdentifier(req, session.user.id);
    const rateLimitResult = expressionPackLimiter.check(identifier);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many expression pack requests. Please try again in ${Math.ceil(
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

    // Use original (pre-bg-removal) image for AI generation — external APIs
    // may timeout downloading _nobg images from R2 CDN
    const baseImageUrl = a.originalBaseImageUrl ?? a.baseImageUrl;

    // 5. Determine expression types to generate
    // surprised has no _talking variant (it's a reaction, not a sustained state).
    // Other custom emotions generate <subtype> + <subtype>_talking pairs.
    const expressionTypes: ExpressionType[] =
      packType === "base"
        ? BASE_EXPRESSIONS
        : subtype === "surprised"
          ? ["surprised"]
          : [subtype as ExpressionType, `${subtype}_talking` as ExpressionType];

    // idle is copied from baseImageUrl, not generated
    const toGenerate = expressionTypes.filter((t) => t !== "idle");

    // 6. Calculate cost
    const costPerExpression = TASK_COSTS.expression_edit;
    const totalCost = costPerExpression * toGenerate.length;

    // 7. Consume credits and create pack record
    const packId = crypto.randomUUID();

    const consumeResult = await consumeWithRecord(
      session.user.id,
      totalCost,
      `Expression pack (${packType}${subtype ? `: ${subtype}` : ""}): ${toGenerate.join(", ")}`,
      async (tx, transactionId) => {
        // Create pack record
        await tx.insert(expressionPacks).values({
          id: packId,
          avatarId,
          packType,
          subtype: subtype ?? null,
          status: "generating",
          creditsUsed: totalCost,
          transactionId,
        });

        // Create expression records
        const records: {
          id: string;
          type: ExpressionType;
          status: string;
          imageUrl: string | null;
        }[] = [];

        for (const expressionType of expressionTypes) {
          const expressionId = crypto.randomUUID();
          const isIdle = expressionType === "idle";

          await tx.insert(avatarExpressions).values({
            id: expressionId,
            avatarId,
            packId,
            type: expressionType,
            status: isIdle ? "completed" : "pending",
            imageUrl: isIdle ? a.baseImageUrl : null,
            creditsUsed: isIdle ? 0 : costPerExpression,
          });

          records.push({
            id: expressionId,
            type: expressionType,
            status: isIdle ? "completed" : "pending",
            imageUrl: isIdle ? a.baseImageUrl : null,
          });
        }

        return { packId, records };
      },
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

    const expressionRecords = consumeResult.result.records;

    // 8. Process all expressions in parallel (including idle)
    const adapter = getGenerationAdapter();
    const bgRemovalTasks: {
      imageUrl: string;
      r2Key: string;
      expressionId: string;
    }[] = [];

    // Mark non-idle as generating
    await Promise.all(
      expressionRecords
        .filter((r) => r.type !== "idle")
        .map((record) =>
          db
            .update(avatarExpressions)
            .set({ status: "generating" })
            .where(eq(avatarExpressions.id, record.id)),
        ),
    );

    // Idle: copy base image directly (no API call needed)
    const idleRecord = expressionRecords.find((r) => r.type === "idle");
    const toGenerateRecords = expressionRecords.filter(
      (r) => r.type !== "idle",
    );

    // Idle: base image is already on R2 CDN — reference directly
    const idlePromise = idleRecord
      ? (async () => {
          const key = generateAvatarKey(
            session.user.id,
            avatarId,
            "expression",
            "idle",
          );
          return { record: idleRecord, publicUrl: baseImageUrl, key };
        })()
      : null;

    // Staggered generation: 500ms between each task submission to avoid rate limits
    const genResults = await staggeredAllSettled(
      toGenerateRecords.map((record) => async () => {
        const result = await adapter.generateExpression({
          baseImageUrl,
          expression: record.type,
          style: a.style as ArtStyle,
          prompt: a.prompt,
        });

        if (result.status !== "completed" || !result.imageUrl) {
          throw new Error(result.error || "Generation failed");
        }

        const key = generateAvatarKey(
          session.user.id,
          avatarId,
          "expression",
          record.type,
        );

        // Fallback providers return temporary upstream URLs — persist to our
        // R2 so the stored URL can't expire if background removal fails.
        const publicUrl = await ensureOwnStorage(result.imageUrl, key);

        return { record, publicUrl, key, provider: result.provider };
      }),
      500,
    );

    // Merge idle result with generation results
    const idleResult = idlePromise
      ? await Promise.allSettled([idlePromise])
      : [];
    const results = [...idleResult, ...genResults];

    // Process results — each result carries its own record reference
    let failedCount = 0;

    for (const result of results) {
      if (result.status === "fulfilled") {
        const { record, publicUrl, key, provider } = result.value as {
          record: (typeof expressionRecords)[number];
          publicUrl: string;
          key: string;
          provider?: string;
        };

        await db
          .update(avatarExpressions)
          .set({
            status: "completed",
            imageUrl: publicUrl,
            imageR2Key: key,
            provider: provider ?? null,
          })
          .where(eq(avatarExpressions.id, record.id));

        record.status = "completed";
        record.imageUrl = publicUrl;
        bgRemovalTasks.push({
          imageUrl: publicUrl,
          r2Key: key,
          expressionId: record.id,
        });
      } else {
        // For failed generation results, find the corresponding record
        // (idle failures won't appear here since idle is a simple copy)
        console.error(`[Packs] Expression generation failed:`, result.reason);
        failedCount++;
      }
    }

    // Mark failed generation records in DB
    if (failedCount > 0) {
      const completedIds = new Set(
        results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value.record.id),
      );
      for (const record of expressionRecords) {
        if (!completedIds.has(record.id) && record.status !== "completed") {
          await db
            .update(avatarExpressions)
            .set({ status: "failed" })
            .where(eq(avatarExpressions.id, record.id));
          record.status = "failed";
        }
      }
    }

    // 9. Refund credits for failed expressions
    if (failedCount > 0) {
      const refundAmount = costPerExpression * failedCount;
      await refundWithUpdate(
        session.user.id,
        refundAmount,
        `Expression pack generation failed - ${failedCount} expression(s) refunded`,
        async (_tx) => {
          return { refunded: true };
        },
        { avatarId, packId, failedCount },
      );
    }

    // 10. Update pack status
    const allFailed = expressionRecords
      .filter((r) => r.type !== "idle")
      .every((r) => r.status === "failed");

    await db
      .update(expressionPacks)
      .set({
        status: allFailed ? "failed" : "completed",
      })
      .where(eq(expressionPacks.id, packId));

    // 11. Async background removal (fire-and-forget after response)
    //     Uploads to new _nobg keys and updates DB to avoid CDN cache issues
    //     Concurrency limited to 3 to avoid API rate limits
    if (bgRemovalTasks.length > 0) {
      after(async () => {
        await processBackgroundRemovalBatch(
          bgRemovalTasks.map((t) => ({
            sourceImageUrl: t.imageUrl,
            r2Key: t.r2Key,
            options: {
              onComplete: async (result) => {
                await db
                  .update(avatarExpressions)
                  .set({
                    imageUrl: result.imageUrl,
                    imageR2Key: result.imageR2Key,
                  })
                  .where(eq(avatarExpressions.id, t.expressionId));
              },
            },
          })),
          3,
        );
      });
    }

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
  } catch (error) {
    console.error(
      "[API] Unhandled error in POST /api/avatars/[id]/packs:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
