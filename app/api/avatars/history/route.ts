import { desc, eq, inArray } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatarExpressions, avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam
      ? Math.max(1, Math.min(50, Number(limitParam)))
      : 20;

    const db = getDatabase();

    // Fetch recent avatars (ALL statuses, not just completed)
    const userAvatars = await db
      .select({
        id: avatars.id,
        name: avatars.name,
        prompt: avatars.prompt,
        style: avatars.style,
        status: avatars.status,
        candidateImages: avatars.candidateImages,
        baseImageUrl: avatars.baseImageUrl,
        createdAt: avatars.createdAt,
      })
      .from(avatars)
      .where(eq(avatars.userId, session.user.id))
      .orderBy(desc(avatars.createdAt))
      .limit(limit);

    // Batch-fetch expressions for all completed avatars
    const completedIds = userAvatars
      .filter((a) => a.status === "completed")
      .map((a) => a.id);

    const expressionMap: Record<
      string,
      { id: string; type: string; status: string; imageUrl: string | null }[]
    > = {};

    if (completedIds.length > 0) {
      const allExpressions = await db
        .select({
          id: avatarExpressions.id,
          avatarId: avatarExpressions.avatarId,
          type: avatarExpressions.type,
          status: avatarExpressions.status,
          imageUrl: avatarExpressions.imageUrl,
        })
        .from(avatarExpressions)
        .where(inArray(avatarExpressions.avatarId, completedIds));

      // Group by avatarId
      for (const expr of allExpressions) {
        if (!expressionMap[expr.avatarId]) {
          expressionMap[expr.avatarId] = [];
        }
        expressionMap[expr.avatarId].push({
          id: expr.id,
          type: expr.type,
          status: expr.status,
          imageUrl: expr.imageUrl,
        });
      }
    }

    // Shape response
    const history = userAvatars.map((a) => ({
      id: a.id,
      name: a.name,
      prompt: a.prompt,
      style: a.style,
      status: a.status,
      candidateImages: a.candidateImages ?? [],
      baseImageUrl: a.baseImageUrl,
      expressions: expressionMap[a.id] ?? [],
      createdAt: a.createdAt?.toISOString() ?? "",
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching avatar history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
