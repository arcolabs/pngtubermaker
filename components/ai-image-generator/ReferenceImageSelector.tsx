"use client";

import Image from "next/image";
import { memo, useCallback, useState } from "react";
import type { ReferenceImageSelectorProps } from "./types";

const ReferenceImageSelector = memo(function ReferenceImageSelector({
  files,
  onRemove,
  maxFiles = 3,
}: ReferenceImageSelectorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleRemove = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent, file: (typeof files)[0]) => {
      e.stopPropagation();
      onRemove(file);
    },
    [onRemove],
  );

  // Filter out files with invalid URLs
  const validFiles = files.filter((f) => f.url?.startsWith("http"));
  if (validFiles.length === 0) {
    return null;
  }

  const displayFiles = validFiles.slice(0, maxFiles);
  const remainingCount = validFiles.length - maxFiles;
  const count = displayFiles.length;

  // Calculate symmetric layout based on count
  const getCardStyle = (index: number) => {
    const isHovered = hoveredIndex === index;

    if (count === 1) {
      // Single card - centered, no rotation
      return {
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        scale: isHovered ? 1.1 : 1,
        zIndex: 10,
      };
    }

    if (count === 2) {
      // Two cards - symmetric left/right
      const isLeft = index === 0;
      return {
        rotation: isLeft ? -8 : 8,
        offsetX: isLeft ? -12 : 12,
        offsetY: 2,
        scale: isHovered ? 1.15 : 0.92,
        zIndex: isHovered ? 20 : 10 - index,
      };
    }

    // Three cards - center + symmetric sides
    if (index === 1) {
      // Center card
      return {
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        scale: isHovered ? 1.12 : 0.95,
        zIndex: 15,
      };
    }
    if (index === 0) {
      // Left card
      return {
        rotation: -10,
        offsetX: -16,
        offsetY: 4,
        scale: isHovered ? 1.15 : 0.88,
        zIndex: isHovered ? 20 : 10,
      };
    }
    // Right card
    return {
      rotation: 10,
      offsetX: 16,
      offsetY: 4,
      scale: isHovered ? 1.15 : 0.88,
      zIndex: isHovered ? 20 : 10,
    };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2">
      {displayFiles.map((file, index) => {
        const isExternalUrl =
          file.url.startsWith("https://") || file.url.startsWith("http://");
        const style = getCardStyle(index);
        const isHovered = hoveredIndex === index;

        // Expand effect on hover - cards spread out more
        const expandX = isHovered
          ? count === 3
            ? (index - 1) * 24
            : index === 0
              ? -8
              : 8
          : 0;

        return (
          // biome-ignore lint/a11y/useSemanticElements: div with role=button is used for complex styling and animations
          <div
            key={file.fileKey}
            role="button"
            tabIndex={0}
            className="absolute rounded-xl overflow-hidden border-2 shadow-xl
                       transition-all duration-350 ease-out cursor-pointer group
                       hover:shadow-2xl hover:shadow-[#FF0033]/25"
            style={{
              width: "54px",
              height: "54px",
              left: `calc(50% - 27px + ${style.offsetX}px + ${expandX}px)`,
              top: `calc(50% - 27px + ${style.offsetY}px)`,
              transform: `rotate(${style.rotation}deg) scale(${style.scale})`,
              zIndex: style.zIndex,
              borderColor: isHovered
                ? "rgba(255, 0, 51, 0.7)"
                : "rgba(255, 255, 255, 0.25)",
              backgroundColor: isHovered
                ? "rgba(255, 0, 51, 0.08)"
                : "transparent",
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Image
              src={file.url}
              alt={file.fileName}
              fill
              className="object-cover"
              sizes="54px"
              unoptimized={isExternalUrl}
            />

            {/* Remove button - shows on hover */}
            {/* biome-ignore lint/a11y/useSemanticElements: div with role=button is used for consistency with parent */}
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => handleRemove(e, file)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRemove(e, file);
                }
              }}
              className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-black/75 hover:bg-red-500
                       flex items-center justify-center transition-all duration-200
                       opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
              aria-label="Remove image"
            >
              <svg
                aria-hidden="true"
                className="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            {/* Subtle index badge */}
            <div
              className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-black/40 backdrop-blur-sm
                          flex items-center justify-center"
            >
              <span className="text-[8px] font-semibold text-white/90">
                {index + 1}
              </span>
            </div>
          </div>
        );
      })}

      {/* Remaining count badge */}
      {remainingCount > 0 && (
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#FF0033] flex items-center justify-center text-[10px] font-bold text-white shadow-lg z-30">
          +{remainingCount}
        </div>
      )}
    </div>
  );
});

export default ReferenceImageSelector;
