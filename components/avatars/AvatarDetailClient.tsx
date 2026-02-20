"use client";

import { Download, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  EngineExpressionType,
  ExpressionAsset,
} from "@/lib/pngtuber-engine";
import { cn } from "@/lib/utils";
import PNGTuberPreview from "./PNGTuberPreview";

interface Expression {
  id: string;
  type: string;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl: string | null;
  packId?: string | null;
}

interface Pack {
  id: string;
  packType: string;
  subtype: string | null;
  status: string;
  createdAt: string;
  expressions: Expression[];
}

interface AvatarDetailClientProps {
  avatar: {
    id: string;
    name: string;
    baseImageUrl: string | null;
  };
  expressions: Expression[];
  packs: Pack[];
}

const expressionLabels: Record<string, string> = {
  idle: "Idle",
  talking: "Talking",
  blink: "Blink",
  blink_talking: "Blink Talk",
  happy: "Happy",
  happy_talking: "Happy Talk",
  sad: "Sad",
  sad_talking: "Sad Talk",
  angry: "Angry",
  angry_talking: "Angry Talk",
};

function getPackTitle(pack: Pack): string {
  if (pack.packType === "base") return "Base Expressions";
  if (pack.subtype) {
    return `${pack.subtype.charAt(0).toUpperCase() + pack.subtype.slice(1)} Expressions`;
  }
  return "Custom Expressions";
}

function ExpressionCard({
  expression,
  isHighlighted,
}: {
  expression: Expression;
  isHighlighted?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "group relative aspect-square rounded-xl overflow-hidden bg-gray-50 transition-all duration-300",
          isHighlighted &&
            "ring-2 ring-primary shadow-[0_0_20px_rgba(6,182,212,0.3)]",
        )}
      >
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
            <span className="text-2xl">&#x23F3;</span>
          </div>
        )}
      </div>
      <p className="text-center text-sm text-gray-500">
        {expressionLabels[expression.type] || expression.type}
      </p>
    </div>
  );
}

export default function AvatarDetailClient({
  avatar,
  expressions: initialExpressions,
  packs: initialPacks,
}: AvatarDetailClientProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(1080);
  const [downloading, setDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expressions, setExpressions] = useState(initialExpressions);
  const [addingExpression, setAddingExpression] = useState(false);
  const [activeExpressionType, setActiveExpressionType] = useState<
    string | null
  >(null);

  // Build expression assets for the preview engine from all completed expressions
  const previewExpressions = useMemo<ExpressionAsset[]>(() => {
    const assets: ExpressionAsset[] = [];
    const seen = new Set<string>();

    // Helper to add a completed expression as an asset
    const addExpr = (expr: Expression) => {
      if (
        expr.status === "completed" &&
        expr.imageUrl &&
        !seen.has(expr.type)
      ) {
        seen.add(expr.type);
        assets.push({
          type: expr.type as EngineExpressionType,
          url: expr.imageUrl,
        });
      }
    };

    // Include base image as idle if no explicit idle expression exists
    // (will be overridden if an idle expression is found in packs/expressions)
    if (avatar.baseImageUrl) {
      assets.push({ type: "idle", url: avatar.baseImageUrl });
      seen.add("idle");
    }

    // Pack expressions first (most organized)
    for (const pack of initialPacks) {
      for (const expr of pack.expressions) {
        addExpr(expr);
      }
    }

    // Legacy expressions
    for (const expr of expressions) {
      addExpr(expr);
    }

    return assets;
  }, [avatar.baseImageUrl, initialPacks, expressions]);

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

  // Collect all expression types across packs and legacy expressions
  const allExpressionTypes = new Set([
    ...expressions.map((e) => e.type),
    ...initialPacks.flatMap((p) => p.expressions.map((e) => e.type)),
  ]);
  const availableTypes = ["idle", "talking", "happy", "sad", "angry"].filter(
    (t) => !allExpressionTypes.has(t),
  );
  const canAddMore = availableTypes.length > 0;

  return (
    <div className="space-y-8">
      {/* PNGTuber Live Preview */}
      {previewExpressions.length >= 2 && (
        <PNGTuberPreview
          expressions={previewExpressions}
          onExpressionChange={setActiveExpressionType}
        />
      )}

      {/* Download & Actions Bar */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Download</h3>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="select select-bordered select-sm bg-white"
            value={selectedSize}
            onChange={(e) => setSelectedSize(Number(e.target.value))}
          >
            <option value={512}>512x512</option>
            <option value={1080}>1080x1080</option>
            <option value={2160}>2160x2160 (4K)</option>
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

      {/* Pack sections */}
      {initialPacks.map((pack) => (
        <div
          key={pack.id}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4">
            {getPackTitle(pack)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {pack.expressions.map((expression) => (
              <ExpressionCard
                key={expression.id}
                expression={expression}
                isHighlighted={activeExpressionType === expression.type}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Legacy expressions (not belonging to any pack) */}
      {expressions.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">
            {initialPacks.length > 0 ? "Other Expressions" : "Expressions"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {expressions.map((expression) => (
              <ExpressionCard
                key={expression.id}
                expression={expression}
                isHighlighted={activeExpressionType === expression.type}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
