/**
 * Expression prompt crafting for image-edit generation adapters.
 *
 * Structure: "[what to change] + [what to keep]"
 */

import type { ExpressionType } from "./types";

/**
 * Base Pack — mouth/eye 2x2 combinations for frame animation.
 * Follows Seedream editing pattern: [what to change] + [what to keep]
 */
const BASE_EXPRESSION_PROMPTS: Record<string, string> = {
  idle: "close mouth, open eyes, keep everything else unchanged",
  talking: "open mouth, keep everything else unchanged",
  blink: "close eyes, close mouth, keep everything else unchanged",
  blink_talking: "close eyes, open mouth, keep everything else unchanged",
};

/**
 * Custom Pack — emotion expressions.
 * Minimal emotion descriptor + explicit mouth state + keep unchanged.
 */
const CUSTOM_EXPRESSION_PROMPTS: Record<string, string> = {
  happy: "happy smile, mouth closed, keep everything else unchanged",
  happy_talking: "happy smile, mouth open, keep everything else unchanged",
  sad: "sad expression with teary eyes, mouth closed, keep everything else unchanged",
  sad_talking: "sad expression, mouth open, keep everything else unchanged",
  angry:
    "angry expression with furrowed brows, mouth closed, keep everything else unchanged",
  angry_talking:
    "angry expression with furrowed brows, mouth open, keep everything else unchanged",
  surprised:
    "surprised expression, wide eyes, mouth open, keep everything else unchanged",
};

/**
 * Build expression prompt for image-edit generation.
 * Pattern: [instruction] + [keep unchanged].
 */
export function buildImageEditExpressionPrompt(
  expression: ExpressionType,
): string {
  return (
    BASE_EXPRESSION_PROMPTS[expression] || CUSTOM_EXPRESSION_PROMPTS[expression]
  );
}
