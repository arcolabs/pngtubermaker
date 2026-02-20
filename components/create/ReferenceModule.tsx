"use client";

import { Image, Palette, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReferenceFile, ReferenceType } from "@/types/reference";

interface ReferenceModuleProps {
  type: ReferenceType;
  file: ReferenceFile | null;
  isActive: boolean;
  onClick: () => void;
  onRemoveFile: () => void;
  disabled?: boolean;
}

const MODULE_CONFIG: Record<
  ReferenceType,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
> = {
  image: {
    icon: <Image className="w-5 h-5" />,
    title: "Image Reference",
    description: "Use an image as base for generation",
  },
  style: {
    icon: <Palette className="w-5 h-5" />,
    title: "Style Reference",
    description: "Match artistic style from image",
  },
  face: {
    icon: <User className="w-5 h-5" />,
    title: "The Face",
    description: "Use specific face for consistency",
  },
};

export function ReferenceModule({
  type,
  file,
  isActive,
  onClick,
  onRemoveFile,
  disabled = false,
}: ReferenceModuleProps) {
  const config = MODULE_CONFIG[type];
  const hasFile = file !== null;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveFile();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full p-4 rounded-xl border transition-all duration-300 text-left group",
        isActive
          ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          : "border-gray-200 bg-white/50 hover:bg-white hover:border-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer",
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      )}

      {/* Horizontal layout: Left info + Right thumbnail */}
      <div className="relative flex items-center justify-between gap-4">
        {/* Left side: Icon + Content */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300",
              isActive
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-500 group-hover:bg-gray-200",
            )}
          >
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{config.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {config.description}
            </p>

            {/* Empty state hint */}
            {!hasFile && !disabled && (
              <p className="text-xs text-primary mt-1">
                {isActive ? "Click to select" : "Click to add"}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Thumbnail area (fixed width) */}
        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
          {hasFile ? (
            <div className="relative w-14 h-14">
              <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={file.url}
                  alt={file.fileName}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full
                         flex items-center justify-center shadow-md border-2 border-white
                         hover:bg-red-600 transition-colors disabled:opacity-50 z-10"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200
                          flex items-center justify-center bg-gray-50/50"
            >
              <span className="text-xs text-gray-300">?</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
