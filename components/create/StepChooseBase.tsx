"use client";

import { ArrowLeft, Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { TASK_COSTS } from "@/lib/services/credits";

interface StepChooseBaseProps {
  candidates: string[];
  selectedIndex: number | null;
  creditBalance: number | null;
  isRegenerating: boolean;
  onSelect: (index: number) => void;
  onRegenerate: () => void;
  onNext: () => void;
  onBack: () => void;
}

const EXPRESSION_COST = TASK_COSTS.expression_edit * 3;

export function StepChooseBase({
  candidates,
  selectedIndex,
  creditBalance,
  isRegenerating,
  onSelect,
  onRegenerate,
  onNext,
  onBack,
}: StepChooseBaseProps) {
  const canProceed = selectedIndex !== null && !isRegenerating;
  const insufficientForExpressions =
    creditBalance !== null && creditBalance < EXPRESSION_COST;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Choose your favorite</h2>
        <p className="text-sm text-base-content/60">
          Select one of the 4 generated options as your base character.
        </p>
      </div>

      {/* Candidate grid */}
      <div className="grid grid-cols-2 gap-4">
        {candidates.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => onSelect(i)}
            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
              selectedIndex === i
                ? "ring-4 ring-primary shadow-[0_4px_30px_rgba(6,182,212,0.25)] scale-[1.02]"
                : "hover:ring-2 hover:ring-primary/50 hover:shadow-md"
            }`}
          >
            <img
              src={url}
              alt={`Option ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {selectedIndex === i && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Option {i + 1}
            </div>
          </button>
        ))}
      </div>

      {/* Regenerate */}
      <div className="text-center">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="btn btn-ghost btn-sm text-base-content/60"
        >
          {isRegenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Not happy? Regenerate — {TASK_COSTS.avatar_generation} credits
        </button>
      </div>

      {/* Insufficient credits warning for next step */}
      {insufficientForExpressions && selectedIndex !== null && (
        <div className="alert alert-warning text-sm">
          <span>
            You have {creditBalance} credits but expressions cost{" "}
            {EXPRESSION_COST}. You can download the base image or{" "}
            <a href="/pricing" className="link link-primary">
              get more credits
            </a>
            .
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          className="btn btn-outline flex-1"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary flex-1"
          disabled={!canProceed}
          onClick={onNext}
        >
          <Sparkles className="w-4 h-4" />
          Generate Expressions — {EXPRESSION_COST} credits
        </button>
      </div>
    </div>
  );
}
