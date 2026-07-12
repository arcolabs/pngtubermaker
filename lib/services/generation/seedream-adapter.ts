/**
 * Seedream 5 Lite adapter via direct PiAPI - now the FALLBACK upstream for
 * seedream (cross-vendor redundancy behind the primary BytePlus path).
 *
 * PiAPI task protocol: submit -> poll until done -> extract image URL.
 *   task_type=seedream-5-lite, size=2K (lite only accepts 2K/3K).
 *   provider label: "piapi-lite" - distinguishes from "byteplus-lite" and
 *   "qwen" in candidate_providers / expression rows.
 *
 * Supports text-to-image (no image_urls) and image editing (image_urls).
 */

import { submitAndResolve } from "./piapi-client";
import { buildImageEditExpressionPrompt } from "./prompt-builder";
import {
  buildCharacterPrompt,
  type GenerateCharacterRequest,
  type GenerateExpressionRequest,
  type GenerateExpressionResult,
  type ProviderImage,
} from "./types";

export const PIAPI_LITE_PROVIDER = "piapi-lite";

const TASK_TYPE = "seedream-5-lite";
const SIZE = "2K";

export class SeedreamAdapter {
  private readonly provider = PIAPI_LITE_PROVIDER;

  private buildBody(prompt: string, referenceUrl?: string | null) {
    const input: Record<string, unknown> = {
      prompt,
      aspect_ratio: "1:1",
      size: SIZE,
      output_format: "png",
    };
    if (referenceUrl) {
      input.image_urls = [referenceUrl];
    }
    return { model: "seedream", task_type: TASK_TYPE, input };
  }

  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<ProviderImage | null> {
    const prompt = buildCharacterPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );

    console.log(
      `[Seedream:${this.provider}] Submitting character generation:`,
      prompt,
    );
    if (request.referenceUrl) {
      console.log(
        `[Seedream:${this.provider}] With reference image:`,
        request.referenceUrl,
      );
    }

    const url = await submitAndResolve(
      this.buildBody(prompt, request.referenceUrl),
      {
        label: `character:${this.provider}`,
      },
    );
    return url ? { url, provider: this.provider } : null;
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = buildImageEditExpressionPrompt(request.expression);
    console.log(
      `[Seedream:${this.provider}] Generating ${request.expression} expression (image-edit):`,
      prompt,
    );

    try {
      const imageUrl = await submitAndResolve(
        this.buildBody(prompt, request.baseImageUrl),
        { label: `expression-${request.expression}:${this.provider}` },
      );
      if (!imageUrl) {
        return {
          status: "failed",
          imageUrl: null,
          error: "No image data in Seedream response",
        };
      }
      return { status: "completed", imageUrl, provider: this.provider };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        `[Seedream:${this.provider}] Expression ${request.expression} failed:`,
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
      `[Seedream:${this.provider}] editWithPrompt:`,
      prompt.slice(0, 80),
    );
    return submitAndResolve(this.buildBody(prompt, imageUrl), {
      label: `custom-edit:${this.provider}`,
    });
  }
}
