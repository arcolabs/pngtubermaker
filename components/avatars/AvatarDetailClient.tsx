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
  const [expressions, setExpressions] = useState(initialExpressions);
  const [addingExpression, setAddingExpression] = useState(false);

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

  const handleAddExpression = async (types: string[]) => {
    if (!types.length) return;
    setAddingExpression(true);

    try {
      const res = await fetch(`/api/avatars/${avatar.id}/expressions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expressions: types }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "insufficient_credits") {
          alert(
            `Not enough credits. Balance: ${data.balance}, Required: ${data.required}`,
          );
          return;
        }
        throw new Error(data.error || "Failed to generate expressions");
      }

      const data = await res.json();
      setExpressions((prev) => [...prev, ...data.expressions]);
    } catch (error) {
      console.error("Failed to add expression:", error);
      alert(
        error instanceof Error ? error.message : "Failed to add expression",
      );
    } finally {
      setAddingExpression(false);
    }
  };

  const existingTypes = new Set(expressions.map((e) => e.type));
  const availableTypes = [
    "idle",
    "talking",
    "happy",
    "sad",
    "angry",
    "surprised",
  ].filter((t) => !existingTypes.has(t));
  const canAddMore = availableTypes.length > 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Download</h3>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="select select-bordered select-sm bg-white"
            value={selectedSize}
            onChange={(e) => setSelectedSize(Number(e.target.value))}
          >
            <option value={512}>512×512</option>
            <option value={1080}>1080×1080</option>
            <option value={2160}>2160×2160 (4K)</option>
          </select>
          <button
            type="button"
            className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="w-4 h-4" />
            {downloading ? "Preparing..." : "Download ZIP"}
          </button>
          {canAddMore && (
            <div className="dropdown dropdown-bottom">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-sm btn-outline border-gray-200 hover:border-primary hover:text-primary"
                disabled={addingExpression}
              >
                <Plus className="w-4 h-4" />
                {addingExpression ? "Generating..." : "Add Expression"}
              </button>
              <ul className="dropdown-content z-10 menu p-2 shadow-lg bg-white rounded-xl w-52 mt-2">
                {availableTypes.map((type) => (
                  <li key={type}>
                    <button
                      type="button"
                      onClick={() => handleAddExpression([type])}
                    >
                      {expressionLabels[type] || type}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600 ml-auto"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {expressions.map((expression) => (
          <div key={expression.id} className="space-y-2">
            <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50">
              {expression.status === "completed" && expression.imageUrl ? (
                <>
                  <img
                    src={expression.imageUrl}
                    alt={expressionLabels[expression.type] || expression.type}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                    <span className="text-white text-xs font-medium">
                      {expressionLabels[expression.type] || expression.type}
                    </span>
                  </div>
                </>
              ) : expression.status === "generating" ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="text-2xl">⏳</span>
                </div>
              )}
            </div>
            <p className="text-center text-sm capitalize text-gray-500">
              {expressionLabels[expression.type] || expression.type}
            </p>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Generation Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-400">Prompt</dt>
            <dd className="mt-1 text-gray-700">{avatar.prompt}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Style</dt>
            <dd className="mt-1 capitalize text-gray-700">{avatar.style}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Credits used</dt>
            <dd className="mt-1 text-gray-700">
              {avatar.creditsUsed.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">Created</dt>
            <dd className="mt-1 text-gray-700">
              {formatDate(avatar.createdAt)}
            </dd>
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
