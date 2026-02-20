import { and, asc, eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AvatarDetailClient from "@/components/avatars/AvatarDetailClient";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { avatarExpressions, avatars, expressionPacks } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

async function getAvatar(idOrSlug: string, userId: string) {
  const db = getDatabase();

  // Look up by slug first, fall back to id (supports both UUID and slug URLs)
  const rows = await db
    .select()
    .from(avatars)
    .where(
      and(
        or(eq(avatars.slug, idOrSlug), eq(avatars.id, idOrSlug)),
        eq(avatars.userId, userId),
      ),
    )
    .limit(1);

  if (rows.length === 0) return null;
  const a = rows[0];

  const expressions = await db
    .select({
      id: avatarExpressions.id,
      type: avatarExpressions.type,
      status: avatarExpressions.status,
      imageUrl: avatarExpressions.imageUrl,
      packId: avatarExpressions.packId,
    })
    .from(avatarExpressions)
    .where(eq(avatarExpressions.avatarId, a.id));

  const packs = await db
    .select({
      id: expressionPacks.id,
      packType: expressionPacks.packType,
      subtype: expressionPacks.subtype,
      status: expressionPacks.status,
      createdAt: expressionPacks.createdAt,
    })
    .from(expressionPacks)
    .where(eq(expressionPacks.avatarId, a.id))
    .orderBy(asc(expressionPacks.createdAt));

  // Cast status to expected union type (DB stores as text)
  type ExpressionStatus = "pending" | "generating" | "completed" | "failed";
  const typedExpressions = expressions.map((e) => ({
    ...e,
    status: e.status as ExpressionStatus,
  }));

  const packsWithExpressions = packs.map((pack) => ({
    ...pack,
    createdAt: pack.createdAt.toISOString(),
    expressions: typedExpressions.filter((e) => e.packId === pack.id),
  }));

  const legacyExpressions = typedExpressions.filter((e) => !e.packId);

  return {
    avatar: {
      id: a.id,
      name: a.name,
      prompt: a.prompt,
      style: a.style,
      baseImageUrl: a.baseImageUrl,
      thumbnailUrl: a.thumbnailUrl,
      creditsUsed: a.creditsUsed,
      createdAt: a.createdAt.toISOString(),
    },
    expressions: legacyExpressions,
    packs: packsWithExpressions,
  };
}

export default async function AvatarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getAvatar(id, session.user.id);

  if (!data) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Avatar not found</h1>
          <Link href="/avatars" className="btn btn-primary">
            Back to My Avatars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "My Avatars", href: "/avatars" },
            { label: data.avatar.name },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {data.avatar.name}
          </h1>
          <p className="text-gray-500">
            Created{" "}
            {new Date(data.avatar.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <AvatarDetailClient
          avatar={data.avatar}
          expressions={data.expressions}
          packs={data.packs ?? []}
        />
      </div>
    </div>
  );
}
