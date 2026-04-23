import { desc, eq, inArray } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatarExpressions, avatars, expressionPacks } from "@/database/schema";
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
        slug: avatars.slug,
        prompt: avatars.prompt,
        style: avatars.style,
        aspectRatio: avatars.aspectRatio,
        status: avatars.status,
        candidateImages: avatars.candidateImages,
        baseImageUrl: avatars.baseImageUrl,
        referenceSheetUrl: avatars.referenceSheetUrl,
        referenceSheetGeneratedAt: avatars.referenceSheetGeneratedAt,
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
      {
        id: string;
        type: string;
        status: string;
        imageUrl: string | null;
        packId: string | null;
      }[]
    > = {};

    // Pack map: avatarId → packs[]
    const packMap: Record<
      string,
      {
        id: string;
        packType: string;
        subtype: string | null;
        status: string;
        createdAt: string;
        expressions: {
          id: string;
          type: string;
          status: string;
          imageUrl: string | null;
        }[];
      }[]
    > = {};

    if (completedIds.length > 0) {
      // Fetch all expressions (now including packId)
      const allExpressions = await db
        .select({
          id: avatarExpressions.id,
          avatarId: avatarExpressions.avatarId,
          packId: avatarExpressions.packId,
          type: avatarExpressions.type,
          status: avatarExpressions.status,
          imageUrl: avatarExpressions.imageUrl,
        })
        .from(avatarExpressions)
        .where(inArray(avatarExpressions.avatarId, completedIds));

      // Fetch all packs for these avatars
      const allPacks = await db
        .select({
          id: expressionPacks.id,
          avatarId: expressionPacks.avatarId,
          packType: expressionPacks.packType,
          subtype: expressionPacks.subtype,
          status: expressionPacks.status,
          createdAt: expressionPacks.createdAt,
        })
        .from(expressionPacks)
        .where(inArray(expressionPacks.avatarId, completedIds))
        .orderBy(desc(expressionPacks.createdAt));

      // Group expressions by avatarId (for backwards compat — non-pack expressions)
      for (const expr of allExpressions) {
        if (!expressionMap[expr.avatarId]) {
          expressionMap[expr.avatarId] = [];
        }
        expressionMap[expr.avatarId].push({
          id: expr.id,
          type: expr.type,
          status: expr.status,
          imageUrl: expr.imageUrl,
          packId: expr.packId,
        });
      }

      // Build pack objects with nested expressions
      for (const pack of allPacks) {
        if (!packMap[pack.avatarId]) {
          packMap[pack.avatarId] = [];
        }

        const packExpressions = (expressionMap[pack.avatarId] ?? [])
          .filter((e) => e.packId === pack.id)
          .map((e) => ({
            id: e.id,
            type: e.type,
            status: e.status,
            imageUrl: e.imageUrl,
          }));

        packMap[pack.avatarId].push({
          id: pack.id,
          packType: pack.packType,
          subtype: pack.subtype,
          status: pack.status,
          createdAt: pack.createdAt?.toISOString() ?? "",
          expressions: packExpressions,
        });
      }
    }

    // Shape response
    const history = userAvatars.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      prompt: a.prompt,
      style: a.style,
      aspectRatio: a.aspectRatio,
      status: a.status,
      candidateImages: a.candidateImages ?? [],
      baseImageUrl: a.baseImageUrl,
      referenceSheetUrl: a.referenceSheetUrl,
      referenceSheetGeneratedAt:
        a.referenceSheetGeneratedAt?.toISOString() ?? null,
      // Keep flat expressions for backwards compat (non-pack expressions only)
      expressions: (expressionMap[a.id] ?? [])
        .filter((e) => !e.packId)
        .map((e) => ({
          id: e.id,
          type: e.type,
          status: e.status,
          imageUrl: e.imageUrl,
        })),
      packs: packMap[a.id] ?? [],
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
