"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useReferenceImageUpload } from "@/hooks/use-reference-image-upload";
import type { ReferenceFile } from "@/types/reference";

interface ReferenceUploadAreaProps {
  referenceFile: ReferenceFile | null;
  onFileSelected: (file: ReferenceFile) => void;
  onImageUploaded: (file: ReferenceFile) => void;
  onRemoveFile: () => void;
  disabled?: boolean;
}

export function ReferenceUploadArea({
  referenceFile,
  onFileSelected,
  onImageUploaded,
  onRemoveFile,
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

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (files.length > 0) {
        try {
          const uploadedFile = await uploadImage(files[0]);
          onImageUploaded(uploadedFile);
          onFileSelected(uploadedFile);
        } catch {
          // Error handled in hook
        }
      }
    },
    [disabled, uploadImage, onImageUploaded, onFileSelected],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      try {
        const uploadedFile = await uploadImage(files[0]);
        onImageUploaded(uploadedFile);
        onFileSelected(uploadedFile);
        e.target.value = "";
      } catch {
        // Error handled in hook
      }
    },
    [uploadImage, onImageUploaded, onFileSelected],
  );

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Current reference + Upload zone */}
      <div className="flex gap-3">
        {/* Current reference preview */}
        {referenceFile && (
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="w-full h-full rounded-lg overflow-hidden border border-primary/30 shadow-sm">
              <SafeImage
                src={referenceFile.url}
                alt={referenceFile.fileName}
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              disabled={disabled}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full
                       flex items-center justify-center shadow-md border-2 border-white
                       hover:bg-red-600 transition-colors disabled:opacity-50 z-10"
              aria-label="Remove reference image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Upload zone */}
        <div className="relative flex-1 min-h-[80px]">
          {/* biome-ignore lint/a11y/useSemanticElements: Using div to avoid button nesting issues */}
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
              w-full h-full border-2 border-dashed rounded-xl
              flex items-center justify-center gap-3 px-4
              transition-all duration-200 outline-none
              focus:ring-2 focus:ring-primary/30 focus:border-primary/50
              ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
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
                <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Uploading... {progress}%
                </p>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">
                    {referenceFile
                      ? "Replace reference image"
                      : "Click or drag to upload"}
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, WEBP up to 2MB
                  </p>
                </div>
              </>
            )}
          </div>
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
