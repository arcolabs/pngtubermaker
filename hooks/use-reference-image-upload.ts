"use client";

import { useCallback, useState } from "react";
import type { ReferenceFile } from "@/types/reference";

interface UseReferenceImageUploadReturn {
  isUploading: boolean;
  progress: number;
  uploadImage: (file: File) => Promise<ReferenceFile>;
  error: string | null;
  clearError: () => void;
}

export function useReferenceImageUpload(): UseReferenceImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<ReferenceFile> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Validate file type - only allow major image formats
        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Only PNG, JPG, and WEBP files are allowed");
        }

        // Validate file size - max 2MB
        const MAX_SIZE_MB = 2;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          throw new Error(`File size must be less than ${MAX_SIZE_MB}MB`);
        }

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/images/upload-reference", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        setProgress(100);

        return {
          fileKey: data.key || data.id || data.fileKey || crypto.randomUUID(),
          url: data.url,
          fileName: file.name,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    isUploading,
    progress,
    uploadImage,
    error,
    clearError,
  };
}
