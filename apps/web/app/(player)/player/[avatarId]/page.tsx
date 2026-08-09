import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import PlayerClient from "@/components/player/PlayerClient";
import { avatars } from "@/database/schema";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ avatarId: string }>;
}): Promise<Metadata> {
  const { avatarId } = await params;
  const db = getDatabase();

  const rows = await db
    .select({ name: avatars.name })
    .from(avatars)
    .where(and(eq(avatars.id, avatarId), eq(avatars.status, "completed")))
    .limit(1);

  const name = rows[0]?.name ?? "PNGTuber";

  return {
    title: `${name} — PNGTuber Player`,
    robots: { index: false, follow: false },
  };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ avatarId: string }>;
}) {
  const { avatarId } = await params;
  return <PlayerClient avatarId={avatarId} />;
}
