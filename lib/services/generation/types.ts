/**
 * Generation adapter interface — abstracts AI image generation providers.
 *
 * Implementations:
 * - MockAdapter: Returns placeholder images with simulated delays (dev)
 * - ProductionAdapter: Multi-model parallel character generation + Nano Banana expressions
 *   - NanoBananaAdapter: Character generation + expression editing via piapi.ai
 *   - QwenAdapter: Character generation via piapi.ai (Qubico/qwen-image)
 *   - (2 additional model slots reserved)
 */

export type ArtStyle =
  | "anime"
  | "vtuber"
  | "chibi"
  | "retro-90s"
  | "cartoon"
  | "none";

export type ExpressionType =
  | "idle"
  | "talking"
  | "blink"
  | "blink_talking"
  | "happy"
  | "happy_talking"
  | "sad"
  | "sad_talking"
  | "angry"
  | "angry_talking"
  | "surprised";

export const EXPRESSION_TYPES = [
  "idle",
  "talking",
  "blink",
  "blink_talking",
  "happy",
  "happy_talking",
  "sad",
  "sad_talking",
  "angry",
  "angry_talking",
  "surprised",
] as const;

/** The 3 base expressions that need generation (idle = base image, no generation needed) */
export const BASE_EXPRESSIONS: ExpressionType[] = [
  "talking",
  "blink",
  "blink_talking",
] as const;

/** Custom expressions beyond the base 4 */
export const CUSTOM_EXPRESSIONS: ExpressionType[] = [
  "happy",
  "sad",
  "angry",
  "surprised",
] as const;

// ── Shared prompt constants ──────────────────────────────────────────────────

/**
 * [DEPRECATED] Old English style hints - kept for reference
 * Replaced with Chinese descriptions for better Seedream 4.5 compatibility
 */
/*
export const STYLE_HINTS: Record<ArtStyle, string> = {
  anime: "anime character illustration,",
  vtuber: "modern VTuber character, hololive aesthetic,",
  chibi: "chibi character, large head small body,",
  "retro-90s": "90s retro anime character, vintage cel animation,",
  cartoon: "cartoon character illustration, western animation style,",
};
*/

/**
 * [DEPRECATED] Old English framing - kept for reference
 * Replaced with Chinese composition for better Seedream 4.5 compatibility
 */
/*
export const PNGTUBER_FRAME =
  "solo, half body portrait, looking at viewer, white background";
*/

/**
 * [DEPRECATED] Old English reference prefix - kept for reference
 * Replaced with Chinese description for better Seedream 4.5 compatibility
 */
/*
export const REFERENCE_PREFIX =
  "character inspired by the person in the reference image, keeping their key facial features and appearance,";
*/

/**
 * [DEPRECATED] Old English character prompt builder - kept for reference
 * Replaced with Chinese version for better Seedream 4.5 compatibility
 */
/*
export function buildCharacterPrompt(
  prompt: string,
  style: ArtStyle,
  hasReference: boolean,
): string {
  const hint = STYLE_HINTS[style];
  const refPrefix = hasReference ? `${REFERENCE_PREFIX} ` : "";
  return `${refPrefix}${hint} ${prompt}, ${PNGTUBER_FRAME}`;
}
*/

// ── NEW Chinese prompt constants (Seedream 4.5 optimized) ────────────────────

/**
 * 风格描述 - 自然语言描述各风格特征
 * Seedream 4.5 最佳实践：使用简洁连贯的自然语言
 */
export const STYLE_DESCRIPTIONS: Record<ArtStyle, string> = {
  anime: "日式动漫风格，线条清晰，色彩鲜艳，大眼睛，精致细节",
  vtuber: "现代VTuber风格，精致数字绘画，表情生动丰富",
  chibi: "Q版卡通风格，大头小身，可爱萌系画风",
  "retro-90s": "90年代复古动漫风格，老式赛璐珞动画质感",
  cartoon: "欧美卡通风格，西部动画画风，配色大胆",
  none: "",
};

/**
 * PNGTuber 构图框架
 * 明确应用场景和用途，符合 Seedream 4.5 推荐做法
 */
export const PNGTUBER_COMPOSITION = "半身像，正面朝向观众，纯白背景，单人角色";

/**
 * 参考图描述前缀
 * 当提供人物参考图时使用
 */
export const REFERENCE_DESC = "参考图中的人物形象，保留其关键面部特征和外貌";

/**
 * 构建标准角色生成提示词（中文版本，Seedream 4.5 优化）
 *
 * 结构：参考描述 + 风格描述 + 用户提示 + 构图框架
 * 示例：参考图中的人物形象，保留其关键面部特征和外貌，现代VTuber风格，
 *       精致数字绘画，表情生动丰富，一个可爱的猫耳游戏少女，粉色双马尾，
 *       电竞耳机，半身像，正面朝向观众，纯白背景，单人角色，透明背景，
 *       用于直播的PNG虚拟形象
 */
export function buildCharacterPrompt(
  prompt: string,
  style: ArtStyle,
  hasReference: boolean,
): string {
  const styleDesc = STYLE_DESCRIPTIONS[style];
  const refPrefix = hasReference ? `${REFERENCE_DESC}，` : "";
  // When style is "none", don't add style description, let user fully customize
  if (style === "none") {
    return `${refPrefix}${prompt}，${PNGTUBER_COMPOSITION}`;
  }
  return `${refPrefix}${styleDesc}，${prompt}，${PNGTUBER_COMPOSITION}`;
}

// ── Request / Response types ─────────────────────────────────────────────────

export interface GenerateCharacterRequest {
  prompt: string;
  style: ArtStyle;
  /** Optional single reference image URL — passed to all models */
  referenceUrl?: string | null;
}

export interface GenerateCharacterResult {
  status: "completed" | "failed";
  /** Candidate image URLs (1 per model, from parallel multi-model generation) */
  images: string[];
  error?: string;
}

export interface GenerateExpressionRequest {
  /** URL of the base character image */
  baseImageUrl: string;
  /** Target expression to generate */
  expression: ExpressionType;
  /** Art style for consistency */
  style: ArtStyle;
  /** Original character prompt (used by text-only adapters for consistency) */
  prompt?: string;
}

export interface GenerateExpressionResult {
  status: "completed" | "failed";
  /** Single expression image URL */
  imageUrl: string | null;
  error?: string;
}

export interface GenerationAdapter {
  /**
   * Generate candidate character images (1 per model, parallel).
   * Used in Step 1→2 of the Create Flow.
   */
  generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult>;

  /**
   * Generate a single expression variant by editing the base image.
   * Used in Step 2→3 of the Create Flow.
   */
  generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult>;
}
