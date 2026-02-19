import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatarExpressions, avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { deleteFromR2 } from "@/lib/services/storage";

/**
 * GET /api/avatars/[id]
 *
 * Get a single avatar with its expressions.
 *
 * Auth: Required (must own avatar)
 * Response: { avatar: { id, name, prompt, style, creditsUsed, createdAt }, expressions: [...] }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: avatarId } = await params;
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

    const expressions = await db
      .select({
        id: avatarExpressions.id,
        type: avatarExpressions.type,
        status: avatarExpressions.status,
        imageUrl: avatarExpressions.imageUrl,
      })
      .from(avatarExpressions)
      .where(eq(avatarExpressions.avatarId, avatarId));

    return NextResponse.json({
      avatar: {
        id: a.id,
        name: a.name,
        prompt: a.prompt,
        style: a.style,
        baseImageUrl: a.baseImageUrl,
        thumbnailUrl: a.thumbnailUrl,
        creditsUsed: a.creditsUsed,
        createdAt: a.createdAt,
      },
      expressions,
    });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/avatars/[id]
 *
 * Delete an avatar, its expressions, and clean up R2 storage.
 * DB cascade handles expression row deletion; R2 keys are cleaned up manually.
 *
 * Auth: Required (must own avatar)
 * Response: { success: true }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: avatarId } = await params;
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

    // Clean up R2 keys for expressions
    const expressions = await db
      .select({ imageR2Key: avatarExpressions.imageR2Key })
      .from(avatarExpressions)
      .where(eq(avatarExpressions.avatarId, avatarId));

    for (const expr of expressions) {
      if (expr.imageR2Key) {
        await deleteFromR2(expr.imageR2Key);
      }
    }

    // Clean up R2 keys for the avatar itself
    if (a.baseImageR2Key) {
      await deleteFromR2(a.baseImageR2Key);
    }
    if (a.thumbnailR2Key) {
      await deleteFromR2(a.thumbnailR2Key);
    }

    // Delete avatar (cascade deletes expressions in DB)
    await db.delete(avatars).where(eq(avatars.id, avatarId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 },
    );
  }
}
