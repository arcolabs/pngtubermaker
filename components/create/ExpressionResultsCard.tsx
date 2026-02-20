"use client";

import { Download, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Generation } from "@/hooks/use-avatar-generator";

const BASE_EXPRESSION_LABELS = ["idle", "talking", "blink", "blink talk"];

interface ExpressionResultsCardProps {
  /** All expression generations for one avatar (base + custom), in creation order */
  expressions: Generation[];
  avatarId: string;
  avatarSlug?: string | null;
  onDownload: () => void;
}

/**
 * Consolidated card that groups all expression packs (base + happy/angry/sad)
 * for a single avatar into one visual card.
 */
export function ExpressionResultsCard({
  expressions,
  avatarId,
  avatarSlug,
  onDownload,
}: ExpressionResultsCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const baseGen = expressions.find((e) => e.type === "expression_base");
  const customGens = expressions.filter((e) => e.type === "expression_custom");

  const isAnyGenerating = expressions.some((e) => e.status === "generating");

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="group bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Expression images */}
        <div className="flex-[4] min-w-0 space-y-4">
          {/* Base Pack section */}
          {baseGen && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Base Pack
              </span>
              {baseGen.status === "generating" && (
                <div className="flex gap-3">
                  {["sk-a", "sk-b", "sk-c", "sk-d"].map((key) => (
                    <div
                      key={key}
                      className="flex-1 aspect-square rounded-xl bg-gray-100 overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    </div>
                  ))}
                </div>
              )}
              {baseGen.status === "failed" && (
                <div className="rounded-xl bg-red-50 border border-red-200/60 p-4 text-sm text-red-600">
                  {baseGen.error || "Base pack generation failed."}
                </div>
              )}
              {baseGen.status === "completed" && (
                <div className="flex gap-3">
                  {baseGen.candidateImages.map((url, i) => (
                    <div
                      key={`${baseGen.id}-${i}`}
                      className="relative group/img flex-1 rounded-xl overflow-hidden border border-gray-200"
                    >
                      {/* biome-ignore lint/performance/noImgElement: external R2 URLs */}
                      <img
                        src={url}
                        alt={BASE_EXPRESSION_LABELS[i] || `base-${i}`}
                        className="w-full aspect-square object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 text-center text-[10px] font-medium text-white bg-black/50 py-1">
                        {BASE_EXPRESSION_LABELS[i] || `${i + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom emotion sets — flow into a flex row */}
          {customGens.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Emotion Sets
              </span>
              <div className="flex gap-3">
                {customGens.flatMap((eg) => {
                  const subLabel = eg.subtype ?? "custom";

                  if (eg.status === "generating") {
                    return ["a", "b"].map((key) => (
                      <div
                        key={`${eg.id}-sk-${key}`}
                        className="flex-1 aspect-square rounded-xl bg-gray-100 overflow-hidden relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                      </div>
                    ));
                  }

                  if (eg.status === "failed") {
                    return (
                      <div
                        key={eg.id}
                        className="flex-1 aspect-square rounded-xl bg-red-50 border border-red-200/60 p-3 text-xs text-red-600 flex items-center justify-center"
                      >
                        {subLabel} set failed
                      </div>
                    );
                  }

                  return eg.candidateImages.map((url, i) => (
                    <div
                      key={`${eg.id}-${i}`}
                      className="relative flex-1 rounded-xl overflow-hidden border border-gray-200"
                    >
                      {/* biome-ignore lint/performance/noImgElement: external R2 URLs */}
                      <img
                        src={url}
                        alt={`${subLabel} ${i === 0 ? "" : "talk"}`}
                        className="w-full aspect-square object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 text-center text-[10px] font-medium text-white bg-black/50 py-1">
                        {i === 0 ? subLabel : `${subLabel} talk`}
                      </span>
                    </div>
                  ));
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Info + actions */}
        <div className="flex-[1] min-w-[220px] bg-gray-50/70 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">
              Expression Pack
            </span>
            <p className="text-sm text-gray-600">
              {expressions.length} pack
              {expressions.length !== 1 ? "s" : ""}
              {isAnyGenerating ? " — generating..." : " generated"}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <Link
              href={`/avatars/${avatarSlug || avatarId}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              View Avatar
            </Link>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isAnyGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200 disabled:opacity-70"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? "Preparing..." : "Download All"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
