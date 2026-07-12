import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { processBackgroundRemoval } from "@/lib/services/background-removal";
import { refundCredits } from "@/lib/services/credits";
import {
  fetchImageBuffer,
  generateAvatarKey,
  generateThumbnail,
  uploadImageToR2,
} from "@/lib/services/storage";
import { generateAvatarName, generateSlug } from "@/lib/utils";

/**
 * POST /api/avatars/[id]/select
 *
 * Select one of the candidate images as the base character.
 * Deletes unselected images, generates thumbnail, updates avatar status.
 *
 * Auth: Required (must own avatar)
 * Body: { selectedIndex: number }
 * Cost: 0 credits (free)
 *
 * Response: { avatarId, baseImageUrl, thumbnailUrl }
 */

const selectSchema = z.object({
  selectedIndex: z.number().int().min(0),
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

  const parseResult = selectSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const { selectedIndex } = parseResult.data;

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

  // 4. Verify avatar is in 'selecting' status and has candidate images
  if (
    a.status !== "selecting" ||
    !a.candidateImages ||
    a.candidateImages.length === 0
  ) {
    return NextResponse.json(
      { error: "Avatar not ready for selection" },
      { status: 400 },
    );
  }

  // 5. Get selected image URL and fetch it
  const selectedImageUrl = a.candidateImages[selectedIndex];
  if (!selectedImageUrl) {
    return NextResponse.json(
      { error: "Invalid selected index" },
      { status: 400 },
    );
  }

  try {
    // 6. Fetch the selected image (with retry). Candidates are upstream
    // temporary URLs — if the user returns after they expired, the fetch
    // fails: refund the generation cost and let them regenerate.
    let imageBuffer: Buffer;
    try {
      imageBuffer = await fetchImageBuffer(selectedImageUrl);
    } catch (fetchError) {
      console.warn(
        `[Select] Candidate fetch failed (likely expired): ${selectedImageUrl}`,
        fetchError instanceof Error ? fetchError.message : fetchError,
      );
      if (a.creditsUsed > 0) {
        await refundCredits(
          session.user.id,
          a.creditsUsed,
          "Candidate images expired — generation refunded",
          { avatarId },
        );
      }
      await db
        .update(avatars)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(avatars.id, avatarId));
      return NextResponse.json(
        {
          error: "candidates_expired",
          message:
            "These candidate images have expired. Your credits have been refunded — please generate your character again.",
        },
        { status: 410 },
      );
    }

    // 7. Upload base image to R2
    const baseKey = generateAvatarKey(session.user.id, avatarId, "base");
    const baseImageUrl = await uploadImageToR2(
      imageBuffer,
      baseKey,
      "image/png",
    );

    // 8. Generate and upload thumbnail
    const thumbnailBuffer = await generateThumbnail(imageBuffer);
    const thumbnailKey = generateAvatarKey(
      session.user.id,
      avatarId,
      "thumbnail",
    );
    const thumbnailUrl = await uploadImageToR2(
      thumbnailBuffer,
      thumbnailKey,
      "image/png",
    );

    // 9. Keep all candidate images in R2 for history display

    // 10. Generate unique name and slug from prompt
    const avatarName = generateAvatarName(a.prompt);
    const slug = generateSlug(avatarName);

    // 10.5. Record which candidate/provider the user selected. This is the
    //       only signal for evaluating the model mix (byteplus-lite vs
    //       piapi-lite vs qwen), so persist it on metadata (no schema
    //       change). candidateProviders is aligned with candidateImages.
    const selectedProvider = a.candidateProviders?.[selectedIndex] ?? null;
    const existingMetadata =
      (a.metadata as Record<string, unknown> | null) ?? {};
    const updatedMetadata = {
      ...existingMetadata,
      selectedIndex,
      ...(selectedProvider ? { selectedProvider } : {}),
    };

    // 11. Update avatar record (save original URLs for AI generation input)
    await db
      .update(avatars)
      .set({
        name: avatarName,
        slug,
        baseImageUrl,
        baseImageR2Key: baseKey,
        originalBaseImageUrl: baseImageUrl,
        originalBaseImageR2Key: baseKey,
        thumbnailUrl,
        thumbnailR2Key: thumbnailKey,
        status: "completed",
        metadata: updatedMetadata,
        updatedAt: new Date(),
      })
      .where(eq(avatars.id, avatarId));

    // 12. Async background removal (fire-and-forget after response)
    //     Uploads to new _nobg keys and updates DB to avoid CDN cache issues
    after(async () => {
      await processBackgroundRemoval(baseImageUrl, baseKey, {
        thumbnailR2Key: thumbnailKey,
        onComplete: async (result) => {
          await db
            .update(avatars)
            .set({
              baseImageUrl: result.imageUrl,
              baseImageR2Key: result.imageR2Key,
              ...(result.thumbnailUrl && {
                thumbnailUrl: result.thumbnailUrl,
                thumbnailR2Key: result.thumbnailR2Key,
              }),
            })
            .where(eq(avatars.id, avatarId));
        },
      });
    });

    // 13. Return response
    return NextResponse.json({
      avatarId,
      slug,
      name: avatarName,
      baseImageUrl,
      thumbnailUrl,
    });
  } catch (error) {
    console.error("[Select] Error processing selection:", error);
    return NextResponse.json(
      { error: "Failed to process selection" },
      { status: 500 },
    );
  }
}
