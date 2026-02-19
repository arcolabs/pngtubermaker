"use client";

import Link from "next/link";

interface Avatar {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  expressionCount: number;
  createdAt: string;
}

interface AvatarCardProps {
  avatar: Avatar;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AvatarCard({ avatar }: AvatarCardProps) {
  const formattedDate = formatRelativeTime(avatar.createdAt);

  return (
    <Link href={`/avatars/${avatar.id}`}>
      <div className="group card bg-base-200 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <figure className="aspect-square overflow-hidden rounded-t-xl bg-base-300">
          {avatar.thumbnailUrl ? (
            <img
              src={avatar.thumbnailUrl}
              alt={avatar.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/30">
              <span className="text-4xl">🎭</span>
            </div>
          )}
        </figure>
        <div className="card-body p-3 sm:p-4">
          <h3 className="card-title text-base truncate">{avatar.name}</h3>
          <p className="text-sm text-base-content/60">
            {avatar.expressionCount} expression
            {avatar.expressionCount !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-base-content/40">{formattedDate}</p>
        </div>
      </div>
    </Link>
  );
}
