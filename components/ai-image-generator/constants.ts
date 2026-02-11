// constants.ts - AI图片生成器配置常量

import type { SizePreset, StylePreset } from "./types";

/**
 * 风格预设选项
 */
export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "gaming",
    name: "Gaming",
    icon: "🎮",
    description: "High contrast, neon effects, dynamic",
    promptModifier:
      "gaming style, high contrast, neon lights, dynamic composition, bold colors",
  },
  {
    id: "tutorial",
    name: "Tutorial",
    icon: "📚",
    description: "Clean, text-focused, professional",
    promptModifier:
      "clean and clear, text-focused, educational, minimalist, professional",
  },
  {
    id: "vlog",
    name: "Vlog",
    icon: "✈️",
    description: "Bright, warm, lifestyle",
    promptModifier:
      "bright and warm, lifestyle, friendly, natural lighting, approachable",
  },
  {
    id: "tech",
    name: "Tech",
    icon: "💻",
    description: "Modern, cool tones, futuristic",
    promptModifier:
      "tech style, modern, cool tones, futuristic, sleek design, digital",
  },
  {
    id: "food",
    name: "Food",
    icon: "🍕",
    description: "Appetizing, warm, saturated",
    promptModifier:
      "appetizing food style, warm tones, high saturation, delicious, inviting",
  },
  {
    id: "review",
    name: "Review",
    icon: "⭐",
    description: "Comparison, professional, trustworthy",
    promptModifier:
      "review style, comparison layout, professional, trustworthy, detailed",
  },
];

/**
 * 尺寸预设选项
 */
export const SIZE_PRESETS: SizePreset[] = [
  {
    id: "youtube-cover",
    name: "YouTube Cover",
    ratio: "16:9",
    dimensions: "1280×720",
    aspectRatio: [16, 9],
    description: "Standard YouTube thumbnail",
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts",
    ratio: "9:16",
    dimensions: "720×1280",
    aspectRatio: [9, 16],
    description: "竖版短视频封面",
  },
  {
    id: "square",
    name: "Square",
    ratio: "1:1",
    dimensions: "1080×1080",
    aspectRatio: [1, 1],
    description: "Social media standard",
  },
];

/**
 * 主色调选项
 */
export const COLOR_TONES = [
  {
    id: null,
    name: "Auto",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  { id: "red", name: "Red", color: "#FF0033" },
  { id: "blue", name: "Blue", color: "#3B82F6" },
  { id: "green", name: "Green", color: "#10B981" },
  { id: "purple", name: "Purple", color: "#8B5CF6" },
  { id: "orange", name: "Orange", color: "#F97316" },
  { id: "pink", name: "Pink", color: "#EC4899" },
  { id: "yellow", name: "Yellow", color: "#FBBF24" },
];

/**
 * 默认表单状态
 */
export const DEFAULT_FORM_STATE = {
  prompt: "",
  description: "",
  style: STYLE_PRESETS[0],
  size: SIZE_PRESETS[0],
  colorTone: null,
};

/**
 * 本地存储键名
 */
export const STORAGE_KEY = "ai-image-generator-form-state";

/**
 * Mock image URLs (for demo)
 */
export const MOCK_IMAGE_URLS = [
  "/images/showcase/image.JPEG",
  "/images/showcase/image(1).JPEG",
  "/images/showcase/image(2).JPEG",
  "/images/showcase/image(3).JPEG",
];
