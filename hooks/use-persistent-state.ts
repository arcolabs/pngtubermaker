"use client";

import { del, get, set } from "idb-keyval";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEYS = {
  FORM_STATE: "pngtuber-form-state",
  UPLOADED_IMAGES: "pngtuber-uploaded-images",
  IMAGE_PROMPT_FILES: "pngtuber-image-prompt-files",
  STYLE_REFERENCE_FILES: "pngtuber-style-reference-files",
  OMNI_REFERENCE_FILE: "pngtuber-omni-reference-file",
  ACTIVE_MODULE_TYPE: "pngtuber-active-module-type",
  YOUTUBE_URL: "pngtuber-youtube-url",
  LAST_UPDATED: "pngtuber-last-updated",
  DATA_VERSION: "pngtuber-data-version",
} as const;

const CURRENT_DATA_VERSION = 1;

const MAX_DATA_AGE_DAYS = 7;

interface StorageMetadata {
  version: number;
  lastUpdated: number;
}

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: {
    maxAge?: number;
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

  defaultValueRef.current = defaultValue;

  useEffect(() => {
    onRestoreRef.current = options?.onRestore;
    maxAgeRef.current = options?.maxAge;
  });

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const load = async () => {
      try {
        setIsLoading(true);

        const metadata: StorageMetadata | undefined = await get(
          STORAGE_KEYS.DATA_VERSION,
        );

        if (metadata && metadata.version !== CURRENT_DATA_VERSION) {
          await clearAllPersistentData();
          setState(defaultValueRef.current);
          setIsRestored(false);
          return;
        }

        if (metadata && maxAgeRef.current) {
          const ageInDays =
            (Date.now() - metadata.lastUpdated) / (1000 * 60 * 60 * 24);
          if (ageInDays > maxAgeRef.current) {
            await clearAllPersistentData();
            setState(defaultValueRef.current);
            setIsRestored(false);
            return;
          }
        }

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
  }, [key]);

  const saveState = useCallback(
    async (value: T) => {
      try {
        await set(key, value);

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

  const setPersistentState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue =
          typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveState(newValue);
        }, 500);

        return newValue;
      });
    },
    [saveState],
  );

  const clearState = useCallback(async () => {
    try {
      await del(key);
      setState(defaultValue);
    } catch (error) {
      console.error("Failed to clear from IndexedDB:", error);
    }
  }, [key, defaultValue]);

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

export async function clearAllPersistentData() {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map((key) => del(key)));
    console.log("All persistent data cleared");
  } catch (error) {
    console.error("Failed to clear persistent data:", error);
  }
}

export { STORAGE_KEYS, CURRENT_DATA_VERSION, MAX_DATA_AGE_DAYS };
