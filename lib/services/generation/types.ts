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

export type ArtStyle = "anime" | "vtuber" | "chibi" | "retro-90s" | "cartoon";

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

/** Style hints — brief keywords prepended to the user prompt per art style */
export const STYLE_HINTS: Record<ArtStyle, string> = {
  anime: "anime character illustration,",
  vtuber: "modern VTuber character, hololive aesthetic,",
  chibi: "chibi character, large head small body,",
  "retro-90s": "90s retro anime character, vintage cel animation,",
  cartoon: "cartoon character illustration, western animation style,",
};

/** PNGTuber composition framing appended to all character prompts */
export const PNGTUBER_FRAME =
  "solo, half body portrait, looking at viewer, white background";

/** Prefix added when a person reference image is provided */
export const REFERENCE_PREFIX =
  "character inspired by the person in the reference image, keeping their key facial features and appearance,";

/**
 * Build a standard character prompt from style + user text + optional reference.
 * All adapters should use this for consistency.
 */
export function buildCharacterPrompt(
  prompt: string,
  style: ArtStyle,
  hasReference: boolean,
): string {
  const hint = STYLE_HINTS[style];
  const refPrefix = hasReference ? `${REFERENCE_PREFIX} ` : "";
  return `${refPrefix}${hint} ${prompt}, ${PNGTUBER_FRAME}`;
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
