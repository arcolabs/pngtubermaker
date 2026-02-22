import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { processBackgroundRemoval } from "@/lib/services/background-removal";
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
    // 6. Fetch the selected image (with retry)
    const imageBuffer = await fetchImageBuffer(selectedImageUrl);

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

    // 11. Update avatar record
    await db
      .update(avatars)
      .set({
        name: avatarName,
        slug,
        baseImageUrl,
        baseImageR2Key: baseKey,
        thumbnailUrl,
        thumbnailR2Key: thumbnailKey,
        status: "completed",
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
