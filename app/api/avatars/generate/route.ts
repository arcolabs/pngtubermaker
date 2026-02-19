import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  consumeCredits,
  refundCredits,
  TASK_COSTS,
} from "@/lib/services/credits";
import { type ArtStyle, getGenerationAdapter } from "@/lib/services/generation";

/**
 * POST /api/avatars/generate
 *
 * Generate 4 candidate character images from a text prompt.
 * This is the reference API implementation — other endpoints follow this pattern.
 *
 * Auth: Required
 * Body: { prompt: string, style: 'anime' | 'chibi' }
 * Cost: 300 credits (TASK_COSTS.avatar_generation)
 * Returns: { avatarId: string, images: string[] }
 */
export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Parse & validate body
  let body: { prompt: string; style: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt, style } = body;

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

  if (!style || !["anime", "chibi"].includes(style)) {
    return NextResponse.json(
      { error: "Style must be 'anime' or 'chibi'" },
      { status: 400 },
    );
  }

  // 3. Consume credits
  const cost = TASK_COSTS.avatar_generation;
  const consumeResult = await consumeCredits(
    userId,
    cost,
    `Character generation: ${style}`,
    { taskType: "avatar_generation" },
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

  // 4. Create avatar record (status: generating)
  const db = getDatabase();
  const avatarId = crypto.randomUUID();

  await db.insert(avatars).values({
    id: avatarId,
    userId,
    name: "My PNGTuber",
    prompt: prompt.trim(),
    style: style as ArtStyle,
    status: "generating",
    creditsUsed: cost,
  });

  // 5. Call generation adapter
  try {
    const adapter = getGenerationAdapter();
    const result = await adapter.generateCharacter({
      prompt: prompt.trim(),
      style: style as ArtStyle,
    });

    if (result.status === "failed" || result.images.length === 0) {
      // Generation failed — refund credits and update status
      await refundCredits(
        userId,
        cost,
        "Character generation failed — refund",
        {
          avatarId,
        },
      );

      await db
        .update(avatars)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(avatars.id, avatarId));

      return NextResponse.json(
        { error: result.error || "Generation failed" },
        { status: 500 },
      );
    }

    // 6. Update avatar with candidate images
    await db
      .update(avatars)
      .set({
        candidateImages: result.images,
        status: "selecting",
        updatedAt: new Date(),
      })
      .where(eq(avatars.id, avatarId));

    return NextResponse.json({
      avatarId,
      images: result.images,
    });
  } catch (error) {
    // Unexpected error — refund and fail
    console.error("Avatar generation error:", error);

    await refundCredits(userId, cost, "Character generation error — refund", {
      avatarId,
    });

    await db
      .update(avatars)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(avatars.id, avatarId));

    return NextResponse.json(
      { error: "Generation failed unexpectedly" },
      { status: 500 },
    );
  }
}
