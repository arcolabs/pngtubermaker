"use client";

import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useReferenceImageUpload } from "@/hooks/use-reference-image-upload";
import type { ReferenceFile } from "@/types/reference";

interface ReferenceUploadAreaProps {
  referenceFile: ReferenceFile | null;
  gallery: ReferenceFile[];
  onFileSelected: (file: ReferenceFile) => void;
  onImageUploaded: (file: ReferenceFile) => void;
  onRemoveFile: () => void;
  onRemoveFromGallery: (fileKey: string) => void;
  disabled?: boolean;
}

export function ReferenceUploadArea({
  referenceFile,
  gallery,
  onFileSelected,
  onImageUploaded,
  onRemoveFile,
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

  const handleGallerySelect = (file: ReferenceFile) => {
    if (!disabled) {
      onFileSelected(file);
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
              <img
                src={referenceFile.url}
                alt={referenceFile.fileName}
                className="w-full h-full object-cover"
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

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/30 p-2">
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <ImageIcon className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Recent uploads</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-1.5">
            {gallery.map((file) => (
              <div
                key={file.fileKey}
                className={`
                  relative aspect-square rounded-md overflow-hidden border
                  transition-all duration-200 group
                  ${
                    referenceFile?.fileKey === file.fileKey
                      ? "border-primary ring-1 ring-primary/30"
                      : disabled
                        ? "opacity-50 cursor-not-allowed border-gray-200"
                        : "cursor-pointer border-gray-200 hover:border-primary hover:shadow-sm"
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() => handleGallerySelect(file)}
                  className="w-full h-full p-0 border-0 bg-transparent"
                  disabled={disabled}
                >
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                  />
                </button>
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
      )}

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
