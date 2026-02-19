"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import AvatarCard from "./AvatarCard";
import EmptyState from "./EmptyState";

interface Avatar {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  expressionCount: number;
  createdAt: string;
}

interface AvatarGridProps {
  avatars: Avatar[];
  loading?: boolean;
}

export default function AvatarGrid({
  avatars,
  loading = false,
}: AvatarGridProps) {
  const showCreateCard = !loading && avatars.length > 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card bg-base-200 animate-pulse">
            <div className="aspect-square bg-base-300 rounded-t-xl" />
            <div className="card-body p-4">
              <div className="h-4 w-24 bg-base-content/10 rounded" />
              <div className="h-3 w-16 bg-base-content/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (avatars.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {avatars.slice(0, 6).map((avatar) => (
          <AvatarCard
            key={avatar.id}
            avatar={{ ...avatar, status: "completed" }}
          />
        ))}

        {showCreateCard && (
          <Link href="/create">
            <div className="card bg-base-200 border-2 border-dashed border-base-content/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 min-h-[280px]">
              <div className="card-body items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <span className="text-base-content/60">Create New</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {avatars.length > 6 && (
        <div className="text-center mt-6">
          <Link href="/avatars" className="btn btn-ghost">
            View All →
          </Link>
        </div>
      )}
    </div>
  );
}
