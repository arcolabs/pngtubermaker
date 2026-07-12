/**
 * BytePlus (ARK) Seedream 5.0 Lite adapter - the PRIMARY upstream for seedream.
 *
 * Synchronous: a single POST to /api/v3/images/generations returns the image
 * URL directly (see byteplus-client.ts). No submit/poll.
 *
 * The same endpoint serves text-to-image (no reference) and image-edit (with a
 * reference image); mode is selected by whether `image` is passed.
 *
 * Lite does NOT support a `seed` parameter, so to produce visibly different
 * character candidates the caller passes a distinct `variantSuffix` per slot
 * (lighting / mood / pose modifiers appended to the base prompt).
 *
 * Provider label: "byteplus-lite" - distinguishes from the PiAPI fallback
 * ("piapi-lite") and qwen ("qwen") in candidate_providers / expression rows.
 */

import { generateImageSync } from "./byteplus-client";
import { buildImageEditExpressionPrompt } from "./prompt-builder";
import {
  buildCharacterPrompt,
  type GenerateCharacterRequest,
  type GenerateExpressionRequest,
  type GenerateExpressionResult,
  type ProviderImage,
} from "./types";

export const BYTEPLUS_LITE_PROVIDER = "byteplus-lite";

export class BytePlusAdapter {
  /**
   * Generate a single character image.
   * `variantSuffix` is appended to the base prompt to differentiate parallel
   * candidates (lite has no seed); pass "" for the unmodified prompt.
   */
  async generateCharacterImage(
    request: GenerateCharacterRequest,
    variantSuffix = "",
  ): Promise<ProviderImage | null> {
    const base = buildCharacterPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );
    const prompt = variantSuffix ? `${base}, ${variantSuffix}` : base;

    console.log(
      `[BytePlus:${BYTEPLUS_LITE_PROVIDER}] Submitting character generation:`,
      prompt,
    );
    if (request.referenceUrl) {
      console.log(
        `[BytePlus:${BYTEPLUS_LITE_PROVIDER}] With reference image (image-edit):`,
        request.referenceUrl,
      );
    }

    const url = await generateImageSync(
      { prompt, image: request.referenceUrl ?? undefined },
      `character:${BYTEPLUS_LITE_PROVIDER}`,
    );
    return url ? { url, provider: BYTEPLUS_LITE_PROVIDER } : null;
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = buildImageEditExpressionPrompt(request.expression);
    console.log(
      `[BytePlus:${BYTEPLUS_LITE_PROVIDER}] Generating ${request.expression} expression (image-edit):`,
      prompt,
    );

    try {
      const imageUrl = await generateImageSync(
        { prompt, image: request.baseImageUrl },
        `expression-${request.expression}:${BYTEPLUS_LITE_PROVIDER}`,
      );
      if (!imageUrl) {
        return {
          status: "failed",
          imageUrl: null,
          error: "No image data in BytePlus response",
        };
      }
      return {
        status: "completed",
        imageUrl,
        provider: BYTEPLUS_LITE_PROVIDER,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        `[BytePlus:${BYTEPLUS_LITE_PROVIDER}] Expression ${request.expression} failed:`,
        msg,
      );
      return { status: "failed", imageUrl: null, error: msg };
    }
  }

  /**
   * Raw edit: run a custom prompt against a reference image.
   * Used by reference-sheet generation where no prompt builder applies.
   * Not gated by similarity (the output is intentionally a different frame).
   */
  async editWithPrompt(
    imageUrl: string,
    prompt: string,
  ): Promise<string | null> {
    console.log(
      `[BytePlus:${BYTEPLUS_LITE_PROVIDER}] editWithPrompt:`,
      prompt.slice(0, 80),
    );
    return generateImageSync(
      { prompt, image: imageUrl },
      `custom-edit:${BYTEPLUS_LITE_PROVIDER}`,
    );
  }
}
