"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReferenceFile, ReferenceType } from "@/types/reference";
import {
  REFERENCE_DB_NAME,
  REFERENCE_DB_VERSION,
  REFERENCE_STORE_NAME,
} from "@/types/reference";

const MAX_GALLERY_IMAGES = 10;

interface UseReferencePersistentStateReturn {
  isLoading: boolean;
  activeType: ReferenceType | null;
  imageFile: ReferenceFile | null;
  styleFile: ReferenceFile | null;
  faceFile: ReferenceFile | null;
  gallery: ReferenceFile[];
  setActiveType: (type: ReferenceType | null) => void;
  setImageFile: (file: ReferenceFile | null) => void;
  setStyleFile: (file: ReferenceFile | null) => void;
  setFaceFile: (file: ReferenceFile | null) => void;
  addToGallery: (file: ReferenceFile) => void;
  removeFromGallery: (fileKey: string) => void;
  clearAll: () => void;
}

export function useReferencePersistentState(): UseReferencePersistentStateReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveTypeState] = useState<ReferenceType | null>(null);
  const [imageFile, setImageFileState] = useState<ReferenceFile | null>(null);
  const [styleFile, setStyleFileState] = useState<ReferenceFile | null>(null);
  const [faceFile, setFaceFileState] = useState<ReferenceFile | null>(null);
  const [gallery, setGalleryState] = useState<ReferenceFile[]>([]);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const db = await openDB();
        const transaction = db.transaction(REFERENCE_STORE_NAME, "readonly");
        const store = transaction.objectStore(REFERENCE_STORE_NAME);

        const [activeTypeData, imageData, styleData, faceData, galleryData] =
          await Promise.all([
            getFromStore<ReferenceType | null>(store, "activeType"),
            getFromStore<ReferenceFile | null>(store, "imageFile"),
            getFromStore<ReferenceFile | null>(store, "styleFile"),
            getFromStore<ReferenceFile | null>(store, "faceFile"),
            getFromStore<ReferenceFile[]>(store, "gallery"),
          ]);

        if (activeTypeData !== undefined) {
          setActiveTypeState(activeTypeData);
        }
        if (imageData !== undefined) {
          setImageFileState(imageData);
        }
        if (styleData !== undefined) {
          setStyleFileState(styleData);
        }
        if (faceData !== undefined) {
          setFaceFileState(faceData);
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

  const setActiveType = useCallback(
    (type: ReferenceType | null) => {
      setActiveTypeState(type);
      saveToDB("activeType", type);
    },
    [saveToDB],
  );

  const setImageFile = useCallback(
    (file: ReferenceFile | null) => {
      setImageFileState(file);
      saveToDB("imageFile", file);
    },
    [saveToDB],
  );

  const setStyleFile = useCallback(
    (file: ReferenceFile | null) => {
      setStyleFileState(file);
      saveToDB("styleFile", file);
    },
    [saveToDB],
  );

  const setFaceFile = useCallback(
    (file: ReferenceFile | null) => {
      setFaceFileState(file);
      saveToDB("faceFile", file);
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
        // Persist outside the updater to avoid side effects in setState
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
    setActiveTypeState(null);
    setImageFileState(null);
    setStyleFileState(null);
    setFaceFileState(null);
    setGalleryState([]);

    // Clear IndexedDB
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
    activeType,
    imageFile,
    styleFile,
    faceFile,
    gallery,
    setActiveType,
    setImageFile,
    setStyleFile,
    setFaceFile,
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
