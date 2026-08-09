/**
 * Generation adapter interface — abstracts AI image generation providers.
 *
 * Implementations:
 * - MockAdapter: Returns placeholder images with simulated delays (dev)
 * - ProductionAdapter: multi-upstream with fallback
 *   - BytePlusAdapter: seedream-5.0-lite via ARK (primary, sync)
 *   - SeedreamAdapter: seedream-5-lite via direct PiAPI (cross-vendor fallback)
 *   - QwenAdapter: Qubico/qwen-image via direct PiAPI (last-resort fallback)
 */

export type ArtStyle = "anime" | "chibi" | "cartoon" | "pixel-art" | "none";

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

// ── Prompt constants ─────────────────────────────────────────────────────────

/** Style descriptions appended to the generation prompt */
export const STYLE_DESCRIPTIONS: Record<ArtStyle, string> = {
  anime: "anime style, clean lines, vibrant colors",
  chibi: "chibi style, large head small body, kawaii",
  cartoon: "cartoon style, bold outlines, expressive",
  "pixel-art": "pixel art, retro game style",
  none: "",
};

/** PNGTuber composition frame — enforces consistent upper-body framing */
export const PNGTUBER_COMPOSITION =
  "upper body, facing viewer, white background, solo";

/** Prefix when a reference image is provided */
export const REFERENCE_DESC =
  "based on the character in the reference image, keep facial features and appearance";

/**
 * Build the final character generation prompt.
 *
 * Structure: [reference prefix] + [style description] + [user prompt] + [composition frame]
 */
export function buildCharacterPrompt(
  prompt: string,
  style: ArtStyle,
  hasReference: boolean,
): string {
  const styleDesc = STYLE_DESCRIPTIONS[style];
  const refPrefix = hasReference ? `${REFERENCE_DESC}, ` : "";
  if (style === "none") {
    return `${refPrefix}${prompt}, ${PNGTUBER_COMPOSITION}`;
  }
  return `${refPrefix}${styleDesc}, ${prompt}, ${PNGTUBER_COMPOSITION}`;
}

// ── Request / Response types ─────────────────────────────────────────────────

/** A generated image URL tagged with the upstream that produced it */
export interface ProviderImage {
  url: string;
  provider: string;
}

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
  /** Upstream that produced each image, aligned with `images` */
  providers?: string[];
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
  /** Upstream that produced the image (e.g. "byteplus-lite", "piapi-lite", "qwen") */
  provider?: string;
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
