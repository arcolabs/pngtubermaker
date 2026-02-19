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
        <p className="text-sm text-gray-500">
          Select one of the 4 generated options as your base character.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {candidates.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => onSelect(i)}
            className={`group relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
              selectedIndex === i
                ? "ring-[3px] ring-primary shadow-[0_4px_20px_rgba(6,182,212,0.25)] scale-[1.02]"
                : "ring-1 ring-gray-200 hover:ring-gray-300"
            }`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <img
              src={url}
              alt={`Option ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <span className="text-white text-sm font-medium">
                Option {i + 1}
              </span>
            </div>

            {selectedIndex === i && (
              <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg animate-[scaleIn_0.2s_ease-out]">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="btn btn-ghost btn-sm text-gray-500"
        >
          {isRegenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Not happy? Regenerate — {TASK_COSTS.avatar_generation} credits
        </button>
      </div>

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
          className="btn border-0 text-white flex-1 bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
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
