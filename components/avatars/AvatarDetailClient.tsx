"use client";

import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Monitor,
  MonitorPlay,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { SafeImage } from "@/components/ui/SafeImage";
import { useBuyCreditsModal } from "@/hooks/use-buy-credits-modal";
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
            <SafeImage
              src={expression.imageUrl}
              alt={expressionLabels[expression.type] || expression.type}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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

// Placeholder for expressions that haven't been generated yet
function ExpressionPlaceholder({
  type,
  label,
}: {
  type: string;
  label: string;
}) {
  return (
    <div className="space-y-2 opacity-50">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
        <span className="text-2xl text-gray-300">{label}</span>
      </div>
      <p className="text-center text-sm text-gray-400">
        {expressionLabels[type] || type}
      </p>
    </div>
  );
}

function OBSSetupSection({
  avatarId,
  micThreshold,
  speakingDelay,
}: {
  avatarId: string;
  micThreshold: number | null;
  speakingDelay: number | null;
}) {
  const [copied, setCopied] = useState(false);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "");
  const params = new URLSearchParams();
  if (micThreshold !== null) params.set("threshold", micThreshold.toFixed(3));
  if (speakingDelay !== null) params.set("delay", String(speakingDelay));
  const qs = params.toString();
  const playerUrl = `${appUrl}/player/${avatarId}${qs ? `?${qs}` : ""}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(playerUrl);
      setCopied(true);
      toast.success("Player URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Monitor className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-gray-900 text-sm">Use in OBS</h3>
      </div>

      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2 mb-3">
        Tip: Switch to <strong>Mic</strong> mode in Live Preview above to
        fine-tune sensitivity before copying.
      </p>

      {/* URL + Copy */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          readOnly
          value={playerUrl}
          className="input input-bordered input-sm flex-1 text-xs font-mono bg-gray-50"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          type="button"
          className={cn(
            "btn btn-sm gap-1.5 min-w-[80px]",
            copied ? "btn-success text-white" : "btn-primary",
          )}
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Quick Guide */}
      <div className="bg-base-200/50 rounded-xl p-3">
        <p className="text-xs font-medium text-gray-700 mb-2">Quick Setup</p>
        <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
          <li>
            In OBS, click <strong>+</strong> under Sources &rarr;{" "}
            <strong>Browser</strong>
          </li>
          <li>Paste the URL above, set size to match your export resolution</li>
          <li>Done &mdash; mic-driven animation starts automatically</li>
        </ol>
      </div>
    </div>
  );
}

function VeadotubeGuideSection() {
  return (
    <details className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
      <summary className="cursor-pointer p-4 sm:p-6 list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-gray-400" />
            <h3 className="font-semibold text-gray-900 text-sm">
              Use with veadotube
            </h3>
          </div>
          <span className="text-xs text-gray-400">Click to expand</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Prefer using veadotube mini? Download your assets and import them.
        </p>
      </summary>

      <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-2 space-y-3">
        {/* Step-by-step guide */}
        <div className="bg-base-200/50 rounded-xl p-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Setup Guide</p>
          <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
            <li>
              Download your expression pack (ZIP) using the{" "}
              <strong>Download</strong> button above
            </li>
            <li>
              Unzip the files &mdash; each expression is named (idle, talking,
              blink, etc.)
            </li>
            <li>
              Open veadotube mini &rarr; click <strong>+</strong> to add a new
              avatar
            </li>
            <li>Import each expression PNG into the corresponding slot</li>
            <li>Set up OBS window capture for veadotube mini</li>
            <li>Done &mdash; your PNGTuber is ready to stream!</li>
          </ol>
        </div>

        {/* External link */}
        <a
          href="https://olmewe.itch.io/veadotube-mini"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          Get veadotube mini on itch.io
        </a>

        {/* Tip nudging toward Browser Source */}
        <p className="text-xs text-gray-400">
          Tip: The <strong>Browser Source</strong> method above requires zero
          install &mdash; paste a URL and go live instantly.
        </p>
      </div>
    </details>
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
  const [expressions] = useState(initialExpressions);
  const [packs, setPacks] = useState(initialPacks);
  const [generatingPack, setGeneratingPack] = useState<string | null>(null);
  const [activeExpressionType, setActiveExpressionType] = useState<
    string | null
  >(null);
  const [micThreshold, setMicThreshold] = useState<number | null>(null);
  const [speakingDelay, setSpeakingDelay] = useState<number | null>(null);

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
    for (const pack of packs) {
      for (const expr of pack.expressions) {
        addExpr(expr);
      }
    }

    // Legacy expressions
    for (const expr of expressions) {
      addExpr(expr);
    }

    return assets;
  }, [avatar.baseImageUrl, packs, expressions]);

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading("Preparing your download...");
    try {
      const url = `/api/avatars/${avatar.id}/download?format=zip&size=${selectedSize}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = `${avatar.name}.zip`;
      link.click();
      toast.success("Download started!", { id: toastId });
    } catch {
      toast.error("Failed to start download. Please try again.", {
        id: toastId,
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting avatar...");
    try {
      const res = await fetch(`/api/avatars/${avatar.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Avatar deleted successfully", { id: toastId });
      router.push("/avatars");
    } catch {
      toast.error("Failed to delete avatar. Please try again.", {
        id: toastId,
      });
      setShowDeleteConfirm(false);
    }
  };

  // Fixed 10 expression slots in display order
  const EXPRESSION_SLOTS = [
    "idle",
    "talking",
    "blink",
    "blink_talking",
    "happy",
    "happy_talking",
    "sad",
    "sad_talking",
    "angry",
    "angry_talking",
  ] as const;

  // Build a type→Expression lookup from all sources (packs take priority over legacy)
  const expressionByType = useMemo(() => {
    const map = new Map<string, Expression>();
    // Legacy expressions first (lower priority)
    for (const expr of expressions) {
      if (expr.status === "completed" && expr.imageUrl) {
        map.set(expr.type, expr);
      }
    }
    // Pack expressions override legacy
    for (const pack of packs) {
      for (const expr of pack.expressions) {
        map.set(expr.type, expr);
      }
    }
    return map;
  }, [packs, expressions]);

  const existingPackSubtypes = useMemo(() => {
    // A subtype is "generated" if we have a custom pack for it, OR if both
    // expression types for that subtype exist from any source (legacy included)
    const fromPacks = new Set(
      packs
        .filter((p) => p.packType === "custom" && p.subtype)
        .map((p) => p.subtype as string),
    );
    // Also consider legacy expressions that cover both slots of a subtype
    for (const sub of ["happy", "sad", "angry"]) {
      if (
        !fromPacks.has(sub) &&
        expressionByType.has(sub) &&
        expressionByType.has(`${sub}_talking`)
      ) {
        fromPacks.add(sub);
      }
    }
    return fromPacks;
  }, [packs, expressionByType]);

  const packOptions = [
    { key: "happy", label: "Happy Pack", emoji: "😊" },
    { key: "sad", label: "Sad Pack", emoji: "😢" },
    { key: "angry", label: "Angry Pack", emoji: "😠" },
  ];

  // Emoji lookup for placeholder display
  const slotEmoji: Record<string, string> = {
    happy: "😊",
    happy_talking: "😊",
    sad: "😢",
    sad_talking: "😢",
    angry: "😠",
    angry_talking: "😠",
  };

  const canAddMore = packOptions.some(
    (opt) => !existingPackSubtypes.has(opt.key),
  );

  const handleGeneratePack = async (subtype: string) => {
    setGeneratingPack(subtype);
    const toastId = toast.loading(`Generating ${subtype} expressions...`);
    try {
      const res = await fetch(`/api/avatars/${avatar.id}/packs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packType: "custom", subtype }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "insufficient_credits") {
          toast.dismiss(toastId);
          useBuyCreditsModal.getState().open(data.required);
          return;
        }
        throw new Error(data.error || "Failed to generate pack");
      }

      const data = await res.json();
      setPacks((prev) => [
        ...prev,
        {
          id: data.packId,
          packType: data.packType,
          subtype: data.subtype,
          status: "completed",
          createdAt: new Date().toISOString(),
          expressions: data.expressions,
        },
      ]);
      toast.success(`${subtype} pack generated!`, { id: toastId });
    } catch (error) {
      console.error("Failed to generate pack:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate pack",
        { id: toastId },
      );
    } finally {
      setGeneratingPack(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. PNGTuber Live Preview with controls */}
      {previewExpressions.length >= 2 ? (
        <PNGTuberPreview
          expressions={previewExpressions}
          onExpressionChange={setActiveExpressionType}
          onMicThresholdChange={setMicThreshold}
          onSpeakingDelayChange={setSpeakingDelay}
        />
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm text-center py-12">
          <p className="text-gray-400 mb-4">
            Generate expressions to enable live preview
          </p>
        </div>
      )}

      {/* 2. Expressions - All packs merged into one grid */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Expressions</h3>
          <div className="flex items-center gap-2">
            <select
              className="select select-xs bg-gray-50 border-gray-200 rounded-md text-xs h-7 min-h-0"
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
            >
              <option value={512}>512px</option>
              <option value={1080}>1080px</option>
              <option value={2160}>2160px (4K)</option>
            </select>
            <button
              type="button"
              className="btn btn-xs bg-gray-50 hover:bg-primary hover:text-white border border-gray-200 hover:border-primary rounded-md text-gray-600 h-7 min-h-0 px-2"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="w-3 h-3" />
              Download
            </button>
            <button
              type="button"
              className="btn btn-xs bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-md h-7 min-h-0 px-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>

        {/* Fixed 10-slot expression grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 mb-4">
          {EXPRESSION_SLOTS.map((type) => {
            const expr = expressionByType.get(type);
            if (expr) {
              return (
                <ExpressionCard
                  key={type}
                  expression={expr}
                  isHighlighted={activeExpressionType === type}
                />
              );
            }
            return (
              <ExpressionPlaceholder
                key={type}
                type={type}
                label={slotEmoji[type] || "⏳"}
              />
            );
          })}
        </div>

        {/* Generate Pack Buttons below the grid */}
        {canAddMore && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200/60">
            {packOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleGeneratePack(opt.key)}
                disabled={
                  generatingPack !== null || existingPackSubtypes.has(opt.key)
                }
                className={cn(
                  "btn gap-2 px-6 py-2.5 h-auto text-base font-medium shadow-sm",
                  generatingPack === opt.key
                    ? "btn-primary"
                    : existingPackSubtypes.has(opt.key)
                      ? "btn-ghost bg-green-50 text-green-600 hover:bg-green-100 cursor-default"
                      : "btn-primary hover:shadow-md hover:scale-105 transition-all",
                )}
              >
                {generatingPack === opt.key ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    <span>Generating...</span>
                  </>
                ) : existingPackSubtypes.has(opt.key) ? (
                  <>
                    <span className="text-lg">✓</span>
                    <span>{opt.label} Generated</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate {opt.label}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Use in OBS — Player URL + Quick Guide */}
      {previewExpressions.length >= 2 && (
        <OBSSetupSection
          avatarId={avatar.id}
          micThreshold={micThreshold}
          speakingDelay={speakingDelay}
        />
      )}

      {/* 4. Use with veadotube — Download + Import Guide */}
      {previewExpressions.length >= 2 && <VeadotubeGuideSection />}

      {/* Delete Confirmation Modal */}
      <dialog className={`modal ${showDeleteConfirm ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-gray-900">Delete Avatar?</h3>
          <div className="py-4 space-y-3">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{avatar.name}</strong>?
            </p>
            <ul className="text-sm text-gray-500 space-y-1.5">
              <li className="flex items-start gap-2" suppressHydrationWarning>
                <span className="text-red-500">•</span>
                <span suppressHydrationWarning>
                  This action is permanent and cannot be undone
                </span>
              </li>
              <li className="flex items-start gap-2" suppressHydrationWarning>
                <span className="text-red-500">•</span>
                <span suppressHydrationWarning>
                  All expressions and variations will be deleted
                </span>
              </li>
              <li className="flex items-start gap-2" suppressHydrationWarning>
                <span className="text-red-500">•</span>
                <span suppressHydrationWarning>
                  Credits used for generation will not be refunded
                </span>
              </li>
            </ul>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button
                type="button"
                className="btn btn-ghost"
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
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Permanently
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
