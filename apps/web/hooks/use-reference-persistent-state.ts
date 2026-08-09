"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReferenceFile } from "@/types/reference";
import {
  REFERENCE_DB_NAME,
  REFERENCE_DB_VERSION,
  REFERENCE_STORE_NAME,
} from "@/types/reference";

const MAX_GALLERY_IMAGES = 10;

interface UseReferencePersistentStateReturn {
  isLoading: boolean;
  referenceFile: ReferenceFile | null;
  gallery: ReferenceFile[];
  setReferenceFile: (file: ReferenceFile | null) => void;
  addToGallery: (file: ReferenceFile) => void;
  removeFromGallery: (fileKey: string) => void;
  clearAll: () => void;
}

export function useReferencePersistentState(): UseReferencePersistentStateReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [referenceFile, setReferenceFileState] = useState<ReferenceFile | null>(
    null,
  );
  const [gallery, setGalleryState] = useState<ReferenceFile[]>([]);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const db = await openDB();
        const transaction = db.transaction(REFERENCE_STORE_NAME, "readonly");
        const store = transaction.objectStore(REFERENCE_STORE_NAME);

        const [refData, galleryData] = await Promise.all([
          getFromStore<ReferenceFile | null>(store, "referenceFile"),
          getFromStore<ReferenceFile[]>(store, "gallery"),
        ]);

        if (refData !== undefined) {
          setReferenceFileState(refData);
        }
        if (galleryData !== undefined) {
          setGalleryState(galleryData);
        }
      } catch (error) {
        console.error("Failed to load reference state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Save to IndexedDB helpers
  const saveToDB = useCallback(async (key: string, value: unknown) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(REFERENCE_STORE_NAME, "readwrite");
      const store = transaction.objectStore(REFERENCE_STORE_NAME);
      await store.put(value, key);
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }, []);

  const setReferenceFile = useCallback(
    (file: ReferenceFile | null) => {
      setReferenceFileState(file);
      saveToDB("referenceFile", file);
    },
    [saveToDB],
  );

  const addToGallery = useCallback(
    (file: ReferenceFile) => {
      setGalleryState((prev) => {
        if (prev.some((f) => f.fileKey === file.fileKey)) {
          return prev;
        }
        const newGallery = [file, ...prev].slice(0, MAX_GALLERY_IMAGES);
        queueMicrotask(() => saveToDB("gallery", newGallery));
        return newGallery;
      });
    },
    [saveToDB],
  );

  const removeFromGallery = useCallback(
    (fileKey: string) => {
      setGalleryState((prev) => {
        const newGallery = prev.filter((f) => f.fileKey !== fileKey);
        queueMicrotask(() => saveToDB("gallery", newGallery));
        return newGallery;
      });
    },
    [saveToDB],
  );

  const clearAll = useCallback(() => {
    setReferenceFileState(null);
    setGalleryState([]);

    openDB()
      .then(async (db) => {
        const transaction = db.transaction(REFERENCE_STORE_NAME, "readwrite");
        const store = transaction.objectStore(REFERENCE_STORE_NAME);
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
      .catch(console.error);
  }, []);

  return {
    isLoading,
    referenceFile,
    gallery,
    setReferenceFile,
    addToGallery,
    removeFromGallery,
    clearAll,
  };
}

// IndexedDB helpers
function getFromStore<T>(
  store: IDBObjectStore,
  key: string,
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(REFERENCE_DB_NAME, REFERENCE_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(REFERENCE_STORE_NAME)) {
        db.createObjectStore(REFERENCE_STORE_NAME);
      }
    };
  });
}
