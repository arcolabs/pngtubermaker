import { and, count, desc, eq } from "drizzle-orm";
import { avatarExpressions, avatars } from "@/database/schema";
import { getDatabase } from "@/lib/db";

export interface AvatarSummary {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  expressionCount: number;
  createdAt: string;
}

/**
 * List a user's completed avatars with expression counts.
 * Shared by dashboard page, avatars page, and GET /api/avatars.
 */
export async function listUserAvatars(
  userId: string,
  limit?: number,
): Promise<AvatarSummary[]> {
  const db = getDatabase();

  let query = db
    .select({
      id: avatars.id,
      name: avatars.name,
      thumbnailUrl: avatars.thumbnailUrl,
      createdAt: avatars.createdAt,
    })
    .from(avatars)
    .where(and(eq(avatars.userId, userId), eq(avatars.status, "completed")))
    .orderBy(desc(avatars.createdAt));

  if (limit) {
    query = query.limit(limit) as typeof query;
  }

  const userAvatars = await query;

  const result: AvatarSummary[] = [];
  for (const a of userAvatars) {
    const exprCount = await db
      .select({ count: count() })
      .from(avatarExpressions)
      .where(eq(avatarExpressions.avatarId, a.id));

    result.push({
      id: a.id,
      name: a.name,
      thumbnailUrl: a.thumbnailUrl,
      expressionCount: exprCount[0]?.count ?? 0,
      createdAt: a.createdAt?.toISOString() ?? "",
    });
  }

  return result;
}
