"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import { authClient } from "@/lib/auth-client";

interface Avatar {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  expressionCount: number;
  createdAt: string;
}

export default function AvatarsPage() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const res = await fetch("/api/avatars");
        if (res.ok) {
          const data = await res.json();
          setAvatars(data.avatars || []);
        }
      } catch (error) {
        console.error("Failed to fetch avatars:", error);
      } finally {
        setLoading(false);
      }
    };

    authClient.getSession().then((session) => {
      if (!session) {
        router.push("/login");
      } else {
        fetchAvatars();
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="skeleton h-8 w-32 mb-8" />
          <AvatarGrid avatars={[]} loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">My Avatars</h1>
          <Link href="/create" className="btn btn-primary btn-sm gap-2">
            <Sparkles className="w-4 h-4" />
            Create New
          </Link>
        </div>

        {avatars.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No avatars yet</h3>
            <p className="text-base-content/60 max-w-md mx-auto mb-6">
              Create your first PNGTuber and it will appear here
            </p>
            <Link href="/create" className="btn btn-primary">
              Create PNGTuber
            </Link>
          </div>
        ) : (
          <AvatarGrid avatars={avatars} />
        )}
      </div>
    </div>
  );
}
