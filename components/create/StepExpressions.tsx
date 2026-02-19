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
  const isIdle = expression.type === "idle";

  if (expression.status === "completed" && expression.imageUrl) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <img
          src={expression.imageUrl}
          alt={expression.type}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute bottom-0 inset-x-0 text-white text-center py-1 text-sm font-medium capitalize ${
            isIdle ? "bg-success/90" : "bg-primary/90"
          }`}
        >
          {expression.type} ✓
        </div>
      </div>
    );
  }

  if (expression.status === "generating") {
    return (
      <div className="aspect-square rounded-xl bg-base-200 flex flex-col items-center justify-center animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <span className="text-sm font-medium capitalize">
          {expression.type}
        </span>
        <span className="text-xs text-base-content/50">Generating...</span>
      </div>
    );
  }

  if (expression.status === "failed") {
    return (
      <div className="aspect-square rounded-xl bg-error/10 border border-error/30 flex flex-col items-center justify-center">
        <span className="text-2xl mb-2">✕</span>
        <span className="text-sm capitalize">{expression.type}</span>
        <span className="text-xs text-error">Failed</span>
      </div>
    );
  }

  // Pending
  return (
    <div className="aspect-square rounded-xl bg-base-200 flex flex-col items-center justify-center">
      <span className="text-2xl mb-2">⏳</span>
      <span className="text-sm text-base-content/50 capitalize">
        {expression.type}
      </span>
      <span className="text-xs text-base-content/30">Waiting...</span>
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

      {/* Progress bar */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Generating expressions...</span>
            <span>
              {completedCount}/{totalCount}
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={completedCount}
            max={totalCount}
          />
        </div>
      )}

      {/* Expression grid */}
      <div className="grid grid-cols-2 gap-4">
        {expressions.map((expr) => (
          <ExpressionCard key={expr.id} expression={expr} />
        ))}
      </div>

      {/* Navigation */}
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
          className="btn btn-primary flex-1"
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
