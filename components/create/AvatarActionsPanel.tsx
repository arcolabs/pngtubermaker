"use client";

import { Download, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import type { SelectedAvatar } from "@/hooks/use-avatar-generator";
import { TASK_COSTS } from "@/lib/services/credits";

interface AvatarActionsPanelProps {
  selected: SelectedAvatar;
  creditBalance: number | null;
  onGenerateExpressions: () => void;
  onUpdateAvatarName: (name: string) => void;
  onDownload: (size: number) => void;
}

const EXPRESSION_COST = TASK_COSTS.expression_edit * 3;

export function AvatarActionsPanel({
  selected,
  creditBalance,
  onGenerateExpressions,
  onUpdateAvatarName,
  onDownload,
}: AvatarActionsPanelProps) {
  const [selectedSize, setSelectedSize] = useState(512);
  const [isDownloading, setIsDownloading] = useState(false);

  const insufficientForExpressions =
    creditBalance !== null && creditBalance < EXPRESSION_COST;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(selectedSize);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="bg-gray-50/80 rounded-xl p-5 border border-gray-200/60 mt-4"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <div className="space-y-4">
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

        {/* Generate Expressions */}
        {!selected.expressionsGenerated && (
          <div>
            {insufficientForExpressions && (
              <p className="text-xs text-warning mb-2">
                You have {creditBalance} credits but expressions cost{" "}
                {EXPRESSION_COST}.{" "}
                <a href="/pricing" className="link link-primary">
                  Get more credits
                </a>
              </p>
            )}
            <button
              type="button"
              onClick={onGenerateExpressions}
              disabled={
                selected.isGeneratingExpressions || insufficientForExpressions
              }
              className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
            >
              {selected.isGeneratingExpressions ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating expressions...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Expressions — {EXPRESSION_COST} cr
                </>
              )}
            </button>
          </div>
        )}

        {/* Expression thumbnails */}
        {selected.expressions.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {selected.expressions.map((expr) => (
              <div key={expr.id} className="flex-shrink-0 w-16">
                <div className="aspect-square rounded-lg overflow-hidden ring-1 ring-gray-200">
                  {expr.status === "completed" && expr.imageUrl ? (
                    <img
                      src={expr.imageUrl}
                      alt={expr.type}
                      className="w-full h-full object-cover"
                    />
                  ) : expr.status === "pending" ||
                    expr.status === "generating" ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-red-50 flex items-center justify-center text-xs text-red-400">
                      Failed
                    </div>
                  )}
                </div>
                <p className="text-center text-[10px] text-gray-500 mt-1 capitalize font-medium">
                  {expr.type}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Size selector + Download */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
          <div className="flex gap-2">
            {[
              { size: 512, label: "512" },
              { size: 1080, label: "1080" },
              { size: 2160, label: "4K" },
            ].map((opt) => (
              <button
                key={opt.size}
                type="button"
                onClick={() => setSelectedSize(opt.size)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedSize === opt.size
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            {isDownloading ? "Preparing..." : "Download ZIP"}
          </button>
        </div>
      </div>
    </div>
  );
}
