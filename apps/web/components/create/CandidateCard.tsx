"use client";

import { Check, Maximize2 } from "lucide-react";
import { ImageActionIcons } from "@/components/ui/ImageActionIcons";
import { SafeImage } from "@/components/ui/SafeImage";

interface CandidateCardProps {
  imageUrl: string;
  index: number;
  aspectRatioClass: string;
  isSelected: boolean;
  disabled: boolean;
  label?: string;
  onSelect: () => void;
  onPreview: () => void;
}

export function CandidateCard({
  imageUrl,
  index,
  aspectRatioClass,
  isSelected,
  disabled,
  label,
  onSelect,
  onPreview,
}: CandidateCardProps) {
  // Determine display label
  const displayLabel = label || `Option ${index + 1}`;

  return (
    <div className="relative group">
      {/* Main image button - click to select */}
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className={`relative w-full ${aspectRatioClass} rounded-xl overflow-hidden transition-all duration-300 ${
          isSelected
            ? "ring-[3px] ring-primary shadow-[0_4px_20px_rgba(6,182,212,0.25)] scale-[1.02]"
            : disabled
              ? "ring-1 ring-gray-200 opacity-60 cursor-not-allowed"
              : "ring-1 ring-gray-200 hover:ring-gray-300"
        }`}
      >
        <SafeImage
          src={imageUrl}
          alt={displayLabel}
          fill
          className="object-cover"
        />

        {/* Hover gradient overlay */}
        {!disabled && !isSelected && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Hover label - show in center */}
        {!disabled && !isSelected && (
          <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className="text-white text-sm font-medium">
              {displayLabel}
            </span>
          </div>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg animate-[scaleIn_0.2s_ease-out]">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </button>

      {/* Fixed label below image for expression_base type */}
      {label && (
        <div className="mt-2 text-center">
          <span className="text-xs font-medium text-gray-600">{label}</span>
        </div>
      )}

      {/* Preview button - appears on hover in top-left corner */}
      {!disabled && !isSelected && (
        <button
          type="button"
          onClick={onPreview}
          className="absolute top-2 left-2 z-10 p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105"
          title="Preview image"
        >
          <Maximize2 className="w-4 h-4 text-gray-700" />
        </button>
      )}

      {!disabled && (
        <ImageActionIcons
          imageUrl={imageUrl}
          filename={`candidate-${index + 1}`}
        />
      )}
    </div>
  );
}
