"use client";

import { Eye, Loader2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { ImageActionIcons } from "@/components/ui/ImageActionIcons";

export type ReferenceSheetCardState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "failed"; error: string }
  | { status: "completed"; url: string; generatedAt: string };

interface ReferenceSheetResultCardProps {
  avatarId: string;
  avatarSlug?: string | null;
  state: ReferenceSheetCardState;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function ReferenceSheetResultCard({
  avatarId,
  avatarSlug,
  state,
  onGenerate,
  onRegenerate,
}: ReferenceSheetResultCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-[4] min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
            Character Reference Sheet
          </span>

          {state.status === "idle" && (
            <div className="aspect-square rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <p className="text-sm text-gray-400">Not generated yet</p>
            </div>
          )}

          {state.status === "generating" && (
            <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            </div>
          )}

          {state.status === "failed" && (
            <div className="rounded-xl bg-red-50 border border-red-200/60 p-4 text-sm text-red-600">
              {state.error}
            </div>
          )}

          {state.status === "completed" && (
            <div className="relative group rounded-xl overflow-hidden border border-gray-200">
              {/* biome-ignore lint/performance/noImgElement: external R2 URLs */}
              <img
                src={state.url}
                alt="Character reference sheet"
                className="w-full aspect-square object-contain bg-white"
              />
              <ImageActionIcons
                imageUrl={state.url}
                filename={`reference-sheet-${avatarId}`}
              />
            </div>
          )}
        </div>

        <div className="flex-[1] min-w-[220px] bg-gray-50/70 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">
              Reference Sheet
            </span>
            <p className="text-sm text-gray-600">
              {state.status === "completed"
                ? "Three views, expressions, palette & world setting — all in one sheet."
                : state.status === "generating"
                  ? "Generating... takes about 30s."
                  : state.status === "failed"
                    ? "Something went wrong. Credits were refunded."
                    : "Turn this character into an official-style reference sheet."}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            {state.status === "idle" && (
              <button
                type="button"
                onClick={onGenerate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Generate Character Sheet
                <span className="text-white/70 text-xs">(200)</span>
              </button>
            )}
            {state.status === "generating" && (
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl opacity-70"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </button>
            )}
            {state.status === "failed" && (
              <button
                type="button"
                onClick={onGenerate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Try Again
              </button>
            )}
            {state.status === "completed" && (
              <>
                <Link
                  href={`/avatars/${avatarSlug || avatarId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
                >
                  <Eye className="w-4 h-4" />
                  View Avatar
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Regenerate will overwrite the current reference sheet and cost 200 credits. Continue?",
                      )
                    ) {
                      onRegenerate();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate (200)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
