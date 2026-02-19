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
      <div className="group block bg-white rounded-xl border border-gray-200/60 overflow-hidden hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
        <figure className="aspect-square overflow-hidden bg-gray-50">
          {avatar.thumbnailUrl ? (
            <img
              src={avatar.thumbnailUrl}
              alt={avatar.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <span className="text-3xl">🎭</span>
            </div>
          )}
        </figure>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 truncate">{avatar.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {avatar.expressionCount} expression
            {avatar.expressionCount !== 1 ? "s" : ""} · {formattedDate}
          </p>
        </div>
      </div>
    </Link>
  );
}
