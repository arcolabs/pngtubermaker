"use client";

import {
  Download,
  Edit2,
  ExternalLink,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Avatar {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  expressionCount: number;
  createdAt: string;
  status?: "draft" | "completed" | "generating";
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

function getStatusBadge(status?: string) {
  switch (status) {
    case "generating":
      return (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
          Generating...
        </span>
      );
    case "draft":
      return (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          Draft
        </span>
      );
    default:
      return (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          Ready
        </span>
      );
  }
}

export default function AvatarCard({ avatar }: AvatarCardProps) {
  const formattedDate = formatRelativeTime(avatar.createdAt);
  const [showMenu, setShowMenu] = useState(false);
  const status = avatar.status || "completed";

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200/60 overflow-hidden hover:shadow-lg hover:border-gray-300/60 transition-all duration-200">
      <Link href={`/avatars/${avatar.id}`}>
        <figure className="aspect-square overflow-hidden bg-gray-50 relative">
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
          {getStatusBadge(status)}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        </figure>
      </Link>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/avatars/${avatar.id}`}>
              <h3 className="font-medium text-gray-900 truncate hover:text-primary transition-colors">
                {avatar.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">
              {avatar.expressionCount} expression
              {avatar.expressionCount !== 1 ? "s" : ""} · {formattedDate}
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 bg-transparent"
                  onClick={() => setShowMenu(false)}
                  aria-label="Close menu"
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <Link
                    href={`/avatars/${avatar.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Details
                  </Link>
                  <Link
                    href={`/avatars/${avatar.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    onClick={() => {
                      setShowMenu(false);
                      // TODO: Implement download
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    onClick={() => {
                      setShowMenu(false);
                      // TODO: Implement delete with confirmation
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
