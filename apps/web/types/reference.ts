/**
 * Reference types for avatar generation.
 * Single optional reference image — all models receive the same URL.
 */

export interface ReferenceFile {
  fileKey: string;
  url: string;
  fileName: string;
}

/** Reference state + callbacks passed as a single prop to GeneratorForm */
export interface ReferenceHandlers {
  referenceFile: ReferenceFile | null;
  gallery: ReferenceFile[];
  onReferenceFileChange: (file: ReferenceFile | null) => void;
  onImageUploaded: (file: ReferenceFile) => void;
  onRemoveFromGallery: (fileKey: string) => void;
}

// IndexedDB keys
export const REFERENCE_DB_NAME = "pngtuber-references";
export const REFERENCE_STORE_NAME = "references";
export const REFERENCE_DB_VERSION = 1;
