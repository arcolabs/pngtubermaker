"use client";

import Image from "next/image";
import { memo } from "react";
import type { AIImageGeneratorResultCardProps } from "./types";

const AIImageGeneratorResultCard = memo(function AIImageGeneratorResultCard({
  imageUrl,
  index,
  total,
  onDownload,
}: AIImageGeneratorResultCardProps) {
  const handleDownload = () => {
    onDownload(imageUrl);
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden
                 border border-white/10 
                 shadow-[inset_0_0_16px_rgba(240,247,245,0.05)]
                 hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                 hover:border-white/20
                 bg-white/5
                 transition-all duration-300 ease-in-out"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Gradient border overlay */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Image number badge */}
      <div className="absolute top-3 right-3 z-10 text-xs font-mono text-white/30 group-hover:text-primary/40 transition-colors duration-300">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Image container */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Generated image ${index + 1} of ${total}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            className="absolute bottom-4 left-1/2 -translate-x-1/2
                     inline-flex items-center gap-2 px-4 py-2
                     bg-white/10 hover:bg-[#FF0033]/80
                     border border-white/20 hover:border-[#FF0033]/50
                     rounded-xl text-white text-sm font-medium
                     backdrop-blur-sm
                     transition-all duration-300
                     hover:scale-105"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Info section */}
      <div className="p-4">
        <p className="text-xs text-white/50 font-mono">
          Image {index + 1} of {total}
        </p>
      </div>
    </div>
  );
});

export default AIImageGeneratorResultCard;
