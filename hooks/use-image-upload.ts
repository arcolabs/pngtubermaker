"use client";

import { useCallback, useRef, useState } from "react";

export interface UploadedFile {
  url: string;
  fileKey: string;
  fileName: string;
}

interface UploadResult {
  file: UploadedFile;
  error?: string;
}

interface UploadImageOptions {
  type: "candidate" | "base" | "thumbnail" | "expression";
  avatarId: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeUploadsRef = useRef(0);

  const updateUploadingState = useCallback((delta: number) => {
    activeUploadsRef.current += delta;
    setIsUploading(activeUploadsRef.current > 0);
  }, []);

  const uploadImage = useCallback(
    async (file: File, options: UploadImageOptions): Promise<UploadedFile> => {
      updateUploadingState(1);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", options.type);
        formData.append("avatarId", options.avatarId);

        const response = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload file");
        }

        const data = await response.json();

        return {
          url: data.url,
          fileKey: data.key,
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

  const uploadImages = useCallback(
    async (
      files: File[],
      options: UploadImageOptions,
    ): Promise<UploadResult[]> => {
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
