"use client";

import { memo, useCallback, useState } from "react";
import { SIZE_PRESETS } from "./constants";
import { useAutoResizeTextarea } from "./hooks/useAutoResizeTextarea";
import ReferenceModule from "./ReferenceModule";
import ReferenceUploadArea from "./ReferenceUploadArea";
import type {
  AIImageGeneratorFormProps,
  ModuleType,
  UploadedFile,
} from "./types";

const AIImageGeneratorForm = memo(function AIImageGeneratorForm({
  formState,
  onFormChange,
  onSubmit,
  isGenerating,
  // Reference module props with defaults
  activeModuleType: externalActiveModuleType,
  onModuleTypeChange: externalOnModuleTypeChange,
  imagePromptFiles: externalImagePromptFiles,
  styleReferenceFiles: externalStyleReferenceFiles,
  omniReferenceFile: externalOmniReferenceFile,
  uploadedImages: externalUploadedImages,
  onRemoveImagePrompt,
  onRemoveStyleReference,
  onRemoveOmniReference,
  onDropToModule,
  onImageUploaded,
  onRemoveUploadedImage,
  styleReferenceYoutubeUrl: externalStyleReferenceYoutubeUrl = "",
  onStyleReferenceYoutubeUrlChange,
}: AIImageGeneratorFormProps) {
  // Internal state for reference modules (if not provided externally)
  const [internalActiveModuleType, setInternalActiveModuleType] =
    useState<ModuleType | null>(null);
  const [internalImagePromptFiles, setInternalImagePromptFiles] = useState<
    UploadedFile[]
  >([]);
  const [internalStyleReferenceFiles, setInternalStyleReferenceFiles] =
    useState<UploadedFile[]>([]);
  const [internalOmniReferenceFile, setInternalOmniReferenceFile] =
    useState<UploadedFile | null>(null);
  const [internalUploadedImages, setInternalUploadedImages] = useState<
    UploadedFile[]
  >([]);
  const [
    internalStyleReferenceYoutubeUrl,
    setInternalStyleReferenceYoutubeUrl,
  ] = useState("");

  // Use external or internal state
  const activeModuleType = externalActiveModuleType ?? internalActiveModuleType;
  const imagePromptFiles = externalImagePromptFiles ?? internalImagePromptFiles;
  const styleReferenceFiles =
    externalStyleReferenceFiles ?? internalStyleReferenceFiles;
  const omniReferenceFile =
    externalOmniReferenceFile ?? internalOmniReferenceFile;
  const uploadedImages = externalUploadedImages ?? internalUploadedImages;
  const styleReferenceYoutubeUrl =
    externalStyleReferenceYoutubeUrl ?? internalStyleReferenceYoutubeUrl;

  const promptRef = useAutoResizeTextarea(formState.prompt, {
    minHeight: 48,
    maxHeight: "unlimited",
  });

  const handleSubmit = useCallback(() => {
    if (!formState.prompt.trim() || isGenerating) return;
    onSubmit();
  }, [formState.prompt, isGenerating, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // Module toggle
  const handleModuleClick = useCallback(
    (type: ModuleType) => {
      const newType = activeModuleType === type ? null : type;
      if (externalOnModuleTypeChange) {
        externalOnModuleTypeChange(newType);
      } else {
        setInternalActiveModuleType(newType);
      }
    },
    [activeModuleType, externalOnModuleTypeChange],
  );

  // Remove file handlers
  const handleRemoveImagePrompt = useCallback(
    (file: UploadedFile) => {
      if (onRemoveImagePrompt) {
        onRemoveImagePrompt(file);
      } else {
        setInternalImagePromptFiles((prev) =>
          prev.filter((f) => f.fileKey !== file.fileKey),
        );
      }
    },
    [onRemoveImagePrompt],
  );

  const handleRemoveStyleReference = useCallback(
    (file: UploadedFile) => {
      if (onRemoveStyleReference) {
        onRemoveStyleReference(file);
      } else {
        setInternalStyleReferenceFiles((prev) =>
          prev.filter((f) => f.fileKey !== file.fileKey),
        );
      }
    },
    [onRemoveStyleReference],
  );

  const handleRemoveOmniReference = useCallback(
    (file: UploadedFile) => {
      if (onRemoveOmniReference) {
        onRemoveOmniReference(file);
      } else {
        setInternalOmniReferenceFile(null);
      }
    },
    [onRemoveOmniReference],
  );

  // Drop to module handler
  const handleDropToModule = useCallback(
    (file: UploadedFile, type: ModuleType) => {
      if (onDropToModule) {
        onDropToModule(file, type);
      } else {
        switch (type) {
          case "image-prompt":
            if (
              !internalImagePromptFiles.find((f) => f.fileKey === file.fileKey)
            ) {
              setInternalImagePromptFiles((prev) => [...prev, file]);
            }
            break;
          case "style-reference":
            if (
              !internalStyleReferenceFiles.find(
                (f) => f.fileKey === file.fileKey,
              )
            ) {
              setInternalStyleReferenceFiles((prev) => [...prev, file]);
            }
            break;
          case "omni-reference":
            setInternalOmniReferenceFile(file);
            break;
        }
      }
    },
    [onDropToModule, internalImagePromptFiles, internalStyleReferenceFiles],
  );

  // Image uploaded handler
  const handleImageUploaded = useCallback(
    (file: UploadedFile) => {
      if (onImageUploaded) {
        onImageUploaded(file);
      } else {
        setInternalUploadedImages((prev) => [...prev, file]);

        // Auto-add to active module
        if (activeModuleType) {
          handleDropToModule(file, activeModuleType);
        }
      }
    },
    [onImageUploaded, activeModuleType, handleDropToModule],
  );

  // Remove uploaded image handler
  const handleRemoveUploadedImage = useCallback(
    (fileKey: string) => {
      if (onRemoveUploadedImage) {
        onRemoveUploadedImage(fileKey);
      } else {
        setInternalUploadedImages((prev) =>
          prev.filter((f) => f.fileKey !== fileKey),
        );
        // Also remove from modules
        setInternalImagePromptFiles((prev) =>
          prev.filter((f) => f.fileKey !== fileKey),
        );
        setInternalStyleReferenceFiles((prev) =>
          prev.filter((f) => f.fileKey !== fileKey),
        );
        if (internalOmniReferenceFile?.fileKey === fileKey) {
          setInternalOmniReferenceFile(null);
        }
      }
    },
    [onRemoveUploadedImage, internalOmniReferenceFile],
  );

  return (
    <div
      className="relative rounded-2xl overflow-hidden
                 border border-white/10
                 shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                 bg-white/5 backdrop-blur-sm"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-50 pointer-events-none" />

      <div className="relative pt-4 sm:pt-5 px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
        {/* Prompt Input */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            AI Thumbnail Generator
          </h2>
          <textarea
            id="image-prompt"
            aria-label="Prompt for thumbnail"
            ref={promptRef}
            value={formState.prompt}
            onChange={(e) => onFormChange({ prompt: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Enter prompt, e.g.: A person holding a laptop with code on screen, dramatic lighting"
            className="w-full px-4 py-3
                     bg-black/40 border border-white/10 rounded-xl
                     text-white placeholder-white/40
                     focus:outline-none focus:ring-2 focus:ring-[#FF0033]/50 focus:border-[#FF0033]/50
                     transition-all duration-200 resize-none"
            rows={1}
            style={{ height: "auto" }}
          />
        </div>

        {/* Reference Modules */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${
            activeModuleType ? "mb-6" : ""
          }`}
        >
          <ReferenceModule
            type="image-prompt"
            uploadedFiles={imagePromptFiles}
            isActive={activeModuleType === "image-prompt"}
            onClick={() => handleModuleClick("image-prompt")}
            onRemoveFile={handleRemoveImagePrompt}
            onDropFile={(file) => handleDropToModule(file, "image-prompt")}
          />
          <ReferenceModule
            type="style-reference"
            uploadedFiles={styleReferenceFiles}
            isActive={activeModuleType === "style-reference"}
            onClick={() => handleModuleClick("style-reference")}
            onRemoveFile={handleRemoveStyleReference}
            onDropFile={(file) => handleDropToModule(file, "style-reference")}
          />
          <ReferenceModule
            type="omni-reference"
            uploadedFiles={omniReferenceFile ? [omniReferenceFile] : []}
            isActive={activeModuleType === "omni-reference"}
            onClick={() => handleModuleClick("omni-reference")}
            onRemoveFile={handleRemoveOmniReference}
            onDropFile={(file) => handleDropToModule(file, "omni-reference")}
          />
        </div>

        {/* YouTube URL Input - Only for style-reference module, shown above upload area */}
        {activeModuleType === "style-reference" && (
          <div className="space-y-1">
            <label
              htmlFor="youtube-url-input-main"
              className="text-xs text-white/60 ml-1"
            >
              YouTube URL (auto-fetch thumbnail)
            </label>
            <div className="relative">
              <input
                id="youtube-url-input-main"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={styleReferenceYoutubeUrl}
                onChange={(e) => {
                  if (onStyleReferenceYoutubeUrlChange) {
                    onStyleReferenceYoutubeUrlChange(e.target.value);
                  } else {
                    setInternalStyleReferenceYoutubeUrl(e.target.value);
                  }
                }}
                placeholder="Paste YouTube URL to fetch thumbnail..."
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl
                         text-white placeholder-white/40
                         focus:outline-none focus:ring-2 focus:ring-[#FF0033]/50 focus:border-[#FF0033]/50
                         transition-all duration-200"
                aria-label="YouTube video URL for style reference"
              />
            </div>
          </div>
        )}

        {/* Upload Area - Only show when a module is active */}
        {activeModuleType && (
          <ReferenceUploadArea
            uploadedImages={uploadedImages}
            onImageUploaded={handleImageUploaded}
            onRemoveImage={handleRemoveUploadedImage}
            variant={activeModuleType}
            youtubeUrl={styleReferenceYoutubeUrl}
          />
        )}

        {/* Aspect Ratio & Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-3">
            {SIZE_PRESETS.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => onFormChange({ size })}
                className={`group relative px-4 py-3 rounded-xl border transition-all duration-300
                  ${
                    formState.size?.id === size.id
                      ? "border-[#FF0033]/50 bg-[#FF0033]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded border-2 border-current ${
                      size.id === "youtube-cover"
                        ? "w-6 h-4"
                        : size.id === "youtube-shorts"
                          ? "w-4 h-6"
                          : "w-5 h-5"
                    }`}
                  />
                  <div>
                    <span className="text-sm font-medium text-white block">
                      {size.name}
                    </span>
                    <span className="text-xs text-white/50">
                      {size.ratio} · {size.dimensions}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formState.prompt.trim() || isGenerating}
            className="group relative inline-flex flex-shrink-0 items-center gap-3
                     rounded-xl px-8 py-4
                     bg-gradient-to-r from-[#FF0033] via-[#FF2244] to-[#FF3355]
                     border border-white/20
                     shadow-lg shadow-[#FF0033]/20
                     transition-all duration-300 ease-out
                     hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FF0033]/30
                     hover:border-white/30
                     active:scale-[0.98]
                     disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed
                     disabled:hover:scale-100 disabled:shadow-none
                     overflow-hidden whitespace-nowrap"
          >
            {/* Animated shine */}
            <div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                        bg-gradient-to-r from-transparent via-white/20 to-transparent
                        transition-transform duration-1000 ease-in-out"
            />

            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="relative font-semibold">Generating...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 text-white relative"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="relative font-bold tracking-wide">
                  Generate Thumbnail
                </span>
                <span className="relative rounded-full bg-white/25 backdrop-blur-sm px-3 py-1 text-sm font-bold text-white border border-white/40">
                  Free
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default AIImageGeneratorForm;
