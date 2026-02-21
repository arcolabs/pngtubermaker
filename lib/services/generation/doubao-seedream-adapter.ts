/**
 * Doubao Seedream 4.5 adapter for character generation via ByteDance Ark API.
 *
 * API: synchronous POST → returns image URL directly (no polling).
 * Auth: Authorization Bearer with ARK_API_KEY env var.
 *
 * Supports text-to-image and image-to-image (with `image` field).
 */

import { buildImageEditExpressionPrompt } from "./prompt-builder";
import {
  buildCharacterPrompt,
  type GenerateCharacterRequest,
  type GenerateExpressionRequest,
  type GenerateExpressionResult,
} from "./types";

const API_URL =
  "https://ark.cn-beijing.volces.com/api/v3/images/generations";

function getApiKey(): string {
  const key = process.env.ARK_API_KEY;
  if (!key) throw new Error("ARK_API_KEY environment variable not set");
  return key;
}

// ── API types ────────────────────────────────────────────────────────────────

interface DoubaoResponse {
  data?: {
    url?: string;
    size?: string;
  }[];
  [key: string]: unknown;
}

// ── Adapter ──────────────────────────────────────────────────────────────────

export class DoubaoSeedreamAdapter {
  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<string | null> {
    const prompt = buildCharacterPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );

    console.log("[Doubao] Submitting character generation:", prompt);

    const body: Record<string, unknown> = {
      model: "doubao-seedream-4-5-251128",
      prompt,
      size: "1920x1920",
      watermark: false,
    };

    if (request.referenceUrl) {
      body.image = request.referenceUrl;
      console.log("[Doubao] With reference image:", request.referenceUrl);
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Doubao submit failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as DoubaoResponse;
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      console.error(
        "[Doubao] No image in response:",
        JSON.stringify(data, null, 2),
      );
      return null;
    }

    console.log("[Doubao] Generation complete");
    return imageUrl;
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = buildImageEditExpressionPrompt(request.expression);

    console.log(
      `[Doubao] Generating ${request.expression} expression:`,
      prompt,
    );

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: "doubao-seedream-4-5-251128",
        prompt,
        image: request.baseImageUrl,
        size: "1920x1920",
        watermark: false,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        status: "failed",
        imageUrl: null,
        error: `Doubao expression failed (${res.status}): ${text}`,
      };
    }

    const data = (await res.json()) as DoubaoResponse;
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return {
        status: "failed",
        imageUrl: null,
        error: "No image URL in Doubao response",
      };
    }

    console.log(`[Doubao] Expression ${request.expression} complete`);
    return { status: "completed", imageUrl };
  }
}
