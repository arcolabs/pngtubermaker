import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatarExpressions, avatars } from "@/database/schema";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { removeBackground } from "@/lib/services/background-removal";
import {
  deleteFromR2,
  generateThumbnail,
  uploadImageToR2,
} from "@/lib/services/storage";

/** Derive a `_nobg` R2 key from the original to avoid CDN cache hits. */
function toNoBgKey(key: string): string {
  // If already _nobg, keep the same key pattern
  if (key.includes("_nobg")) return key;
  return key.replace(/\.png$/, "_nobg.png");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;

  let body: { imageId: string; kind: "base" | "expression" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { imageId, kind } = body;
  if (!imageId || !kind) {
    return NextResponse.json(
      { error: "Missing imageId or kind" },
      { status: 400 },
    );
  }

  const db = getDatabase();

  try {
    if (kind === "base") {
      // Find the avatar belonging to this user
      const [avatar] = await db
        .select()
        .from(avatars)
        .where(eq(avatars.id, imageId))
        .limit(1);

      if (!avatar || avatar.userId !== userId) {
        return NextResponse.json(
          { error: "Avatar not found" },
          { status: 404 },
        );
      }

      if (!avatar.baseImageUrl || !avatar.baseImageR2Key) {
        return NextResponse.json(
          { error: "Avatar has no base image" },
          { status: 400 },
        );
      }

      // Remove background
      const processedBuffer = await removeBackground(avatar.baseImageUrl);

      // Upload to new key
      const newR2Key = toNoBgKey(avatar.baseImageR2Key);
      const newImageUrl = await uploadImageToR2(
        processedBuffer,
        newR2Key,
        "image/png",
      );

      // Generate and upload thumbnail
      let newThumbnailUrl: string | undefined;
      let newThumbnailR2Key: string | undefined;
      if (avatar.thumbnailR2Key) {
        const thumbnailBuffer = await generateThumbnail(processedBuffer);
        newThumbnailR2Key = toNoBgKey(avatar.thumbnailR2Key);
        newThumbnailUrl = await uploadImageToR2(
          thumbnailBuffer,
          newThumbnailR2Key,
          "image/png",
        );
      }

      // Delete old files if keys changed
      if (newR2Key !== avatar.baseImageR2Key) {
        await deleteFromR2(avatar.baseImageR2Key);
      }
      if (
        avatar.thumbnailR2Key &&
        newThumbnailR2Key &&
        newThumbnailR2Key !== avatar.thumbnailR2Key
      ) {
        await deleteFromR2(avatar.thumbnailR2Key);
      }

      // Update DB
      await db
        .update(avatars)
        .set({
          baseImageUrl: newImageUrl,
          baseImageR2Key: newR2Key,
          ...(newThumbnailUrl ? { thumbnailUrl: newThumbnailUrl } : {}),
          ...(newThumbnailR2Key ? { thumbnailR2Key: newThumbnailR2Key } : {}),
        })
        .where(eq(avatars.id, imageId));

      return NextResponse.json({
        success: true,
        imageUrl: newImageUrl,
      });
    }

    if (kind === "expression") {
      // Find the expression and verify it belongs to this user's avatar
      const [expression] = await db
        .select({
          id: avatarExpressions.id,
          imageUrl: avatarExpressions.imageUrl,
          imageR2Key: avatarExpressions.imageR2Key,
          avatarId: avatarExpressions.avatarId,
        })
        .from(avatarExpressions)
        .where(eq(avatarExpressions.id, imageId))
        .limit(1);

      if (!expression) {
        return NextResponse.json(
          { error: "Expression not found" },
          { status: 404 },
        );
      }

      // Verify ownership
      const [avatar] = await db
        .select({ userId: avatars.userId })
        .from(avatars)
        .where(eq(avatars.id, expression.avatarId))
        .limit(1);

      if (!avatar || avatar.userId !== userId) {
        return NextResponse.json(
          { error: "Expression not found" },
          { status: 404 },
        );
      }

      if (!expression.imageUrl || !expression.imageR2Key) {
        return NextResponse.json(
          { error: "Expression has no image" },
          { status: 400 },
        );
      }

      // Remove background
      const processedBuffer = await removeBackground(expression.imageUrl);

      // Upload to new key
      const newR2Key = toNoBgKey(expression.imageR2Key);
      const newImageUrl = await uploadImageToR2(
        processedBuffer,
        newR2Key,
        "image/png",
      );

      // Delete old file if key changed
      if (newR2Key !== expression.imageR2Key) {
        await deleteFromR2(expression.imageR2Key);
      }

      // Update DB
      await db
        .update(avatarExpressions)
        .set({
          imageUrl: newImageUrl,
          imageR2Key: newR2Key,
        })
        .where(eq(avatarExpressions.id, imageId));

      return NextResponse.json({
        success: true,
        imageUrl: newImageUrl,
      });
    }

    return NextResponse.json(
      { error: "Invalid kind. Must be 'base' or 'expression'" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[Admin] Remove background failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Background removal failed",
      },
      { status: 500 },
    );
  }
}
