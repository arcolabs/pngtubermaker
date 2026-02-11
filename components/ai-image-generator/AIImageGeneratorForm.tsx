"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { SIZE_PRESETS } from "./constants";
import { useAutoResizeTextarea } from "./hooks/useAutoResizeTextarea";
import { useAIGeneratorPersistentState } from "./hooks/usePersistentState";
import ReferenceModule from "./ReferenceModule";
import ReferenceUploadArea from "./ReferenceUploadArea";
import type {
  AIImageGeneratorFormProps,
  ModuleType,
  UploadedFile,
} from "./types";
import YouTubeUrlInput, { type YouTubeThumbnail } from "./YouTubeUrlInput";

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
  // Check if using external (controlled) mode or internal (persistent) mode
  const isControlled =
    externalActiveModuleType !== undefined ||
    externalImagePromptFiles !== undefined ||
    externalStyleReferenceFiles !== undefined ||
    externalOmniReferenceFile !== undefined ||
    externalUploadedImages !== undefined;

  // Use persistent state only in uncontrolled mode
  const persistentState = useAIGeneratorPersistentState();

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

  const hasSyncedRef = useRef(false);

  // Sync persistent state to internal state on mount (for uncontrolled mode) - only once
  // biome-ignore lint/correctness/useExhaustiveDependencies: We use hasSyncedRef to ensure this only runs once on mount
  useEffect(() => {
    // Skip if already synced, in controlled mode, or still loading
    if (hasSyncedRef.current || isControlled || persistentState.isLoading)
      return;

    hasSyncedRef.current = true;
    setInternalActiveModuleType(persistentState.activeModuleType);
    setInternalImagePromptFiles(persistentState.imagePromptFiles);
    setInternalStyleReferenceFiles(persistentState.styleReferenceFiles);
    setInternalOmniReferenceFile(persistentState.omniReferenceFile);
    setInternalUploadedImages(persistentState.uploadedImages);
    setInternalStyleReferenceYoutubeUrl(persistentState.youtubeUrl);
  }, [isControlled, persistentState.isLoading]);

  // Use external or internal state
  const activeModuleType = isControlled
    ? (externalActiveModuleType ?? null)
    : internalActiveModuleType;
  const imagePromptFiles = isControlled
    ? (externalImagePromptFiles ?? [])
    : internalImagePromptFiles;
  const styleReferenceFiles = isControlled
    ? (externalStyleReferenceFiles ?? [])
    : internalStyleReferenceFiles;
  const omniReferenceFile = isControlled
    ? externalOmniReferenceFile
    : internalOmniReferenceFile;
  const uploadedImages = isControlled
    ? (externalUploadedImages ?? [])
    : internalUploadedImages;
  const styleReferenceYoutubeUrl = isControlled
    ? externalStyleReferenceYoutubeUrl
    : internalStyleReferenceYoutubeUrl;

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
        // Persist to IndexedDB
        persistentState.setActiveModuleType(newType);
      }
    },
    [activeModuleType, externalOnModuleTypeChange, persistentState],
  );

  // Remove file handlers
  const handleRemoveImagePrompt = useCallback(
    (file: UploadedFile) => {
      if (onRemoveImagePrompt) {
        onRemoveImagePrompt(file);
      } else {
        setInternalImagePromptFiles((prev) => {
          const newFiles = prev.filter((f) => f.fileKey !== file.fileKey);
          persistentState.setImagePromptFiles(newFiles);
          return newFiles;
        });
      }
    },
    [onRemoveImagePrompt, persistentState],
  );

  const handleRemoveStyleReference = useCallback(
    (file: UploadedFile) => {
      if (onRemoveStyleReference) {
        onRemoveStyleReference(file);
      } else {
        setInternalStyleReferenceFiles((prev) => {
          const newFiles = prev.filter((f) => f.fileKey !== file.fileKey);
          persistentState.setStyleReferenceFiles(newFiles);
          return newFiles;
        });
      }
    },
    [onRemoveStyleReference, persistentState],
  );

  const handleRemoveOmniReference = useCallback(
    (file: UploadedFile) => {
      if (onRemoveOmniReference) {
        onRemoveOmniReference(file);
      } else {
        setInternalOmniReferenceFile(null);
        persistentState.setOmniReferenceFile(null);
      }
    },
    [onRemoveOmniReference, persistentState],
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
              setInternalImagePromptFiles((prev) => {
                const newFiles = [...prev, file];
                persistentState.setImagePromptFiles(newFiles);
                return newFiles;
              });
            }
            break;
          case "style-reference":
            if (
              !internalStyleReferenceFiles.find(
                (f) => f.fileKey === file.fileKey,
              )
            ) {
              setInternalStyleReferenceFiles((prev) => {
                const newFiles = [...prev, file];
                persistentState.setStyleReferenceFiles(newFiles);
                return newFiles;
              });
            }
            break;
          case "omni-reference":
            setInternalOmniReferenceFile(file);
            persistentState.setOmniReferenceFile(file);
            break;
        }
      }
    },
    [
      onDropToModule,
      internalImagePromptFiles,
      internalStyleReferenceFiles,
      persistentState,
    ],
  );

  // Image uploaded handler
  const handleImageUploaded = useCallback(
    (file: UploadedFile) => {
      if (onImageUploaded) {
        onImageUploaded(file);
      } else {
        setInternalUploadedImages((prev) => {
          const newFiles = [...prev, file];
          persistentState.setUploadedImages(newFiles);
          return newFiles;
        });

        // Auto-add to active module
        if (activeModuleType) {
          handleDropToModule(file, activeModuleType);
        }
      }
    },
    [onImageUploaded, activeModuleType, handleDropToModule, persistentState],
  );

  // Remove uploaded image handler
  const handleRemoveUploadedImage = useCallback(
    (fileKey: string) => {
      if (onRemoveUploadedImage) {
        onRemoveUploadedImage(fileKey);
      } else {
        setInternalUploadedImages((prev) => {
          const newFiles = prev.filter((f) => f.fileKey !== fileKey);
          persistentState.setUploadedImages(newFiles);
          return newFiles;
        });
        // Also remove from modules
        setInternalImagePromptFiles((prev) => {
          const newFiles = prev.filter((f) => f.fileKey !== fileKey);
          persistentState.setImagePromptFiles(newFiles);
          return newFiles;
        });
        setInternalStyleReferenceFiles((prev) => {
          const newFiles = prev.filter((f) => f.fileKey !== fileKey);
          persistentState.setStyleReferenceFiles(newFiles);
          return newFiles;
        });
        if (internalOmniReferenceFile?.fileKey === fileKey) {
          setInternalOmniReferenceFile(null);
          persistentState.setOmniReferenceFile(null);
        }
      }
    },
    [onRemoveUploadedImage, internalOmniReferenceFile, persistentState],
  );

  // Handle YouTube thumbnail fetched from URL
  const handleYouTubeThumbnailFetched = useCallback(
    (thumbnail: YouTubeThumbnail) => {
      // Convert thumbnail to UploadedFile format
      const uploadedFile: UploadedFile = {
        url: thumbnail.url,
        fileKey: `youtube-${thumbnail.videoId}-${thumbnail.name}`,
        fileName: `youtube-${thumbnail.videoId}-${thumbnail.name}.jpg`,
      };

      // Check if already exists
      const exists = uploadedImages.some(
        (f) => f.fileKey === uploadedFile.fileKey,
      );
      if (exists) return;

      // Add to uploaded images
      handleImageUploaded(uploadedFile);
    },
    [uploadedImages, handleImageUploaded],
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
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${
            activeModuleType ? "mb-4 sm:mb-6" : ""
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
          <YouTubeUrlInput
            value={styleReferenceYoutubeUrl}
            onChange={(value) => {
              if (onStyleReferenceYoutubeUrlChange) {
                onStyleReferenceYoutubeUrlChange(value);
              } else {
                setInternalStyleReferenceYoutubeUrl(value);
              }
            }}
            onThumbnailFetched={handleYouTubeThumbnailFetched}
            disabled={isGenerating}
          />
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
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {SIZE_PRESETS.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => onFormChange({ size })}
                className={`group relative px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300
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
            className={`group relative inline-flex flex-shrink-0 items-center justify-center gap-2 sm:gap-3
                     rounded-xl px-4 sm:px-8 py-3 sm:py-4 w-full sm:w-auto
                     border transition-all duration-300 ease-out
                     whitespace-nowrap
                     ${
                       !formState.prompt.trim() && !isGenerating
                         ? "bg-white/5 border-white/10 cursor-not-allowed opacity-60"
                         : "bg-gradient-to-r from-[#FF0033] via-[#FF2244] to-[#FF3355] border-white/20 shadow-lg shadow-[#FF0033]/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FF0033]/30 hover:border-white/30 active:scale-[0.98]"
                     }`}
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
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
            ) : !formState.prompt.trim() ? (
              <>
                <svg
                  className="w-5 h-5 text-white/50 relative"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="relative font-bold tracking-wide text-white/70">
                  Enter prompt first
                </span>
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
                <span className="relative rounded-full bg-white/25 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold text-white border border-white/40">
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
