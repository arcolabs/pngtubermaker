import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatarExpressions, avatars } from "@/database/schema";
import { getDatabase } from "@/lib/db";

/**
 * GET /api/avatars/[id]/public
 *
 * Public (unauthenticated) endpoint that returns avatar expression data
 * for the OBS Browser Source player page.
 *
 * Security: avatarId is a UUID — not guessable. No auth required.
 * Only returns completed avatars with completed expressions.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDatabase();

  // Look up avatar by id or slug, only if completed
  const rows = await db
    .select({
      id: avatars.id,
      name: avatars.name,
      baseImageUrl: avatars.baseImageUrl,
    })
    .from(avatars)
    .where(and(eq(avatars.id, id), eq(avatars.status, "completed")))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  const avatar = rows[0];

  // Get all completed expressions with an image URL
  const exprs = await db
    .select({
      type: avatarExpressions.type,
      imageUrl: avatarExpressions.imageUrl,
    })
    .from(avatarExpressions)
    .where(
      and(
        eq(avatarExpressions.avatarId, avatar.id),
        eq(avatarExpressions.status, "completed"),
      ),
    );

  // Build flat expression list; use baseImageUrl as idle fallback
  const seen = new Set<string>();
  const expressions: { type: string; url: string }[] = [];

  if (avatar.baseImageUrl) {
    expressions.push({ type: "idle", url: avatar.baseImageUrl });
    seen.add("idle");
  }

  for (const expr of exprs) {
    if (expr.imageUrl && !seen.has(expr.type)) {
      seen.add(expr.type);
      expressions.push({ type: expr.type, url: expr.imageUrl });
    }
  }

  return NextResponse.json(
    {
      avatarId: avatar.id,
      name: avatar.name,
      expressions,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
