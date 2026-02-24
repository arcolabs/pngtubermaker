/**
 * Doubao Seedream 5.0 adapter for character generation via CocoRouter → ByteDance Ark API.
 *
 * API: POST {COCOROUTER_URL}/v1/ark/images/generations
 * Auth: Authorization Bearer with COCOROUTER_KEY env var.
 * Response: CDN URL (CocoRouter auto-uploads to R2).
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

const API_BASE =
  process.env.COCOROUTER_URL || "https://router.interastralpeace.online";
const API_URL = `${API_BASE}/v1/ark/images/generations`;
const MODEL_ID = "doubao-seedream-5-0-260128";

function getApiKey(): string {
  const key = process.env.COCOROUTER_KEY;
  if (!key) throw new Error("COCOROUTER_KEY environment variable not set");
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

/** Extract image URL from the first item (CocoRouter returns CDN URL) */
function extractImageUrl(response: DoubaoResponse): string | undefined {
  for (const item of response.data ?? []) {
    if ("url" in item && item.url) return item.url;
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
      sequential_image_generation: "disabled",
      watermark: false,
    };

    if (request.referenceUrl) {
      body.image = request.referenceUrl;
      console.log("[Doubao] With reference image:", request.referenceUrl);
    }

    const startTime = Date.now();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const reqId = res.headers.get("x-request-id") || "n/a";

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[Doubao] Character generation failed: status=${res.status} reqId=${reqId} elapsed=${elapsed}s body=${text.slice(0, 500)}`,
      );
      throw new Error(`Doubao submit failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as DoubaoResponse;

    if (data.error) {
      console.error(
        `[Doubao] API error: code=${data.error.code} message=${data.error.message} reqId=${reqId}`,
      );
      throw new Error(
        `Doubao API error: ${data.error.code} - ${data.error.message}`,
      );
    }

    const imageUrl = extractImageUrl(data);

    if (!imageUrl) {
      console.error(
        `[Doubao] No image in response: reqId=${reqId}`,
        JSON.stringify(data, null, 2),
      );
      return null;
    }

    console.log(
      `[Doubao] Generation complete: elapsed=${elapsed}s reqId=${reqId}`,
    );
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

    const startTime = Date.now();
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
        sequential_image_generation: "disabled",
        watermark: false,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const reqId = res.headers.get("x-request-id") || "n/a";

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[Doubao] Expression ${request.expression} failed: status=${res.status} reqId=${reqId} elapsed=${elapsed}s body=${text.slice(0, 500)}`,
      );
      return {
        status: "failed",
        imageUrl: null,
        error: `Doubao expression failed (${res.status}): ${text}`,
      };
    }

    const data = (await res.json()) as DoubaoResponse;

    if (data.error) {
      console.error(
        `[Doubao] Expression ${request.expression} API error: code=${data.error.code} message=${data.error.message} reqId=${reqId}`,
      );
      return {
        status: "failed",
        imageUrl: null,
        error: `Doubao API error: ${data.error.code} - ${data.error.message}`,
      };
    }

    const imageUrl = extractImageUrl(data);

    if (!imageUrl) {
      console.error(
        `[Doubao] Expression ${request.expression} no image: reqId=${reqId}`,
        JSON.stringify(data, null, 2),
      );
      return {
        status: "failed",
        imageUrl: null,
        error: "No image data in Doubao response",
      };
    }

    console.log(
      `[Doubao] Expression ${request.expression} complete: elapsed=${elapsed}s reqId=${reqId}`,
    );
    return {
      status: "completed",
      imageUrl,
    };
  }
}
