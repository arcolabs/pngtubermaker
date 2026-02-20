import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  deleteFromR2,
  generateAvatarKey,
  generateThumbnail,
  uploadImageToR2,
} from "@/lib/services/storage";
import { generateAvatarName, generateSlug } from "@/lib/utils";

/**
 * POST /api/avatars/[id]/select
 *
 * Select one of 4 candidate images as the base character.
 * Deletes unselected images, generates thumbnail, updates avatar status.
 *
 * Auth: Required (must own avatar)
 * Body: { selectedIndex: number }  // 0-3
 * Cost: 0 credits (free)
 *
 * Response: { avatarId, baseImageUrl, thumbnailUrl }
 */

const selectSchema = z.object({
  selectedIndex: z.number().int().min(0).max(3),
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
    a.candidateImages.length !== 4
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
    // 6. Fetch the selected image
    const imageResponse = await fetch(selectedImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

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

    // 9. Delete unselected candidate images from R2
    const unselectedIndices = [0, 1, 2, 3].filter((i) => i !== selectedIndex);
    for (const index of unselectedIndices) {
      const candidateUrl = a.candidateImages[index];
      if (candidateUrl) {
        // Extract key from URL and delete
        try {
          const url = new URL(candidateUrl);
          const key = url.pathname.slice(1); // Remove leading /
          await deleteFromR2(key);
        } catch {
          console.warn(
            `[Select] Failed to delete candidate ${index}: ${candidateUrl}`,
          );
        }
      }
    }

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

    // 12. Return response
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
