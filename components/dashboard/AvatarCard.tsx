"use client";

import {
  Download,
  Edit2,
  ExternalLink,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Avatar {
  id: string;
  name: string;
  slug?: string | null;
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
  const router = useRouter();
  const formattedDate = formatRelativeTime(avatar.createdAt);
  const [showMenu, setShowMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const status = avatar.status || "completed";
  const avatarPath = `/avatars/${avatar.slug || avatar.id}`;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/avatars/${avatar.id}/download?format=zip`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = avatar.name.replace(/\s+/g, "_");
      a.download = `${name}_pngtuber.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/avatars/${avatar.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
      <Link
        href={`/avatars/${avatar.slug || avatar.id}`}
        className="block w-full h-full"
      >
        <figure className="w-full h-full overflow-hidden bg-gray-50 relative">
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

          {/* Glassmorphism Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-md border-t border-white/10 p-3 transform translate-y-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white truncate text-sm">
                  {avatar.name}
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  {avatar.expressionCount} expression
                  {avatar.expressionCount !== 1 ? "s" : ""} · {formattedDate}
                </p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10 bg-transparent cursor-default"
                      onClick={() => setShowMenu(false)}
                      aria-label="Close menu"
                    />
                    <div className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMenu(false);
                          router.push(avatarPath);
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMenu(false);
                          router.push(`${avatarPath}/edit`);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left disabled:opacity-50"
                        disabled={isDownloading}
                        onClick={handleDownload}
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isDownloading ? "Downloading..." : "Download"}
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMenu(false);
                          setShowDeleteConfirm(true);
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
        </figure>
      </Link>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: modal backdrop dismiss
        // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDeleting) setShowDeleteConfirm(false);
          }}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation only */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: modal content */}
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Delete &quot;{avatar.name}&quot;?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete this avatar and all its expressions.
              Credits used will not be refunded.
            </p>
            <div className="mt-4 flex gap-3 justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
