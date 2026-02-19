"use client";

import { Download, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Expression {
  id: string;
  type: string;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl: string | null;
}

interface AvatarDetailClientProps {
  avatar: {
    id: string;
    name: string;
    prompt: string;
    style: string;
    creditsUsed: number;
    createdAt: string;
  };
  expressions: Expression[];
}

const expressionLabels: Record<string, string> = {
  idle: "Idle",
  talking: "Talking",
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  surprised: "Surprised",
};

export default function AvatarDetailClient({
  avatar,
  expressions: initialExpressions,
}: AvatarDetailClientProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(1080);
  const [downloading, setDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expressions] = useState(initialExpressions);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = `/api/avatars/${avatar.id}/download?format=zip&size=${selectedSize}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = `${avatar.name}.zip`;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/avatars/${avatar.id}`, {
      method: "DELETE",
    });
    router.push("/avatars");
  };

  const handleAddExpression = () => {
    // TODO: Open expression selection modal
    console.log("Add expression");
  };

  const existingTypes = new Set(expressions.map((e) => e.type));
  const canAddMore = existingTypes.size < 6;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="w-4 h-4" />
          {downloading ? "Preparing..." : "Download ZIP"}
        </button>

        <select
          className="select select-bordered select-sm"
          value={selectedSize}
          onChange={(e) => setSelectedSize(Number(e.target.value))}
        >
          <option value={512}>512x512 (Free)</option>
          <option value={1080}>1080x1080 (Start+)</option>
          <option value={2160}>2160x2160 (Pro)</option>
        </select>

        {canAddMore && (
          <button
            type="button"
            className="btn btn-outline btn-sm gap-1"
            onClick={handleAddExpression}
          >
            <Plus className="w-4 h-4" />
            Add Expression
          </button>
        )}

        <button
          type="button"
          className="btn btn-outline btn-sm btn-error gap-1"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {expressions.map((expression) => (
          <div key={expression.id} className="space-y-2">
            <div className="aspect-square rounded-xl overflow-hidden bg-base-200 relative">
              {expression.status === "completed" && expression.imageUrl ? (
                <img
                  src={expression.imageUrl}
                  alt={expressionLabels[expression.type] || expression.type}
                  className="w-full h-full object-cover"
                />
              ) : expression.status === "generating" ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-base-content/30">
                  <span className="text-2xl">⏳</span>
                </div>
              )}
            </div>
            <p className="text-center text-sm capitalize">
              {expressionLabels[expression.type] || expression.type}
            </p>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div>
        <h3 className="font-semibold mb-4">Generation Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-base-content/60">Prompt</dt>
            <dd className="mt-1">{avatar.prompt}</dd>
          </div>
          <div>
            <dt className="text-base-content/60">Style</dt>
            <dd className="mt-1 capitalize">{avatar.style}</dd>
          </div>
          <div>
            <dt className="text-base-content/60">Credits used</dt>
            <dd className="mt-1">{avatar.creditsUsed.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-base-content/60">Created</dt>
            <dd className="mt-1">{formatDate(avatar.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <dialog className={`modal ${showDeleteConfirm ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Avatar?</h3>
          <p className="py-4">
            Delete {avatar.name}? This action cannot be undone. Credits will not
            be refunded.
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button
                type="button"
                className="btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </form>
            <button
              type="button"
              className="btn btn-error"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => setShowDeleteConfirm(false)}>
            close
          </button>
        </form>
      </dialog>
    </div>
  );
}
