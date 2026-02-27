"use client";

import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  Info,
  Monitor,
  MonitorPlay,
  RefreshCw,
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
  isRegenerating,
  onRegenerate,
}: {
  expression: Expression;
  isHighlighted?: boolean;
  isRegenerating?: boolean;
  onRegenerate?: (expression: Expression) => void;
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
        {isRegenerating ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : expression.status === "completed" && expression.imageUrl ? (
          <>
            <SafeImage
              src={expression.imageUrl}
              alt={expressionLabels[expression.type] || expression.type}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              {onRegenerate ? (
                <button
                  type="button"
                  className="btn btn-primary btn-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate(expression);
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              ) : (
                <span className="text-white text-xs font-medium">
                  {expressionLabels[expression.type] || expression.type}
                </span>
              )}
            </div>
          </>
        ) : expression.status === "failed" && onRegenerate ? (
          <button
            type="button"
            className="w-full h-full flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-red-50/50 hover:bg-red-50 transition-colors"
            onClick={() => onRegenerate(expression)}
          >
            <RefreshCw className="w-5 h-5 text-red-400" />
            <span className="text-xs text-red-400 font-medium">Retry</span>
          </button>
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
  const [osPlatform, setOsPlatform] = useState<"windows" | "mac">("windows");

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
      <div className="flex items-center gap-2 mb-5">
        <Monitor className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-gray-900 text-sm">Use in OBS</h3>
      </div>

      {/* Timeline steps */}
      <div className="space-y-0">
        {/* Step 1 — Copy Player URL */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1 border-l-2 border-primary/20" />
          </div>
          <div className="pb-6 flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Copy your Player URL
            </p>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">
              Tip: Switch to <strong>Mic</strong> mode in Live Preview above to
              fine-tune sensitivity first.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={playerUrl}
                className="input input-bordered input-sm flex-1 text-xs font-mono bg-gray-50 min-w-0"
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
          </div>
        </div>

        {/* Step 2 — Add Browser Source */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1 border-l-2 border-primary/20" />
          </div>
          <div className="pb-6 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Add Browser Source in OBS
            </p>
            <p className="text-sm text-gray-600 mt-1">
              In OBS, click <strong>+</strong> under Sources &rarr;{" "}
              <strong>Browser</strong> &rarr; paste the URL above.
            </p>
          </div>
        </div>

        {/* Step 3 — Enable Microphone (warning) */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1 border-l-2 border-primary/20" />
          </div>
          <div className="pb-6 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900">
                Enable Microphone Access
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200/60">
                <AlertTriangle className="w-3 h-3" />
                Required
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              OBS Browser Source blocks microphone by default. Add a launch
              parameter to enable it:
            </p>

            {/* Windows / Mac tabs */}
            <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-3">
              <div className="flex gap-1 mb-3">
                <button
                  type="button"
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    osPlatform === "windows"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200",
                  )}
                  onClick={() => setOsPlatform("windows")}
                >
                  Windows
                </button>
                <button
                  type="button"
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    osPlatform === "mac"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200",
                  )}
                  onClick={() => setOsPlatform("mac")}
                >
                  Mac
                </button>
              </div>

              {osPlatform === "windows" ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    Right-click your OBS shortcut &rarr;{" "}
                    <strong>Properties</strong>
                  </p>
                  <p>
                    In the <strong>Target</strong> field, add to the end:
                  </p>
                  <code className="block bg-gray-100 font-mono text-xs px-3 py-2 rounded select-all">
                    --enable-media-stream
                  </code>
                  <p className="text-xs text-gray-500">
                    Restart OBS after saving.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Open Terminal and run:</p>
                  <code className="block bg-gray-100 font-mono text-xs px-3 py-2 rounded select-all">
                    open -a OBS --args --enable-media-stream
                  </code>
                  <p className="text-xs text-gray-500">
                    Run this each time you launch OBS, or create an alias.
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Too complex? Use{" "}
              <strong className="text-gray-600">veadotube mini</strong> below
              instead &mdash; just download your expressions and import, no
              launch parameters needed.
            </p>
          </div>
        </div>

        {/* Done */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-700">You're live!</p>
            <p className="text-sm text-gray-600">
              Mic-driven animation starts automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VeadotubeGuideSection() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <MonitorPlay className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-gray-900 text-sm">
          Use with veadotube
        </h3>
      </div>

      {/* Timeline steps */}
      <div className="space-y-0">
        {/* Step 1 */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1 border-l-2 border-primary/20" />
          </div>
          <div className="pb-6 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Download expression pack
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Use the <strong>Download</strong> button above to get your
              expression pack (ZIP).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1 border-l-2 border-primary/20" />
          </div>
          <div className="pb-6 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Unzip the files
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Each file is named by expression &mdash; idle, talking, blink, and
              so on.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1 border-l-2 border-primary/20" />
          </div>
          <div className="pb-6 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Import into veadotube mini
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Open veadotube mini &rarr; click <strong>+</strong> &rarr; import
              each expression PNG.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              4
            </div>
            <div className="flex-1 border-l-2 border-primary/20" />
          </div>
          <div className="pb-6 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Add Window Capture in OBS
            </p>
            <p className="text-sm text-gray-600 mt-1">
              In OBS, add a <strong>Window Capture</strong> source for veadotube
              mini.
            </p>
          </div>
        </div>

        {/* Done */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-700">
              Ready to stream!
            </p>
            <p className="text-sm text-gray-600">
              Your PNGTuber is set up and ready to go.
            </p>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-5 pt-4 border-t border-gray-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <a
          href="https://olmewe.itch.io/veadotube-mini"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          Get veadotube mini on itch.io
        </a>
        <p className="text-xs text-gray-400">
          Tip: The <strong>Browser Source</strong> method above is zero-install
          &mdash; paste a URL and go live.
        </p>
      </div>
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
  const [packs, setPacks] = useState(initialPacks);
  const [generatingPack, setGeneratingPack] = useState<string | null>(null);
  const [activeExpressionType, setActiveExpressionType] = useState<
    string | null
  >(null);
  const [micThreshold, setMicThreshold] = useState<number | null>(null);
  const [speakingDelay, setSpeakingDelay] = useState<number | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  async function handleRegenerate(expression: Expression) {
    setRegeneratingId(expression.id);
    const toastId = toast.loading(
      `Regenerating ${expressionLabels[expression.type] || expression.type}...`,
    );
    try {
      const res = await fetch(
        `/api/avatars/${avatar.id}/expressions/${expression.id}/regenerate`,
        { method: "POST", signal: AbortSignal.timeout(200_000) },
      );
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "insufficient_credits") {
          toast.dismiss(toastId);
          useBuyCreditsModal.getState().open(data.required);
          return;
        }
        throw new Error(data.error || "Regeneration failed");
      }
      const data = await res.json();
      const updateExpr = (e: Expression) =>
        e.id === expression.id
          ? { ...e, status: "completed" as const, imageUrl: data.imageUrl }
          : e;
      setPacks((prev) =>
        prev.map((pack) => ({
          ...pack,
          expressions: pack.expressions.map(updateExpr),
        })),
      );
      setExpressions((prev) => prev.map(updateExpr));
      toast.success(
        `${expressionLabels[expression.type] || expression.type} regenerated!`,
        { id: toastId },
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Regeneration failed",
        { id: toastId },
      );
    } finally {
      setRegeneratingId(null);
    }
  }

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
                  isRegenerating={regeneratingId === expr.id}
                  onRegenerate={type !== "idle" ? handleRegenerate : undefined}
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

        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Failed generations are automatically refunded — hover any expression
          to regenerate (200 credits).
        </p>

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
