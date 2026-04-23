"use client";

import { Check, Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  AspectRatio,
  ExpressionState,
  ExpressionSubtype,
  Generation,
  SelectedAvatar,
} from "@/hooks/use-avatar-generator";
import { useBuyCreditsModal } from "@/hooks/use-buy-credits-modal";
import { TASK_COSTS } from "@/lib/services/credits";
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
  onRegenerate?: (prompt: string, style: string, aspectRatio: string) => void;
  onGenerateReferenceSheet: () => void;
  isReferenceSheetGenerating: boolean;
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
  creditBalance,
  onSelectCandidate,
  onGenerateExpressionPack,
  onRegenerate,
  onGenerateReferenceSheet,
  isReferenceSheetGenerating,
}: GenerationGroupProps) {
  const isThisGroupSelected = selected?.generationId === generation.id;
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(
    null,
  );

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

  // ── Expression Picker state ─────────────────────────────────────────────
  const [packSelections, setPackSelections] = useState({
    base: true,
    happy: false,
    angry: false,
    sad: false,
  });
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  // Refs to always access the latest values between awaits
  const genPackRef = useRef(onGenerateExpressionPack);
  genPackRef.current = onGenerateExpressionPack;
  const creditBalanceRef = useRef(creditBalance);
  creditBalanceRef.current = creditBalance;

  const togglePack = useCallback((key: "base" | "happy" | "angry" | "sad") => {
    // Base Pack is required — cannot be unchecked
    if (key === "base") return;
    setPackSelections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Count how many NEW packs the user selected (excluding already-generated ones)
  const pendingPacks = useMemo(() => {
    const pending: { type: "base" | "custom"; subtype?: ExpressionSubtype }[] =
      [];
    if (packSelections.base && !hasBasePack) pending.push({ type: "base" });
    for (const sub of ["happy", "angry", "sad"] as const) {
      if (packSelections[sub] && !existingCustomSubtypes.has(sub))
        pending.push({ type: "custom", subtype: sub });
    }
    return pending;
  }, [packSelections, hasBasePack, existingCustomSubtypes]);

  // Total cost of all pending packs
  const pendingCost = useMemo(() => {
    let total = 0;
    for (const pack of pendingPacks) {
      // base: 3 generated (idle copied), custom: 2 generated
      const count = pack.type === "base" ? 3 : 2;
      total += count * TASK_COSTS.expression_edit;
    }
    return total;
  }, [pendingPacks]);

  const handleBatchGenerate = useCallback(async () => {
    if (pendingPacks.length === 0) return;

    // Preflight credit check — block before hitting API
    const balance = creditBalanceRef.current ?? 0;
    if (balance < pendingCost) {
      useBuyCreditsModal.getState().open(pendingCost);
      return;
    }

    setIsBatchGenerating(true);
    try {
      for (const pack of pendingPacks) {
        await genPackRef.current(pack.type, pack.subtype);
      }
    } finally {
      setIsBatchGenerating(false);
    }
  }, [pendingPacks, pendingCost]);

  // Check if ALL packs are already generated
  const allPacksDone =
    hasBasePack &&
    existingCustomSubtypes.has("happy") &&
    existingCustomSubtypes.has("angry") &&
    existingCustomSubtypes.has("sad");

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

  // Get right panel title
  const getRightPanelTitle = () => "Prompt";

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
        )}

        {/* Bottom Panel — Expression Picker + Actions (shown when avatar card is selected) */}
        {isThisGroupSelected &&
          selected &&
          generation.type === "avatar" &&
          generation.status === "completed" && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              {/* Expression Picker */}
              {!allPacksDone && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Expression Pack
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        {
                          key: "base" as const,
                          label: "Base Pack",
                          badge: "Required",
                          desc: "idle · talking · blink · blink talk",
                          done: hasBasePack,
                        },
                        {
                          key: "happy" as const,
                          label: "Happy Set",
                          badge: undefined,
                          desc: "happy · happy talk",
                          done: existingCustomSubtypes.has("happy"),
                        },
                        {
                          key: "angry" as const,
                          label: "Angry Set",
                          badge: undefined,
                          desc: "angry · angry talk",
                          done: existingCustomSubtypes.has("angry"),
                        },
                        {
                          key: "sad" as const,
                          label: "Sad Set",
                          badge: undefined,
                          desc: "sad · sad talk",
                          done: existingCustomSubtypes.has("sad"),
                        },
                      ] as const
                    ).map((pack) => {
                      const Wrapper = pack.done ? "div" : "label";
                      return (
                        <Wrapper
                          key={pack.key}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-150 select-none ${
                            pack.done
                              ? "bg-green-50/60 border-green-200/60"
                              : packSelections[pack.key]
                                ? "bg-primary/5 border-primary/30 cursor-pointer"
                                : "bg-white border-gray-200 hover:border-gray-300 cursor-pointer"
                          } ${isBatchGenerating ? "pointer-events-none opacity-70" : ""}`}
                        >
                          {pack.done ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <input
                              type="checkbox"
                              checked={packSelections[pack.key]}
                              onChange={() => togglePack(pack.key)}
                              disabled={
                                isBatchGenerating || pack.key === "base"
                              }
                              className="checkbox checkbox-xs checkbox-primary rounded"
                            />
                          )}
                          <div className="min-w-0">
                            <span
                              className={`text-sm font-medium block ${pack.done ? "text-green-700" : "text-gray-800"}`}
                            >
                              {pack.done ? `${pack.label} ✓` : pack.label}
                              {pack.badge && (
                                <span className="ml-1.5 text-[10px] font-medium text-primary/70">
                                  {pack.badge}
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-gray-400 hidden sm:block">
                              {pack.desc}
                            </span>
                          </div>
                        </Wrapper>
                      );
                    })}
                  </div>
                </>
              )}

              {allPacksDone && (
                <p className="text-sm text-green-600 font-medium">
                  All expression packs generated ✓
                </p>
              )}
            </div>
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
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {/* Avatar cards: Generate Expressions + Download + Regenerate */}
            {generation.type === "avatar" &&
              generation.status === "completed" && (
                <>
                  {!allPacksDone && (
                    <>
                      <button
                        type="button"
                        onClick={handleBatchGenerate}
                        disabled={
                          pendingPacks.length === 0 || isBatchGenerating
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
                      >
                        {isBatchGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Expressions
                            {pendingCost > 0 && (
                              <span className="text-white/70 text-xs">
                                ({pendingCost})
                              </span>
                            )}
                          </>
                        )}
                      </button>
                      {creditBalance !== null &&
                        creditBalance < pendingCost &&
                        pendingPacks.length > 0 && (
                          <p className="text-xs text-warning text-center">
                            Not enough credits ({creditBalance}/{pendingCost}).{" "}
                            <button
                              type="button"
                              onClick={() =>
                                useBuyCreditsModal.getState().open(pendingCost)
                              }
                              className="link link-primary"
                            >
                              Buy credits
                            </button>
                          </p>
                        )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={onGenerateReferenceSheet}
                    disabled={isReferenceSheetGenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200 disabled:opacity-50"
                  >
                    {isReferenceSheetGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating sheet...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Character Sheet
                        <span className="text-white/70 text-xs">(200)</span>
                      </>
                    )}
                  </button>
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
