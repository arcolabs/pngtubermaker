"use client";

import { memo } from "react";
import AIImageGeneratorResultCard from "./AIImageGeneratorResultCard";
import type { AIImageGeneratorResultsProps } from "./types";

const AIImageGeneratorResults = memo(function AIImageGeneratorResults({
  task,
  onRegenerate,
}: AIImageGeneratorResultsProps) {
  if (!task) return null;

  const isGenerating = task.status === "queued" || task.status === "running";
  const hasImages = task.images && task.images.length > 0;
  const isFailed = task.status === "failed";

  // Determine grid layout based on image count
  const getGridClass = () => {
    if (task.images?.length === 1) return "grid-cols-1 max-w-2xl mx-auto";
    if (task.images?.length === 2) return "grid-cols-1 sm:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";
  };

  const handleDownload = (url: string) => {
    // Create a temporary anchor to download the image
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = `generated-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            {isGenerating
              ? "Generating..."
              : isFailed
                ? "Generation Failed"
                : "Generated Images"}
          </h3>
          <p className="text-white/60 text-sm">
            {isGenerating
              ? `Progress: ${Math.round(task.progress || 0)}%`
              : hasImages
                ? `${task.images.length} images generated`
                : "Something went wrong"}
          </p>
        </div>

        {/* Regenerate button */}
        {!isGenerating && (
          <button
            type="button"
            onClick={onRegenerate}
            className="group inline-flex items-center gap-2 px-4 py-2
                     rounded-xl border border-white/10
                     bg-white/5 hover:bg-white/10
                     text-white/80 hover:text-white
                     transition-all duration-300"
          >
            <svg
              className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Regenerate
          </button>
        )}
      </div>

      {/* Progress bar */}
      {isGenerating && (
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF0033] to-[#FF3355] transition-all duration-300"
            style={{ width: `${task.progress || 0}%` }}
          />
        </div>
      )}

      {/* Loading placeholders */}
      {isGenerating && !hasImages && (
        <div className={`grid ${getGridClass()} gap-4`}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-2xl bg-white/5 animate-pulse border border-white/10"
            />
          ))}
        </div>
      )}

      {/* Generated images */}
      {hasImages && (
        <div className={`grid ${getGridClass()} gap-4`}>
          {task.images.map((url, index) => (
            <AIImageGeneratorResultCard
              key={`${task.id}-${index}`}
              imageUrl={url}
              index={index}
              total={task.images.length}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isFailed && (
        <div className="p-8 text-center rounded-2xl border border-[#FF0033]/30 bg-[#FF0033]/5">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-[#FF5555]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-[#FF5555] font-medium mb-2">Generation Failed</p>
          <p className="text-white/60 text-sm">
            {task.error || "Please try again"}
          </p>
        </div>
      )}
    </div>
  );
});

export default AIImageGeneratorResults;
