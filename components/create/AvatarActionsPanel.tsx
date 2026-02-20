"use client";

import { Check, Download, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import type { SelectedAvatar } from "@/hooks/use-avatar-generator";
import { TASK_COSTS } from "@/lib/services/credits";

interface AvatarActionsPanelProps {
  selected: SelectedAvatar;
  creditBalance: number | null;
  onGenerateSingleExpression: (type: string) => void;
  onUpdateAvatarName: (name: string) => void;
  onDownload: () => void;
}

const EXPRESSION_COST = TASK_COSTS.expression_edit;

/** Base 4 PNGTuber expressions (idle = base image, no generation needed) */
const BASE_EXPRESSIONS = [
  { type: "idle", label: "Idle", description: "Eyes open, mouth closed" },
  { type: "talking", label: "Talking", description: "Eyes open, mouth open" },
  { type: "blink", label: "Blink", description: "Eyes closed, mouth closed" },
  {
    type: "blink_talking",
    label: "Blink Talk",
    description: "Eyes closed, mouth open",
  },
] as const;

/** Custom expressions beyond the base 4 */
const CUSTOM_EXPRESSIONS = [
  { type: "happy", label: "Happy" },
  { type: "sad", label: "Sad" },
  { type: "angry", label: "Angry" },
  { type: "surprised", label: "Surprised" },
] as const;

export function AvatarActionsPanel({
  selected,
  creditBalance,
  onGenerateSingleExpression,
  onUpdateAvatarName,
  onDownload,
}: AvatarActionsPanelProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const insufficientCredits =
    creditBalance !== null && creditBalance < EXPRESSION_COST;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  const getExpressionForType = (type: string) =>
    selected.expressions.find((e) => e.type === type);

  const hasAnyExpression = selected.expressions.some(
    (e) => e.status === "completed",
  );

  return (
    <div
      className="bg-gray-50/80 rounded-xl p-5 border border-gray-200/60 mt-4"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <div className="space-y-5">
        {/* Name input */}
        <div className="form-control">
          <label className="label py-1" htmlFor="avatar-name">
            <span className="label-text text-sm font-medium">
              Character name
            </span>
          </label>
          <input
            id="avatar-name"
            type="text"
            value={selected.avatarName}
            onChange={(e) => onUpdateAvatarName(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs"
            placeholder="My PNGTuber"
            maxLength={50}
          />
        </div>

        {/* Base 4 Expressions */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Base Expressions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BASE_EXPRESSIONS.map((expr) => {
              const existing = getExpressionForType(expr.type);
              const isIdle = expr.type === "idle";
              const isCompleted = isIdle || existing?.status === "completed";
              const isGenerating = selected.generatingExpression === expr.type;

              return (
                <ExpressionSlot
                  key={expr.type}
                  label={expr.label}
                  description={expr.description}
                  imageUrl={
                    isIdle
                      ? selected.candidateUrl
                      : (existing?.imageUrl ?? null)
                  }
                  isCompleted={isCompleted}
                  isGenerating={isGenerating}
                  isIdle={isIdle}
                  disabled={
                    isIdle ||
                    isGenerating ||
                    (insufficientCredits && !isCompleted) ||
                    selected.generatingExpression !== null
                  }
                  onGenerate={() => onGenerateSingleExpression(expr.type)}
                />
              );
            })}
          </div>
        </div>

        {/* Custom Expressions */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Custom Expressions
            <span className="text-xs text-gray-400 ml-1.5 font-normal">
              {EXPRESSION_COST} cr each
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CUSTOM_EXPRESSIONS.map((expr) => {
              const existing = getExpressionForType(expr.type);
              const isCompleted = existing?.status === "completed";
              const isGenerating = selected.generatingExpression === expr.type;

              return (
                <ExpressionSlot
                  key={expr.type}
                  label={expr.label}
                  imageUrl={existing?.imageUrl ?? null}
                  isCompleted={isCompleted}
                  isGenerating={isGenerating}
                  isIdle={false}
                  disabled={
                    isGenerating ||
                    (insufficientCredits && !isCompleted) ||
                    selected.generatingExpression !== null
                  }
                  onGenerate={() => onGenerateSingleExpression(expr.type)}
                />
              );
            })}
          </div>

          {insufficientCredits && (
            <p className="text-xs text-warning mt-2">
              Not enough credits ({creditBalance} remaining).{" "}
              <a href="/pricing" className="link link-primary">
                Get more
              </a>
            </p>
          )}
        </div>

        {/* Download */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            {isDownloading
              ? "Preparing..."
              : hasAnyExpression
                ? "Download All (ZIP)"
                : "Download PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Expression slot component ─────────────────────────────────────────

function ExpressionSlot({
  label,
  description,
  imageUrl,
  isCompleted,
  isGenerating,
  isIdle,
  disabled,
  onGenerate,
}: {
  label: string;
  description?: string;
  imageUrl: string | null;
  isCompleted: boolean;
  isGenerating: boolean;
  isIdle: boolean;
  disabled: boolean;
  onGenerate: () => void;
}) {
  if (isCompleted && imageUrl) {
    // Completed: show thumbnail with check badge
    return (
      <div className="relative group">
        <div className="aspect-square rounded-lg overflow-hidden ring-1 ring-gray-200">
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
          <Check className="w-3 h-3 text-white" />
        </div>
        <p className="text-center text-[10px] text-gray-500 mt-1 font-medium">
          {label}
        </p>
      </div>
    );
  }

  if (isGenerating) {
    // Generating: show spinner
    return (
      <div>
        <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
        <p className="text-center text-[10px] text-gray-500 mt-1 font-medium">
          {label}
        </p>
      </div>
    );
  }

  // Not generated: show generate button
  return (
    <div>
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled || isIdle}
        title={description}
        className="w-full aspect-square rounded-lg bg-gray-100 hover:bg-gray-200 ring-1 ring-gray-200 hover:ring-gray-300 flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:hover:bg-gray-100"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-[10px] text-gray-500 font-medium">Generate</span>
      </button>
      <p className="text-center text-[10px] text-gray-500 mt-1 font-medium">
        {label}
      </p>
    </div>
  );
}
