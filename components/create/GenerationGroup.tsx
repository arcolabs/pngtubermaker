"use client";

import { Copy, Download, Eye, Layers, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  AspectRatio,
  ExpressionState,
  ExpressionSubtype,
  Generation,
  SelectedAvatar,
} from "@/hooks/use-avatar-generator";
import { AvatarActionsPanel } from "./AvatarActionsPanel";
import { CandidateCard } from "./CandidateCard";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface GenerationGroupProps {
  generation: Generation;
  allGenerations: Generation[];
  selected: SelectedAvatar | null;
  creditBalance: number | null;
  onSelectCandidate: (
    generationId: string,
    index: number,
    existingExpressions?: ExpressionState[],
  ) => void;
  onGenerateExpressionPack: (
    type: "base" | "custom",
    subtype?: ExpressionSubtype,
  ) => void;
  onDownload: () => void;
  onRegenerate?: (prompt: string, style: string, aspectRatio: string) => void;
}

const ASPECT_CLASS: Record<AspectRatio, string> = {
  "1:1": "aspect-square",
  "3:4": "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
};

const BASE_EXPRESSION_LABELS = ["idle", "talking", "blink", "blink talk"];

function getImageAspectClass(aspectRatio: AspectRatio): string {
  return ASPECT_CLASS[aspectRatio] ?? "aspect-square";
}

