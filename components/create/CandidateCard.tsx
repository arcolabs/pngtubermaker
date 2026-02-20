"use client";

import { Check } from "lucide-react";

interface CandidateCardProps {
  imageUrl: string;
  index: number;
  isSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

export function CandidateCard({
  imageUrl,
  index,
  isSelected,
  disabled,
  onSelect,
}: CandidateCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`group relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? "ring-[3px] ring-primary shadow-[0_4px_20px_rgba(6,182,212,0.25)] scale-[1.02]"
          : disabled
            ? "ring-1 ring-gray-200 opacity-60 cursor-not-allowed"
            : "ring-1 ring-gray-200 hover:ring-gray-300"
      }`}
    >
      <img
        src={imageUrl}
        alt={`Option ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "";
          (e.target as HTMLImageElement).classList.add("bg-gray-200");
        }}
      />

      {!disabled && !isSelected && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {!disabled && !isSelected && (
        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-white text-sm font-medium">
            Option {index + 1}
          </span>
        </div>
      )}

      {isSelected && (
        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg animate-[scaleIn_0.2s_ease-out]">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}
