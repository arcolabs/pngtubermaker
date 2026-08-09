import { asc, eq } from "drizzle-orm";
import type { Badge } from "@/database/schema";
import { badges } from "@/database/schema";
import { getDatabase } from "@/lib/db";

/** List all active badges, ordered by sortOrder. Used by public footer. */
export async function listActiveBadges(): Promise<Badge[]> {
  const db = getDatabase();
  return db
    .select()
    .from(badges)
    .where(eq(badges.isActive, true))
    .orderBy(asc(badges.sortOrder), asc(badges.name));
}

/** List ALL badges (including inactive). Used by admin. */
export async function listAllBadges(): Promise<Badge[]> {
  const db = getDatabase();
  return db
    .select()
    .from(badges)
    .orderBy(asc(badges.sortOrder), asc(badges.name));
}

/** Get single badge by ID. */
export async function getBadge(id: string): Promise<Badge | null> {
  const db = getDatabase();
  const rows = await db.select().from(badges).where(eq(badges.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Create a new badge. Returns the created record. */
export async function createBadge(data: {
  name: string;
  url: string;
  imageUrl: string;
  altText: string;
  width?: number;
  height?: number;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<Badge> {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const rows = await db
    .insert(badges)
    .values({ id, ...data })
    .returning();
  return rows[0];
}

/** Update an existing badge. Returns the updated record. */
export async function updateBadge(
  id: string,
  data: Partial<{
    name: string;
    url: string;
    imageUrl: string;
    altText: string;
    width: number;
    height: number;
    sortOrder: number;
    isActive: boolean;
  }>,
): Promise<Badge | null> {
  const db = getDatabase();
  const rows = await db
    .update(badges)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(badges.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Delete a badge by ID. */
export async function deleteBadge(id: string): Promise<void> {
  const db = getDatabase();
  await db.delete(badges).where(eq(badges.id, id));
}