export function GenerationGroup({
  generation,
  allGenerations,
  selected,
  onSelectCandidate,
  onGenerateExpressionPack,
  onDownload,
  onRegenerate,
}: GenerationGroupProps) {
  const isThisGroupSelected = selected?.generationId === generation.id;
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(
    null,
  );
  const [isDownloading, setIsDownloading] = useState(false);

  // Check which expression packs already exist for the current avatar
  const avatarId = generation.avatarId;
  const hasBasePack = useMemo(
    () =>
      allGenerations.some(
        (g) =>
          g.avatarId === avatarId &&
          g.type === "expression_base" &&
          g.status !== "failed",
      ),
    [allGenerations, avatarId],
  );
  const existingCustomSubtypes = useMemo(
    () =>
      new Set(
        allGenerations
          .filter(
            (g) =>
              g.avatarId === avatarId &&
              g.type === "expression_custom" &&
              g.status !== "failed" &&
              g.subtype,
          )
          .map((g) => g.subtype as ExpressionSubtype),
      ),
    [allGenerations, avatarId],
  );

  // Derive selected index from parent state — no local duplication
  const selectedImageIndex = isThisGroupSelected
    ? (selected?.candidateIndex ?? null)
    : null;

  const imageAspectClass = useMemo(
    () => getImageAspectClass(generation.aspectRatio || "1:1"),
    [generation.aspectRatio],
  );

  // Toggle selection via the hook (hook already handles select/deselect toggle)
  const handleImageSelect = (index: number) => {
    onSelectCandidate(generation.id, index);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generation.prompt);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  // Always use 4 columns — custom expressions leave right 2 cells empty
  const getGridCols = () => {
    return "grid-cols-4";
  };

  // Get label for expression cards
  const getCardLabel = (index: number): string | undefined => {
    if (generation.type === "expression_base" && index < 4) {
      return BASE_EXPRESSION_LABELS[index];
    }
    if (generation.type === "expression_custom") {
      const subLabel = generation.subtype ?? "custom";
      return index === 0 ? subLabel : `${subLabel} talk`;
    }
    return undefined;
  };

  // Get right panel title based on task type
  const getRightPanelTitle = () => {
    switch (generation.type) {
      case "expression_base":
        return "Base Expressions";
      case "expression_custom":
        return generation.subtype
          ? `${generation.subtype.charAt(0).toUpperCase() + generation.subtype.slice(1)} Expressions`
          : "Custom Expressions";
      default:
        return "Prompt";
    }
  };

  // Render left side - Images Area
  const renderImagesArea = () => {
    return (
      <div className="flex-[4] min-w-0">
        {/* Generating: skeleton cards */}
        {generation.status === "generating" && (
          <div className={`grid ${getGridCols()} gap-3`}>
            {(generation.type === "expression_custom"
              ? ["sk-a", "sk-b"]
              : ["sk-a", "sk-b", "sk-c", "sk-d"]
            ).map((key) => (
              <div
                key={key}
                className={`${imageAspectClass} rounded-xl bg-gray-100 overflow-hidden relative`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </div>
            ))}
          </div>
        )}

        {/* Failed */}
        {generation.status === "failed" && (
          <div className="rounded-xl bg-red-50 border border-red-200/60 p-4 text-sm text-red-600">
            {generation.error || "Generation failed. Please try again."}
          </div>
        )}

        {/* Completed: candidate cards */}
        {generation.status === "completed" && (
          <>
            <div className={`grid ${getGridCols()} gap-3`}>
              {generation.candidateImages.map((url, i) => (
                <CandidateCard
                  key={`${generation.id}-${i}`}
                  imageUrl={url}
                  index={i}
                  aspectRatioClass={imageAspectClass}
                  isSelected={selectedImageIndex === i}
                  disabled={false}
                  label={getCardLabel(i)}
                  onSelect={() => handleImageSelect(i)}
                  onPreview={() => setPreviewImageIndex(i)}
                />
              ))}
            </div>

            {/* Agent Input Panel — shown when any card is selected */}
            {isThisGroupSelected && selectedImageIndex !== null && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <AvatarActionsPanel selected={selected} />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Render right side - Info Area
  const renderInfoArea = () => {
    const title = getRightPanelTitle();

    return (
      <div className="flex-[1] min-w-[220px] bg-gray-50/70 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
        {/* Title Section */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {title}
            </span>
            {generation.type === "avatar" && (
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Copy prompt"
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Show prompt only for avatar type */}
          {generation.type === "avatar" && (
            <div className="text-sm text-gray-800 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto pr-1">
              {generation.prompt}
            </div>
          )}
        </div>

        {/* Action Buttons Section — only visible when selected */}
        {isThisGroupSelected && selected && (
          <div className="space-y-3 pt-2 border-t border-gray-200">
            {/* View Avatar - Navigate to detail page for expression types */}
            {(generation.type === "expression_base" ||
              generation.type === "expression_custom") &&
              generation.avatarId && (
                <Link
                  href={`/avatars/${generation.slug || generation.avatarId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
                >
                  <Eye className="w-4 h-4" />
                  View Avatar
                </Link>
              )}

            {/* Avatar type specific buttons */}
            {generation.type === "avatar" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Generate Expressions
                </p>
                <button
                  type="button"
                  onClick={() => onGenerateExpressionPack("base")}
                  disabled={hasBasePack}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border shadow-sm transition-all duration-200 ${
                    hasBasePack
                      ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                      : "bg-white border-gray-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
                  }`}
                >
                  <Layers
                    className={`w-4 h-4 flex-shrink-0 ${hasBasePack ? "text-gray-400" : "text-primary"}`}
                  />
                  <div className="text-left">
                    <span className="text-sm font-medium text-gray-800 block">
                      {hasBasePack
                        ? "Base Expressions Generated"
                        : "Base Expressions"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      idle · talking · blink · blink talk
                    </span>
                  </div>
                </button>

                {/* Regenerate button */}
                <button
                  type="button"
                  onClick={() => {
                    if (onRegenerate) {
                      onRegenerate(
                        generation.prompt,
                        generation.style,
                        generation.aspectRatio || "1:1",
                      );
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </>
            )}

            {/* Expression base type - Custom Expressions buttons */}
            {generation.type === "expression_base" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Custom Expressions
                </p>
                {(["happy", "angry", "sad"] as const).map((subtype) => {
                  const done = existingCustomSubtypes.has(subtype);
                  const label =
                    subtype.charAt(0).toUpperCase() + subtype.slice(1);
                  return (
                    <button
                      key={subtype}
                      type="button"
                      onClick={() =>
                        onGenerateExpressionPack("custom", subtype)
                      }
                      disabled={done}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                        done
                          ? "text-gray-400 bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                          : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {done ? `${label} Set Generated` : `${label} Set`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Download button - for all types */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200 disabled:opacity-70"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Preparing..." : "Download"}
            </button>
          </div>
        )}

        {/* Copy Prompt - visible on hover for avatar type when not selected */}
        {generation.type === "avatar" &&
          !isThisGroupSelected &&
          generation.status === "completed" && (
            <div className="mt-auto pt-4 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 py-2 px-3 rounded-lg border border-gray-200 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Prompt
              </button>
            </div>
          )}
      </div>
    );
  };

  return (
    <div
      className="group bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <div className="flex flex-col lg:flex-row gap-5">
        {renderImagesArea()}
        {renderInfoArea()}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        images={generation.candidateImages}
        currentIndex={previewImageIndex ?? 0}
        isOpen={previewImageIndex !== null}
        onClose={() => setPreviewImageIndex(null)}
        onNavigate={setPreviewImageIndex}
      />
    </div>
  );
}
