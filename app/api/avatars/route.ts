import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUserAvatars } from "@/lib/services/avatars";

/**
 * GET /api/avatars?limit=N
 *
 * List the current user's completed avatars with expression counts.
 * Optional ?limit=N query param (e.g. dashboard uses limit=6).
 *
 * Auth: Required
 * Response: { avatars: [{ id, name, thumbnailUrl, expressionCount, createdAt }] }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam
      ? Math.max(1, Math.min(100, Number(limitParam)))
      : 50;

    const avatars = await listUserAvatars(session.user.id, limit);

    return NextResponse.json({ avatars });
  } catch (error) {
    console.error("Error listing avatars:", error);
    return NextResponse.json(
      { error: "Failed to list avatars" },
      { status: 500 },
    );
  }
}
