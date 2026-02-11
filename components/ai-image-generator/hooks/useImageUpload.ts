"use client";

import { useCallback, useRef, useState } from "react";
import type { UploadedFile } from "../types";

interface UploadResult {
  file: UploadedFile;
  error?: string;
}

interface UploadImageOptions {
  type?: "uploads" | "thumbnails" | "avatars";
}

/**
 * Hook for uploading images to R2 storage via server proxy (no CORS issues)
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeUploadsRef = useRef(0);

  const updateUploadingState = useCallback((delta: number) => {
    activeUploadsRef.current += delta;
    setIsUploading(activeUploadsRef.current > 0);
  }, []);

  /**
   * Upload a single file to R2 via server proxy
   */
  const uploadImage = useCallback(
    async (
      file: File,
      _options: UploadImageOptions = {},
    ): Promise<UploadedFile> => {
      updateUploadingState(1);
      setError(null);

      try {
        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append("file", file);

        // Upload via server proxy (bypasses CORS)
        const response = await fetch("/api/images/upload-proxy", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload file");
        }

        const data = await response.json();
        const imageUrl = data.data.image.url;

        return {
          url: imageUrl,
          fileKey: data.data.image.id,
          fileName: file.name,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        updateUploadingState(-1);
      }
    },
    [updateUploadingState],
  );

  /**
   * Upload multiple files
   */
  const uploadImages = useCallback(
    async (
      files: File[],
      options: UploadImageOptions = {},
    ): Promise<UploadResult[]> => {
      // Upload in parallel
      const uploadPromises = files.map(async (file) => {
        try {
          const uploadedFile = await uploadImage(file, options);
          return { file: uploadedFile };
        } catch (err) {
          return {
            file: {
              url: "",
              fileKey: "",
              fileName: file.name,
            },
            error: err instanceof Error ? err.message : "Upload failed",
          };
        }
      });

      return await Promise.all(uploadPromises);
    },
    [uploadImage],
  );

  return {
    uploadImage,
    uploadImages,
    isUploading,
    error,
  };
}
