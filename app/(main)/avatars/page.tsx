import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { auth } from "@/lib/auth";
import { listUserAvatars } from "@/lib/services/avatars";

export const metadata: Metadata = {
  title: "My Avatars",
  description:
    "Manage your AI-generated PNGTuber avatars and expression packs.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AvatarsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const avatarList = await listUserAvatars(session.user.id).catch(() => []);

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My Avatars" },
          ]}
        />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Avatars</h1>
          <Link
            href="/create"
            className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400"
          >
            <Sparkles className="w-4 h-4" />
            Create New
          </Link>
        </div>

        {avatarList.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No avatars yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Create your first PNGTuber and it will appear here
            </p>
            <Link
              href="/create"
              className="btn border-0 text-white bg-gradient-to-r from-primary to-cyan-400"
            >
              Create PNGTuber
            </Link>
          </div>
        ) : (
          <AvatarGrid avatars={avatarList} />
        )}
      </div>
    </div>
  );
}
