/**
 * Expression prompt crafting for Nano Banana Pro.
 *
 * Since Nano Banana only accepts text prompts (no image input),
 * we use prompt engineering to maintain character consistency
 * by combining the original character description with expression modifiers.
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
    "big bright smile, joyful expression, sparkling happy eyes, cheerful grin",
  sad: "sad tearful expression, downturned mouth, sorrowful eyes, melancholic look",
  angry:
    "angry scowling expression, furrowed brows, intense glaring eyes, clenched teeth",
  surprised:
    "wide shocked eyes, open mouth surprise, raised eyebrows, astonished expression",
};

/** Style-specific framing instructions */
const STYLE_FRAMES: Record<ArtStyle, string> = {
  anime:
    "anime style portrait, bust shot, clean lines, vibrant colors, detailed anime eyes",
  chibi:
    "chibi style portrait, cute proportions, large head, small body, adorable kawaii style",
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
 * 1. Style framing (anime/chibi)
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
