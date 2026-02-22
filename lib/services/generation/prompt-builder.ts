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
// NEW: Seedream 4.5 Optimized Chinese Prompts (Concise & Clear)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Base Pack 提示词 - 嘴眼组合的帧动画
 *
 * Seedream 4.5 最佳实践：简洁明确的指令
 * 结构：参考图中角色 + [嘴部状态] + [眼部状态] + 其他保持不变 + 用途
 */
const BASE_EXPRESSION_PROMPTS: Record<string, string> = {
  // 2x2 组合：闭嘴/张嘴 × 睁眼/闭眼
  idle: "图中角色，闭嘴睁眼，除嘴巴和眼睛外其他元素均保持不变，确保一致性用于帧动画",
  talking: "图中角色，张嘴说话，除嘴巴和眼睛外其他元素均保持不变，确保一致性用于帧动画",
  blink: "图中角色，闭眼闭嘴，除嘴巴和眼睛外其他元素均保持不变，确保一致性用于帧动画",
  blink_talking: "图中角色，闭眼张嘴，除嘴巴和眼睛外其他元素均保持不变，确保一致性用于帧动画",
};

/**
 * Custom Pack 提示词 - 情绪表情
 *
 * Seedream 4.5 最佳实践：用自然语言描述情绪
 * 避免形容词堆砌，单一明确描述
 */
const CUSTOM_EXPRESSION_PROMPTS: Record<string, string> = {
  happy: "参考图中角色，开心地笑，嘴巴闭合，其他保持不变",
  happy_talking: "参考图中角色，开心地笑着说话，嘴巴张开，其他保持不变",
  sad: "参考图中角色，露出悲伤表情，嘴角下垂，眼睛含泪，其他保持不变",
  sad_talking: "参考图中角色，悲伤地说话，嘴角下垂，其他保持不变",
  angry: "参考图中角色，露出愤怒表情，眉头紧锁，怒视前方，其他保持不变",
  angry_talking:
    "参考图中角色，愤怒地大声说话，眉头紧锁，嘴巴大张，其他保持不变",
  surprised: "参考图中角色，露出惊讶表情，睁大眼睛张开嘴巴，其他保持不变",
};

/**
 * 构建图片编辑表情提示词（Seedream 4.5 优化版本）
 *
 * 用于图生图场景（image-edit 任务类型）
 * - Doubao (Seedream 4.5)
 * - Qwen image-edit
 *
 * 所有提示词均为中文，遵循 Seedream 简洁指令最佳实践
 *
 * @param expression - 表情类型
 * @returns 中文提示词字符串
 *
 * 示例输出：
 * - idle: "参考图中角色，闭嘴睁眼，其他保持不变，用于帧动画"
 * - happy: "参考图中角色，开心地笑，嘴巴闭合，其他保持不变"
 */
export function buildImageEditExpressionPrompt(
  expression: ExpressionType,
): string {
  // 优先从 Base Pack 查找，找不到则从 Custom Pack 查找
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
