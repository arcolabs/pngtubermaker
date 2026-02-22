/**
 * Doubao Seedream adapter for character generation via ByteDance Ark API.
 *
 * API: POST https://ark.cn-beijing.volces.com/api/v3/images/generations
 * Auth: Authorization Bearer with ARK_API_KEY env var.
 * Response: base64 image data (b64_json) — returned as data URI for downstream R2 upload.
 *
 * Uses b64_json response format to avoid CDN download issues
 * (ByteDance CDN nodes may be unreachable from non-China servers).
 *
 * Models:
 * - doubao-seedream-4-5-251128 (current, 4.5)
 * - doubao-seedream-5-0-lite (available ~2026-02-24, 5.0 lite)
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

const API_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const MODEL_ID = process.env.DOUBAO_MODEL_ID || "doubao-seedream-4-5-251128";

function getApiKey(): string {
  const key = process.env.ARK_API_KEY;
  if (!key) throw new Error("ARK_API_KEY environment variable not set");
  return key;
}

// ── API types ────────────────────────────────────────────────────────────────

interface DoubaoResponse {
  data?: (
    | { url?: string; b64_json?: string; size?: string }
    | { error?: { code?: string; message?: string } }
  )[];
  usage?: {
    generated_images?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  error?: { code?: string; message?: string };
}

/** Extract base64 image data from the first successful item in data array */
function extractImageBase64(response: DoubaoResponse): string | undefined {
  for (const item of response.data ?? []) {
    if ("b64_json" in item && item.b64_json) return item.b64_json;
  }
  return undefined;
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
      model: MODEL_ID,
      prompt,
      size: "2048x2048",
      response_format: "b64_json",
      sequential_image_generation: "disabled",
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

    if (data.error) {
      throw new Error(
        `Doubao API error: ${data.error.code} - ${data.error.message}`,
      );
    }

    const b64 = extractImageBase64(data);

    if (!b64) {
      console.error("[Doubao] No image data in response");
      return null;
    }

    console.log("[Doubao] Generation complete (b64_json)");
    return `data:image/png;base64,${b64}`;
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
        model: MODEL_ID,
        prompt,
        image: request.baseImageUrl,
        size: "2048x2048",
        response_format: "b64_json",
        sequential_image_generation: "disabled",
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

    if (data.error) {
      return {
        status: "failed",
        imageUrl: null,
        error: `Doubao API error: ${data.error.code} - ${data.error.message}`,
      };
    }

    const b64 = extractImageBase64(data);

    if (!b64) {
      return {
        status: "failed",
        imageUrl: null,
        error: "No image data in Doubao response",
      };
    }

    console.log(
      `[Doubao] Expression ${request.expression} complete (b64_json)`,
    );
    return {
      status: "completed",
      imageUrl: `data:image/png;base64,${b64}`,
    };
  }
}
