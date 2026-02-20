/**
 * Reference types for avatar generation
 * Three reference types: Image, Style, and Face
 * Each supports 1 image only
 */

export type ReferenceType = "image" | "style" | "face";

export interface ReferenceFile {
  fileKey: string;
  url: string;
  fileName: string;
}

/** Grouped reference state + callbacks passed as a single prop */
export interface ReferenceHandlers {
  activeType: ReferenceType | null;
  imageFile: ReferenceFile | null;
  styleFile: ReferenceFile | null;
  faceFile: ReferenceFile | null;
  gallery: ReferenceFile[];
  onActiveTypeChange: (type: ReferenceType | null) => void;
  onImageFileChange: (file: ReferenceFile | null) => void;
  onStyleFileChange: (file: ReferenceFile | null) => void;
  onFaceFileChange: (file: ReferenceFile | null) => void;
  onImageUploaded: (file: ReferenceFile) => void;
  onRemoveFromGallery: (fileKey: string) => void;
}

// IndexedDB keys
export const REFERENCE_DB_NAME = "pngtuber-references";
export const REFERENCE_STORE_NAME = "references";
export const REFERENCE_DB_VERSION = 1;
