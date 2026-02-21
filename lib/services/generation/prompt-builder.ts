/**
 * Expression prompt crafting for all generation adapters.
 *
 * Two modes:
 * - Text-only (buildExpressionPrompt): full character description + expression modifiers
 * - Image-edit (buildImageEditExpressionPrompt): concise edit instruction for models
 *   that accept a base image input (Qwen image-edit, Doubao, NanoBanana image_urls)
 */

import type { ArtStyle, ExpressionType } from "./types";

/** Visual descriptors appended to the base prompt for each expression */
const EXPRESSION_MODIFIERS: Record<ExpressionType, string> = {
  idle: "neutral calm expression, relaxed face, eyes open, mouth closed, resting expression",
  talking:
    "mouth wide open speaking, mid-speech expression, eyes open, animated talking, open mouth",
  blink:
    "eyes closed, mouth closed, gentle closed eyes, peaceful blink expression, relaxed eyelids shut",
  blink_talking:
    "eyes closed, mouth wide open speaking, closed eyes while talking, open mouth, eyelids shut",
  happy:
    "big bright smile, joyful expression, sparkling happy eyes, cheerful grin, mouth closed",
  happy_talking:
    "big bright smile, joyful expression, sparkling happy eyes, cheerful grin, mouth wide open speaking",
  sad: "sad tearful expression, downturned mouth, sorrowful eyes, melancholic look, mouth closed",
  sad_talking:
    "sad tearful expression, downturned mouth, sorrowful eyes, melancholic look, mouth wide open speaking",
  angry:
    "angry scowling expression, furrowed brows, intense glaring eyes, clenched teeth, mouth closed",
  angry_talking:
    "angry scowling expression, furrowed brows, intense glaring eyes, mouth wide open yelling",
  surprised:
    "wide shocked eyes, open mouth surprise, raised eyebrows, astonished expression",
};

/** Style-specific framing instructions — must match midjourney-adapter composition */
const STYLE_FRAMES: Record<ArtStyle, string> = {
  anime:
    "anime character, upper body, clean lines, vibrant colors, detailed eyes",
  vtuber:
    "modern VTuber character, upper body, hololive aesthetic, polished digital art, expressive eyes",
  chibi:
    "chibi character, upper body, large head small body, cute kawaii style",
  "retro-90s":
    "90s retro anime character, upper body, vintage cel animation aesthetic",
  cartoon:
    "cartoon character, upper body, western animation style, bold colors, expressive",
};

/** Words that conflict with expression direction — stripped from the base prompt */
const CONFLICTING_TERMS = [
  "happy",
  "sad",
  "angry",
  "surprised",
  "smiling",
  "crying",
  "frowning",
  "laughing",
  "grinning",
  "scowling",
  "shocked",
  "neutral",
  "calm",
  "excited",
  "scared",
  "fearful",
  "joyful",
  "melancholic",
  "furious",
  "cheerful",
  "blinking",
  "eyes closed",
  "eyes open",
  "mouth open",
  "mouth closed",
  "talking",
  "speaking",
];

/** Remove conflicting emotion words from a character prompt */
export function removeExpressionTerms(prompt: string): string {
  const pattern = new RegExp(`\\b(${CONFLICTING_TERMS.join("|")})\\b`, "gi");
  return prompt
    .replace(pattern, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Build a complete prompt for expression generation.
 *
 * Structure:
 * 1. Style framing (anime/vtuber/chibi/retro-90s/cartoon)
 * 2. Cleaned character description (emotion words removed)
 * 3. Expression modifiers
 * 4. PNGTuber-specific constraints
 */
export function buildExpressionPrompt(
  characterPrompt: string,
  expression: ExpressionType,
  style: ArtStyle,
): string {
  const styleFrame = STYLE_FRAMES[style];
  const cleanedPrompt = removeExpressionTerms(characterPrompt);
  const expressionMod = EXPRESSION_MODIFIERS[expression];

  return [
    styleFrame,
    cleanedPrompt,
    expressionMod,
    "transparent background, PNGTuber avatar, single character, consistent character design",
  ].join(", ");
}

/**
 * Build a concise prompt for image-edit expression generation.
 * Used by adapters that accept a base image — the prompt only describes
 * what to change, not the full character.
 */
export function buildImageEditExpressionPrompt(
  expression: ExpressionType,
): string {
  const expressionMod = EXPRESSION_MODIFIERS[expression];
  return `Edit this character image. Keep the character's appearance, clothing, pose, and art style exactly the same. Only change the facial expression to: ${expressionMod}. Do not change anything else.`;
}
