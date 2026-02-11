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
    title: "Image Prompts",
    description: "Click or drag to add",
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
    title: "Style References",
    description: "Reference from images or YouTube videos",
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
    title: "Person Reference",
    description: "Use a person's likeness",
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

  return (
    <div
      className={`relative rounded-xl overflow-hidden border transition-all duration-300
        ${
          isActive
            ? "border-[#FF0033]/50 bg-[#FF0033]/5"
            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
        }`}
    >
      <div className="group flex items-stretch h-24">
        {/* Left: Module Content - Clickable area */}
        <button
          type="button"
          className={`flex-1 p-4 cursor-pointer transition-colors duration-200 text-left ${
            isActive ? "bg-[#FF0033]/5" : "group-hover:bg-white/5"
          }`}
          onClick={onClick}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-0.5">
                {config.title}
              </h4>
              <p className="text-xs text-white/50 truncate">
                {config.description}
              </p>
            </div>
          </div>
        </button>

        {/* Right: Thumbnail area - Clickable & Droppable */}
        {/* biome-ignore lint/a11y/useSemanticElements: div with role=button is used for drag-and-drop functionality */}
        <div
          role="button"
          tabIndex={0}
          className={`w-24 h-24 cursor-pointer flex-shrink-0 transition-colors duration-200 ${
            isActive ? "bg-[#FF0033]/5" : "group-hover:bg-white/5"
          }`}
          onClick={onClick}
          onKeyUp={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isActive || uploadedFiles.length > 0 ? (
            <ReferenceImageSelector
              files={uploadedFiles}
              onRemove={onRemoveFile}
              maxFiles={3}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
});

export default ReferenceModule;
