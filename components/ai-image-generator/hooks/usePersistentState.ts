"use client";

import { del, get, set } from "idb-keyval";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ModuleType, UploadedFile } from "../types";

// Storage keys
const STORAGE_KEYS = {
  FORM_STATE: "ai-generator-form-state",
  UPLOADED_IMAGES: "ai-generator-uploaded-images",
  IMAGE_PROMPT_FILES: "ai-generator-image-prompt-files",
  STYLE_REFERENCE_FILES: "ai-generator-style-reference-files",
  OMNI_REFERENCE_FILE: "ai-generator-omni-reference-file",
  ACTIVE_MODULE_TYPE: "ai-generator-active-module-type",
  YOUTUBE_URL: "ai-generator-youtube-url",
  LAST_UPDATED: "ai-generator-last-updated",
  DATA_VERSION: "ai-generator-data-version",
} as const;

// Current data version for migration
const CURRENT_DATA_VERSION = 1;

// Max age in days before data is considered stale
const MAX_DATA_AGE_DAYS = 7;

interface StorageMetadata {
  version: number;
  lastUpdated: number;
}

/**
 * Generic hook for persistent state using IndexedDB
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: {
    maxAge?: number; // in days
    onRestore?: (value: T) => void;
  },
) {
  const [state, setState] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestored, setIsRestored] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onRestoreRef = useRef(options?.onRestore);
  const maxAgeRef = useRef(options?.maxAge);
  const hasLoadedRef = useRef(false);
  const defaultValueRef = useRef(defaultValue);

  // Keep defaultValue ref up to date but don't trigger re-renders
  defaultValueRef.current = defaultValue;

  // Keep refs up to date
  useEffect(() => {
    onRestoreRef.current = options?.onRestore;
    maxAgeRef.current = options?.maxAge;
  });

  // Load from IndexedDB on mount - only run once per key
  useEffect(() => {
    // Skip if already loaded for this key
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const load = async () => {
      try {
        setIsLoading(true);

        // Check version
        const metadata: StorageMetadata | undefined = await get(
          STORAGE_KEYS.DATA_VERSION,
        );

        if (metadata && metadata.version !== CURRENT_DATA_VERSION) {
          // Version mismatch, clear all data
          await clearAllPersistentData();
          setState(defaultValueRef.current);
          setIsRestored(false);
          return;
        }

        // Check data age
        if (metadata && maxAgeRef.current) {
          const ageInDays =
            (Date.now() - metadata.lastUpdated) / (1000 * 60 * 60 * 24);
          if (ageInDays > maxAgeRef.current) {
            // Data is stale, clear it
            await clearAllPersistentData();
            setState(defaultValueRef.current);
            setIsRestored(false);
            return;
          }
        }

        // Load the value
        const stored = await get<T>(key);
        if (stored !== undefined) {
          setState(stored);
          setIsRestored(true);
          onRestoreRef.current?.(stored);
        }
      } catch (error) {
        console.error("Failed to load from IndexedDB:", error);
        setState(defaultValueRef.current);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    // Only run once on mount - key should not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Save to IndexedDB with debounce
  const saveState = useCallback(
    async (value: T) => {
      try {
        // Save the value
        await set(key, value);

        // Update metadata
        const metadata: StorageMetadata = {
          version: CURRENT_DATA_VERSION,
          lastUpdated: Date.now(),
        };
        await set(STORAGE_KEYS.DATA_VERSION, metadata);
      } catch (error) {
        console.error("Failed to save to IndexedDB:", error);
      }
    },
    [key],
  );

  // Debounced state setter
  const setPersistentState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue =
          typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Debounce save by 500ms
        saveTimeoutRef.current = setTimeout(() => {
          saveState(newValue);
        }, 500);

        return newValue;
      });
    },
    [saveState],
  );

  // Clear specific key
  const clearState = useCallback(async () => {
    try {
      await del(key);
      setState(defaultValue);
    } catch (error) {
      console.error("Failed to clear from IndexedDB:", error);
    }
  }, [key, defaultValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    setState: setPersistentState,
    isLoading,
    isRestored,
    clearState,
  };
}

/**
 * Clear all persistent data for the AI generator
 */
export async function clearAllPersistentData() {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map((key) => del(key)));
    console.log("All persistent data cleared");
  } catch (error) {
    console.error("Failed to clear persistent data:", error);
  }
}

/**
 * Hook to manage all AI Generator persistent state
 */
export function useAIGeneratorPersistentState() {
  const {
    state: uploadedImages,
    setState: setUploadedImages,
    isLoading: isLoadingImages,
    isRestored: isImagesRestored,
  } = usePersistentState<UploadedFile[]>("ai-generator-uploaded-images", [], {
    maxAge: MAX_DATA_AGE_DAYS,
  });

  const {
    state: imagePromptFiles,
    setState: setImagePromptFiles,
    isLoading: isLoadingImagePrompt,
  } = usePersistentState<UploadedFile[]>(
    "ai-generator-image-prompt-files",
    [],
    {
      maxAge: MAX_DATA_AGE_DAYS,
    },
  );

  const {
    state: styleReferenceFiles,
    setState: setStyleReferenceFiles,
    isLoading: isLoadingStyleRef,
  } = usePersistentState<UploadedFile[]>(
    "ai-generator-style-reference-files",
    [],
    {
      maxAge: MAX_DATA_AGE_DAYS,
    },
  );

  const {
    state: omniReferenceFile,
    setState: setOmniReferenceFile,
    isLoading: isLoadingOmni,
  } = usePersistentState<UploadedFile | null>(
    "ai-generator-omni-reference-file",
    null,
    {
      maxAge: MAX_DATA_AGE_DAYS,
    },
  );

  const {
    state: activeModuleType,
    setState: setActiveModuleType,
    isLoading: isLoadingModule,
  } = usePersistentState<ModuleType | null>(
    "ai-generator-active-module-type",
    null,
  );

  const {
    state: youtubeUrl,
    setState: setYoutubeUrl,
    isLoading: isLoadingUrl,
  } = usePersistentState("ai-generator-youtube-url", "");

  const isLoading =
    isLoadingImages ||
    isLoadingImagePrompt ||
    isLoadingStyleRef ||
    isLoadingOmni ||
    isLoadingModule ||
    isLoadingUrl;

  const clearAll = useCallback(async () => {
    await clearAllPersistentData();
    setUploadedImages([]);
    setImagePromptFiles([]);
    setStyleReferenceFiles([]);
    setOmniReferenceFile(null);
    setActiveModuleType(null);
    setYoutubeUrl("");
  }, [
    setUploadedImages,
    setImagePromptFiles,
    setStyleReferenceFiles,
    setOmniReferenceFile,
    setActiveModuleType,
    setYoutubeUrl,
  ]);

  return {
    // State
    uploadedImages,
    imagePromptFiles,
    styleReferenceFiles,
    omniReferenceFile,
    activeModuleType,
    youtubeUrl,

    // Setters
    setUploadedImages,
    setImagePromptFiles,
    setStyleReferenceFiles,
    setOmniReferenceFile,
    setActiveModuleType,
    setYoutubeUrl,

    // Status
    isLoading,
    isRestored: isImagesRestored,

    // Actions
    clearAll,
  };
}

export { STORAGE_KEYS, CURRENT_DATA_VERSION, MAX_DATA_AGE_DAYS };
