/**
 * Expression prompt crafting for all generation adapters.
 *
 * All prompts are now in Chinese for optimal Seedream 4.5 performance.
 * Following Seedream 4.5 best practices:
 * - Use natural language descriptions
 * - Keep instructions concise and clear
 * - Structure: "Reference object + Operation + Keep unchanged"
 *
 * [DEPRECATED] Old implementations kept for reference:
 * - Text-only mode (buildExpressionPrompt): was used for adapters without image input
 * - English modifiers with adjective stacking: replaced for better consistency
 */

import type { ExpressionType } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// DEPRECATED: Old English-based prompt builders (kept for reference)
// ═══════════════════════════════════════════════════════════════════════════════

/*
// [DEPRECATED] English expression modifiers with adjective stacking
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

// [DEPRECATED] English style frames
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

// [DEPRECATED] Old text-only prompt builder
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

// [DEPRECATED] Old Chinese prompts - verbose version
const IMAGE_EDIT_PROMPTS_OLD: Record<ExpressionType, string> = {
  idle: "保持这张图片当中的其他元素都不变，角色嘴巴闭合、眼睛睁开，需要确保角色的一致性，用来做帧动画",
  talking:
    "保持这张图片当中的其他元素都不变，仅仅让角色的嘴巴张开，需要确保角色的一致性，用来做帧动画",
  blink:
    "保持这张图片当中的其他元素都不变，仅仅让角色的眼睛闭上，需要确保角色的一致性，用来做帧动画",
  blink_talking:
    "保持这张图片当中的其他元素都不变，让角色的眼睛闭上同时嘴巴张开，需要确保角色的一致性，用来做帧动画",
  happy:
    "保持这张图片当中的其他元素都不变，让角色展现开心的表情、面带微笑、嘴巴闭合，需要确保角色的一致性",
  happy_talking:
    "保持这张图片当中的其他元素都不变，让角色展现开心的表情、面带微笑、嘴巴张开，需要确保角色的一致性",
  sad: "保持这张图片当中的其他元素都不变，让角色展现难过的表情、眉头下垂、嘴巴闭合，需要确保角色的一致性",
  sad_talking:
    "保持这张图片当中的其他元素都不变，让角色展现难过的表情、眉头下垂、嘴巴张开，需要确保角色的一致性",
  angry:
    "保持这张图片当中的其他元素都不变，让角色展现生气的表情、眉头紧皱、嘴巴闭合，需要确保角色的一致性",
  angry_talking:
    "保持这张图片当中的其他元素都不变，让角色展现生气的表情、眉头紧皱、嘴巴张开，需要确保角色的一致性",
  surprised:
    "保持这张图片当中的其他元素都不变，让角色展现惊讶的表情、眼睛睁大、嘴巴张开，需要确保角色的一致性",
};
*/

// ═══════════════════════════════════════════════════════════════════════════════
// Expression prompts for image-edit generation
// ═══════════════════════════════════════════════════════════════════════════════

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
 * Follows Seedream 4.5 editing pattern: [instruction] + [keep unchanged].
 */
export function buildImageEditExpressionPrompt(
  expression: ExpressionType,
): string {
  return (
    BASE_EXPRESSION_PROMPTS[expression] || CUSTOM_EXPRESSION_PROMPTS[expression]
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPRECATED: Helper functions (kept for backward compatibility if needed)
// ═══════════════════════════════════════════════════════════════════════════════

/*
// [DEPRECATED] Conflict term removal - not needed for image-edit mode
const CONFLICTING_TERMS = [
  "happy", "sad", "angry", "surprised", "smiling", "crying",
  "frowning", "laughing", "grinning", "scowling", "shocked",
  "neutral", "calm", "excited", "scared", "fearful",
  "joyful", "melancholic", "furious", "cheerful",
  "blinking", "eyes closed", "eyes open", "mouth open",
  "mouth closed", "talking", "speaking",
];

export function removeExpressionTerms(prompt: string): string {
  const pattern = new RegExp(`\\b(${CONFLICTING_TERMS.join("|")})\\b`, "gi");
  return prompt
    .replace(pattern, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
*/
