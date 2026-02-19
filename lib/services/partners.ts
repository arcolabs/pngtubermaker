import { asc, eq } from "drizzle-orm";
import type { Partner } from "@/database/schema";
import { partners } from "@/database/schema";
import { getDatabase } from "@/lib/db";

/** List all active partners, ordered by sortOrder. Used by public page. */
export async function listActivePartners(): Promise<Partner[]> {
  const db = getDatabase();
  return db
    .select()
    .from(partners)
    .where(eq(partners.isActive, true))
    .orderBy(asc(partners.sortOrder), asc(partners.name));
}

/** List ALL partners (including inactive). Used by admin. */
export async function listAllPartners(): Promise<Partner[]> {
  const db = getDatabase();
  return db
    .select()
    .from(partners)
    .orderBy(asc(partners.sortOrder), asc(partners.name));
}

/** Get single partner by ID. */
export async function getPartner(id: string): Promise<Partner | null> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(partners)
    .where(eq(partners.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Create a new partner. Returns the created record. */
export async function createPartner(data: {
  name: string;
  url: string;
  description?: string;
  logoUrl?: string;
  logoR2Key?: string;
  badgeHtml?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<Partner> {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const rows = await db
    .insert(partners)
    .values({ id, ...data })
    .returning();
  return rows[0];
}

/** Update an existing partner. Returns the updated record. */
export async function updatePartner(
  id: string,
  data: Partial<{
    name: string;
    url: string;
    description: string | null;
    logoUrl: string | null;
    logoR2Key: string | null;
    badgeHtml: string | null;
    sortOrder: number;
    isActive: boolean;
  }>,
): Promise<Partner | null> {
  const db = getDatabase();
  const rows = await db
    .update(partners)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(partners.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Delete a partner by ID. */
export async function deletePartner(id: string): Promise<void> {
  const db = getDatabase();
  await db.delete(partners).where(eq(partners.id, id));
}
