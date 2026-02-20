"use client";

import type {
  ExpressionState,
  Generation,
  SelectedAvatar,
} from "@/hooks/use-avatar-generator";
import { AvatarActionsPanel } from "./AvatarActionsPanel";
import { CandidateCard } from "./CandidateCard";

interface GenerationGroupProps {
  generation: Generation;
  selected: SelectedAvatar | null;
  creditBalance: number | null;
  onSelectCandidate: (
    generationId: string,
    index: number,
    existingExpressions?: ExpressionState[],
  ) => void;
  onGenerateExpressions: () => void;
  onUpdateAvatarName: (name: string) => void;
  onDownload: (size: number) => void;
  onClearSelection: () => void;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function GenerationGroup({
  generation,
  selected,
  creditBalance,
  onSelectCandidate,
  onGenerateExpressions,
  onUpdateAvatarName,
  onDownload,
}: GenerationGroupProps) {
  const isThisGroupSelected = selected?.generationId === generation.id;
  const promptSnippet =
    generation.prompt.length > 60
      ? `${generation.prompt.slice(0, 60)}...`
      : generation.prompt;

  return (
    <div
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm text-gray-700 font-medium flex-1 truncate">
          {promptSnippet}
        </p>
        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          {generation.style}
        </span>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {timeAgo(generation.createdAt)}
        </span>
      </div>

      {/* Generating: skeleton cards */}
      {generation.status === "generating" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {generation.candidateImages.map((url, i) => (
              <CandidateCard
                key={url}
                imageUrl={url}
                index={i}
                isSelected={
                  isThisGroupSelected && selected.candidateIndex === i
                }
                disabled={isThisGroupSelected && selected.baseSelected}
                onSelect={() =>
                  onSelectCandidate(generation.id, i, generation.expressions)
                }
              />
            ))}
          </div>

          {/* Actions panel when a candidate is selected in this group */}
          {isThisGroupSelected && selected && (
            <AvatarActionsPanel
              selected={selected}
              creditBalance={creditBalance}
              onGenerateExpressions={onGenerateExpressions}
              onUpdateAvatarName={onUpdateAvatarName}
              onDownload={onDownload}
            />
          )}
        </>
      )}
    </div>
  );
}
