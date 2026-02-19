"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { ExpressionState } from "@/hooks/use-generation";

interface StepExpressionsProps {
  expressions: ExpressionState[];
  isGenerating: boolean;
  onNext: () => void;
  onBack: () => void;
}

function ExpressionCard({ expression }: { expression: ExpressionState }) {
  if (expression.status === "completed" && expression.imageUrl) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <img
          src={expression.imageUrl}
          alt={expression.type}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 inset-x-0 text-white text-center py-1 text-sm font-medium capitalize bg-primary/90">
          {expression.type} ✓
        </div>
      </div>
    );
  }

  if (expression.status === "generating") {
    return (
      <div className="aspect-square rounded-xl overflow-hidden relative bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
          <span className="text-sm font-medium capitalize text-gray-700">
            {expression.type}
          </span>
        </div>
      </div>
    );
  }

  if (expression.status === "failed") {
    return (
      <div className="aspect-square rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center">
        <span className="text-2xl mb-2">✕</span>
        <span className="text-sm capitalize">{expression.type}</span>
        <span className="text-xs text-red-500">Failed</span>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-xl bg-gray-50 flex flex-col items-center justify-center">
      <span className="text-2xl mb-2">⏳</span>
      <span className="text-sm text-gray-400 capitalize">
        {expression.type}
      </span>
      <span className="text-xs text-gray-300">Waiting...</span>
    </div>
  );
}

export function StepExpressions({
  expressions,
  isGenerating,
  onNext,
  onBack,
}: StepExpressionsProps) {
  const completedCount = expressions.filter(
    (e) => e.status === "completed",
  ).length;
  const totalCount = expressions.length;
  const allComplete = completedCount === totalCount && !isGenerating;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">
          {isGenerating
            ? "Generating your expression pack..."
            : "Your expression pack is ready!"}
        </h2>
      </div>

      {isGenerating && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">
              Generating expressions...
            </span>
            <span className="text-primary font-semibold">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {expressions.map((expr) => (
          <ExpressionCard key={expr.id} expression={expr} />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="btn btn-outline flex-1"
          onClick={onBack}
          disabled={isGenerating}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          className="btn border-0 text-white flex-1 bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          disabled={!allComplete}
          onClick={onNext}
        >
          Continue to Download
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
