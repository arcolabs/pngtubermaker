"use client";

import { memo, useCallback, useMemo } from "react";
import ReferenceImageSelector from "./ReferenceImageSelector";
import type { ModuleConfig, ReferenceModuleProps } from "./types";

const MODULE_CONFIGS: Record<ReferenceModuleProps["type"], ModuleConfig> = {
  "image-prompt": {
    icon: (
      <svg
        className="w-6 h-6 text-white/60"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Image Reference",
    description: "Upload an existing cover to edit or improve",
  },
  "style-reference": {
    icon: (
      <svg
        className="w-6 h-6 text-white/60"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
    title: "Style Stealer",
    description: "Paste a URL or image to replicate the 'banger' aesthetic.",
  },
  "omni-reference": {
    icon: (
      <svg
        className="w-6 h-6 text-white/60"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    title: "The Face",
    description: "Ensure the AI uses a specific face for your brand",
  },
};

const ReferenceModule = memo(function ReferenceModule({
  type,
  uploadedFiles,
  isActive,
  onClick,
  onRemoveFile,
  onDropFile,
}: ReferenceModuleProps) {
  const config = useMemo(() => MODULE_CONFIGS[type], [type]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const fileDataStr = e.dataTransfer.getData("application/json");
      if (!fileDataStr) return;
      try {
        const fileData = JSON.parse(fileDataStr);
        onDropFile(fileData);
      } catch {
        // Ignore invalid JSON
      }
    },
    [onDropFile],
  );

  // Prevent click when clicking on remove button inside ReferenceImageSelector
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Check if the click target is inside the thumbnail selector but not on a remove button
      const target = e.target as HTMLElement;
      if (target.closest('[data-action="remove"]')) {
        return;
      }
      onClick?.();
    },
    [onClick],
  );

  return (
    <div
      className={`relative rounded-lg sm:rounded-xl overflow-visible border transition-all duration-300
        ${
          isActive
            ? "border-[#FF0033]/50 bg-[#FF0033]/5 shadow-[0_0_20px_rgba(255,0,51,0.15)] animate-pulse-glow"
            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
        }`}
    >
      <button
        type="button"
        className={`group w-full flex items-stretch min-h-[76px] sm:min-h-[96px] cursor-pointer transition-colors duration-200 text-left ${
          isActive ? "bg-[#FF0033]/5" : "hover:bg-white/5"
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        aria-label={`${config.title} module - click to activate or drag image here`}
      >
        {/* Left: Module Content */}
        <div className="flex-1 p-2.5 sm:p-4 min-w-0">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 mt-0.5 scale-90 sm:scale-100">
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">
                {config.title}
              </h4>
              <p className="text-[10px] sm:text-xs text-white/50 leading-relaxed">
                {config.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Thumbnail area */}
        <div className="w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 pointer-events-none m-2 sm:m-2">
          {isActive || uploadedFiles.length > 0 ? (
            <div className="pointer-events-auto w-full h-full overflow-visible">
              <ReferenceImageSelector
                files={uploadedFiles}
                onRemove={onRemoveFile}
                maxFiles={3}
              />
            </div>
          ) : null}
        </div>
      </button>
    </div>
  );
});

export default ReferenceModule;
