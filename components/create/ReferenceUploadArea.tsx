"use client";

import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useReferenceImageUpload } from "@/hooks/use-reference-image-upload";
import type { ReferenceFile, ReferenceType } from "@/types/reference";

interface ReferenceUploadAreaProps {
  activeType: ReferenceType | null;
  gallery: ReferenceFile[];
  onImageUploaded: (file: ReferenceFile) => void;
  onRemoveFromGallery: (fileKey: string) => void;
  disabled?: boolean;
}

export function ReferenceUploadArea({
  activeType,
  gallery,
  onImageUploaded,
  onRemoveFromGallery,
  disabled = false,
}: ReferenceUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { isUploading, progress, uploadImage, error, clearError } =
    useReferenceImageUpload();

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || !activeType) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (files.length > 0) {
        try {
          const uploadedFile = await uploadImage(files[0]);
          onImageUploaded(uploadedFile);
        } catch {
          // Error handled in hook
        }
      }
    },
    [disabled, activeType, uploadImage, onImageUploaded],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      try {
        const uploadedFile = await uploadImage(files[0]);
        onImageUploaded(uploadedFile);
        // Reset input
        e.target.value = "";
      } catch {
        // Error handled in hook
      }
    },
    [uploadImage, onImageUploaded],
  );

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleGallerySelect = (file: ReferenceFile) => {
    if (!disabled) {
      onImageUploaded(file);
    }
  };

  if (!activeType) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Layout - Fixed width upload zone + Flexible gallery */}
      <div className="flex gap-4">
        {/* Left: Upload Zone - Fixed size 48x48 (1:1 ratio) */}
        <div className="relative w-48 h-48 flex-shrink-0">
          {/* biome-ignore lint/a11y/useSemanticElements: Using div to avoid button nesting issues with error close button */}
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={disabled || isUploading ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }}
            className={`
              relative w-full h-full border-2 border-dashed rounded-xl
              flex flex-col items-center justify-center gap-3
              transition-all duration-200 outline-none
              focus:ring-2 focus:ring-primary/30 focus:border-primary/50
              ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
              }
              ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || isUploading}
            />

            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-gray-600">
                  Uploading... {progress}%
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center px-2">
                  <p className="text-sm font-medium text-gray-700">
                    Click or drag to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 2MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Gallery Area - Flexible width, takes remaining space */}
        <div className="flex-1 min-w-0 h-48 rounded-xl border border-gray-200 bg-gray-50/30 overflow-hidden">
          {gallery.length > 0 ? (
            <div className="h-full p-2 overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-1.5">
                {gallery.map((file) => (
                  <div
                    key={file.fileKey}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden border
                      transition-all duration-200 group
                      ${
                        disabled
                          ? "opacity-50 cursor-not-allowed border-gray-200"
                          : "cursor-pointer border-gray-200 hover:border-primary hover:shadow-md"
                      }
                    `}
                  >
                    <button
                      type="button"
                      onClick={() => handleGallerySelect(file)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleGallerySelect(file);
                        }
                      }}
                      className="w-full h-full p-0 border-0 bg-transparent"
                    >
                      <img
                        src={file.url}
                        alt={file.fileName}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromGallery(file.fileKey);
                      }}
                      disabled={disabled}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full 
                               flex items-center justify-center opacity-0 group-hover:opacity-100
                               transition-opacity shadow-sm hover:bg-red-600 disabled:opacity-0"
                      aria-label="Remove from gallery"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <ImageIcon className="w-8 h-8" />
              <p className="text-xs text-center px-4">
                Recent uploads will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-red-600">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0"
            aria-label="Clear error"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
