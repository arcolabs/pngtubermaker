/**
 * Generation adapter interface — abstracts AI image generation providers.
 *
 * Implementations:
 * - MockAdapter: Returns placeholder images with simulated delays (dev)
 * - MidjourneyAdapter: Midjourney Niji for character generation (production)
 * - NanoBananaAdapter: Nano Banana Standard for expression editing (production)
 */

export type ArtStyle = "anime" | "chibi";

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

export interface GenerateCharacterRequest {
  prompt: string;
  style: ArtStyle;
}

export interface GenerateCharacterResult {
  status: "completed" | "failed";
  /** 4 candidate image URLs (from Midjourney grid) */
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
   * Generate 4 candidate character images from a text prompt.
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
