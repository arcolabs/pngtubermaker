"use client";

import Image from "next/image";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { useImageUpload } from "./hooks/useImageUpload";
import type { ReferenceUploadAreaProps } from "./types";

// Simplified component - handles image upload via drag & drop or click and gallery display

const MAX_IMAGES = 20;

const ReferenceUploadArea = memo(function ReferenceUploadArea({
  uploadedImages,
  onImageUploaded,
  onRemoveImage,
  variant: _variant,
}: ReferenceUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImages, isUploading } = useImageUpload();

  // Shared upload handler
  const handleUpload = useCallback(
    async (files: File[]) => {
      if (
        files.length === 0 ||
        uploadedImages.length + files.length > MAX_IMAGES
      )
        return;

      setUploadErrors([]);
      const results = await uploadImages(files);

      for (const r of results) {
        if (r.error) {
          setUploadErrors((prev) => [
            ...prev,
            `${r.file.fileName}: ${r.error}`,
          ]);
        } else {
          onImageUploaded(r.file);
        }
      }
    },
    [uploadedImages.length, uploadImages, onImageUploaded],
  );

  // Upload zone component
  const uploadZone = useMemo(
    () => (
      // biome-ignore lint/a11y/useSemanticElements: div with role=button is used for drag-and-drop functionality
      <div
        role="button"
        tabIndex={0}
        className={`h-full rounded-xl border-2 border-dashed transition-all duration-300
        ${isDragging ? "border-[#FF0033]/50 bg-[#FF0033]/5" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/"),
          );
          await handleUpload(files);
        }}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            await handleUpload(files);
          }}
          disabled={isUploading || uploadedImages.length >= MAX_IMAGES}
        />
        <div className="h-full flex flex-col items-center justify-center p-3 cursor-pointer">
          <div className="rounded-full bg-white/5 flex items-center justify-center w-10 h-10 mb-2">
            {isUploading ? (
              <svg
                role="img"
                aria-label="Uploading"
                className="animate-spin text-[#FF0033] h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <title>Uploading</title>
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
            ) : (
              <svg
                role="img"
                aria-label="Upload image"
                className="text-white/40 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <p className="text-xs text-center text-white/60">
            {isUploading ? "Uploading..." : "Upload images"}
          </p>
        </div>
      </div>
    ),
    [isDragging, isUploading, uploadedImages.length, handleUpload],
  );

  return (
    <div className="space-y-4">
      {/* Upload area and gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload zone */}
        <div className="h-[164px]">{uploadZone}</div>

        {/* Gallery */}
        <div className="min-w-0 md:col-span-2 h-[164px]">
          <div className="relative w-full h-full rounded-xl border-2 border-dashed border-white/10 bg-white/5 overflow-hidden">
            <div className="absolute top-2 right-2 z-10 rounded-full bg-black/60 backdrop-blur-sm px-2 py-1 text-xs font-mono text-white/80">
              {uploadedImages.length}/{MAX_IMAGES}
            </div>
            {uploadedImages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40">
                <svg
                  role="img"
                  aria-label="Image gallery"
                  className="w-6 h-6 mb-2 text-white/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Image gallery</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xs">
                  Uploaded images appear here (max {MAX_IMAGES})
                </p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-2 custom-scrollbar">
                <div className="columns-4 sm:columns-5 md:columns-6 lg:columns-7 xl:columns-8 gap-2 space-y-2">
                  {uploadedImages.map((file) => (
                    <button
                      type="button"
                      key={file.fileKey}
                      className="relative break-inside-avoid rounded-md overflow-hidden border border-white/10 group cursor-move w-[60px] sm:w-[70px] text-left"
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(file),
                        )
                      }
                    >
                      {file.url ? (
                        <Image
                          src={file.url}
                          alt={file.fileName}
                          width={60}
                          height={60}
                          className="w-full h-auto"
                          sizes="60px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-white/5">
                          <svg
                            role="img"
                            aria-label="Image placeholder"
                            className="w-6 h-6 text-white/30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Image placeholder</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveImage(file.fileKey);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-500/80 flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100 z-10"
                        aria-label="Remove image"
                      >
                        <svg
                          aria-hidden="true"
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload errors */}
      {uploadErrors.length > 0 && (
        <div className="p-3 rounded-xl border border-[#FF0033]/30 bg-[#FF0033]/5">
          {uploadErrors.map((err, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Error messages are transient and won't be reordered
            <p key={i} className="text-xs text-[#FF5555]">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

export default ReferenceUploadArea;
