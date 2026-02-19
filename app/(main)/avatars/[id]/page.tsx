import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AvatarDetailClient from "@/components/avatars/AvatarDetailClient";
import { auth } from "@/lib/auth";

interface AvatarDetail {
  id: string;
  name: string;
  prompt: string;
  style: string;
  creditsUsed: number;
  createdAt: string;
}

interface Expression {
  id: string;
  type: string;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl: string | null;
}

async function getAvatar(
  id: string,
): Promise<{ avatar: AvatarDetail; expressions: Expression[] } | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/avatars/${id}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AvatarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getAvatar(id);

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
        <Link
          href="/avatars"
          className="inline-flex items-center gap-2 text-base-content/60 hover:text-base-content mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Avatars
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">{data.avatar.name}</h1>
          <p className="text-base-content/60">
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
        />
      </div>
    </div>
  );
}
