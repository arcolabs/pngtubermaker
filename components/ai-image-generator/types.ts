// types.ts - AI图片生成器类型定义

/**
 * 生成任务状态
 */
export type GenerationStatus =
  | "idle"
  | "queued"
  | "running"
  | "completed"
  | "failed";

/**
 * 生成任务
 */
export interface GenerationTask {
  id: string;
  prompt: string;
  title: string;
  description: string;
  style: StylePreset;
  size: SizePreset;
  colorTone?: string;
  status: GenerationStatus;
  images: string[];
  progress?: number;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

/**
 * 风格预设
 */
export interface StylePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptModifier: string;
}

/**
 * 尺寸预设
 */
export interface SizePreset {
  id: string;
  name: string;
  ratio: string;
  dimensions: string;
  aspectRatio: [number, number];
  description: string;
}

/**
 * 引用模块类型
 */
export type ModuleType = "image-prompt" | "style-reference" | "omni-reference";

/**
 * 上传的文件
 */
export interface UploadedFile {
  url: string;
  fileKey: string;
  fileName: string;
}

/**
 * 表单状态
 */
export interface FormState {
  prompt: string;
  description: string;
  style: StylePreset;
  size: SizePreset;
  colorTone: string | null;
  // Reference files
  imagePromptFiles?: UploadedFile[];
  styleReferenceFiles?: UploadedFile[];
  omniReferenceFile?: UploadedFile | null;
}

/**
 * 结果卡片Props
 */
export interface AIImageGeneratorResultCardProps {
  imageUrl: string;
  index: number;
  total: number;
  onDownload: (url: string) => void;
}

/**
 * 结果列表Props
 */
export interface AIImageGeneratorResultsProps {
  task: GenerationTask | null;
  onRegenerate: () => void;
}

/**
 * 表单Props
 */
export interface AIImageGeneratorFormProps {
  formState: FormState;
  onFormChange: (updates: Partial<FormState>) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  // Reference module props
  activeModuleType?: ModuleType | null;
  onModuleTypeChange?: (type: ModuleType | null) => void;
  imagePromptFiles?: UploadedFile[];
  styleReferenceFiles?: UploadedFile[];
  omniReferenceFile?: UploadedFile | null;
  uploadedImages?: UploadedFile[];
  onRemoveImagePrompt?: (file: UploadedFile) => void;
  onRemoveStyleReference?: (file: UploadedFile) => void;
  onRemoveOmniReference?: (file: UploadedFile) => void;
  onDropToModule?: (file: UploadedFile, type: ModuleType) => void;
  onImageUploaded?: (file: UploadedFile) => void;
  onRemoveUploadedImage?: (fileKey: string) => void;
  /** YouTube URL for style reference (when style-reference module is active) */
  styleReferenceYoutubeUrl?: string;
  onStyleReferenceYoutubeUrlChange?: (url: string) => void;
}

/**
 * 主组件Props
 */
export interface AIImageGeneratorProps {
  className?: string;
  onImageGenerated?: (task: GenerationTask) => void;
}

/**
 * ReferenceModule Props
 */
export interface ReferenceModuleProps {
  type: ModuleType;
  uploadedFiles: UploadedFile[];
  isActive: boolean;
  onClick: () => void;
  onRemoveFile: (file: UploadedFile) => void;
  onDropFile: (file: UploadedFile) => void;
}

/**
 * ReferenceImageSelector Props
 */
export interface ReferenceImageSelectorProps {
  files: UploadedFile[];
  onRemove: (file: UploadedFile) => void;
  maxFiles?: number;
}

/**
 * ReferenceUploadArea Props
 */
export interface ReferenceUploadAreaProps {
  uploadedImages: UploadedFile[];
  onImageUploaded: (file: UploadedFile) => void;
  onRemoveImage: (fileKey: string) => void;
  /** When "style-reference", shows split layout: left=image upload, right=YouTube URL input */
  variant?: ModuleType;
  youtubeUrl?: string;
  onYoutubeUrlChange?: (url: string) => void;
}

/**
 * Module configuration
 */
export interface ModuleConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
}
