/**
 * GPT-Image adapter via CocoRouter → PiAPI (primary) / Zeakai (fallback).
 *
 * Character (no reference):  POST /v1/piapi/images/generations
 * Character (with reference): POST /v1/piapi/images/edits (image_url)
 * Expression:                 POST /v1/piapi/images/edits (image_url)
 *
 * Each call tries PiAPI first, then falls back to the same operation on the
 * legacy Zeakai endpoints. Callers still receive null/failed on double-failure
 * and should fall back to Qwen / Seedream.
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
const PIAPI_GEN_URL = `${API_BASE}/v1/piapi/images/generations`;
const PIAPI_EDIT_URL = `${API_BASE}/v1/piapi/images/edits`;
const ZEAKAI_GEN_URL = `${API_BASE}/v1/zeakai/images/generations`;
const ZEAKAI_EDIT_URL = `${API_BASE}/v1/zeakai/images/edits`;
const MODEL_ID = "gpt-image-2";
// PiAPI bills at quality=auto (~2× cost) when quality is omitted — always
// pass it explicitly. Valid values: auto/low/medium/high (NOT standard).
// low measured ~46s, medium ~81s; low fits the latency budget below.
const QUALITY = "low";
// Cloudflare 100s origin timeout triggers 524, so 90s is the ceiling.
// Abandoned sync calls still get billed upstream, so the timeout must
// comfortably exceed typical latency (~46s at quality=low) — otherwise we
// pay for images we throw away.
const REQUEST_TIMEOUT_MS = 90_000;

function getApiKey(): string {
  const key = process.env.COCOROUTER_KEY;
  if (!key) throw new Error("COCOROUTER_KEY environment variable not set");
  return key;
}

interface ImagesResponse {
  created?: number;
  data?: Array<{ url?: string }>;
  error?: unknown;
}

/** Try PiAPI first; on failure or empty result, fall back to Zeakai. */
async function withFallback(
  label: string,
  piapi: () => Promise<string | null>,
  zeakai: () => Promise<string | null>,
): Promise<string | null> {
  try {
    const result = await piapi();
    if (result !== null) return result;
    console.warn(`[GptImage] ${label}: PiAPI empty result, trying Zeakai`);
  } catch (e) {
    console.warn(
      `[GptImage] ${label}: PiAPI failed, trying Zeakai:`,
      e instanceof Error ? e.message : e,
    );
  }
  try {
    return await zeakai();
  } catch (e) {
    console.error(
      `[GptImage] ${label}: Zeakai fallback failed:`,
      e instanceof Error ? e.message : e,
    );
    return null;
  }
}

async function postImages(
  label: string,
  url: string,
  body: Record<string, unknown>,
): Promise<string | null> {
  const startTime = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GptImage ${label} HTTP ${res.status} (elapsed=${elapsed}s): ${text.slice(0, 300)}`,
    );
  }
  const data = (await res.json()) as ImagesResponse;
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    console.warn(
      `[GptImage] ${label}: no url in response (elapsed=${elapsed}s)`,
      JSON.stringify(data).slice(0, 300),
    );
    return null;
  }
  console.log(`[GptImage] ${label} complete: elapsed=${elapsed}s`);
  return imageUrl;
}

function generateViaPiapi(prompt: string): Promise<string | null> {
  return postImages("piapi-generate", PIAPI_GEN_URL, {
    model: MODEL_ID,
    prompt,
    n: 1,
    size: "1024x1024",
    quality: QUALITY,
  });
}

function generateViaZeakai(prompt: string): Promise<string | null> {
  return postImages("zeakai-generate", ZEAKAI_GEN_URL, {
    model: MODEL_ID,
    prompt,
    n: 1,
    size: "1024x1024",
  });
}

function editViaPiapi(
  imageUrl: string,
  prompt: string,
): Promise<string | null> {
  return postImages("piapi-edit", PIAPI_EDIT_URL, {
    model: MODEL_ID,
    prompt,
    image_url: imageUrl,
    n: 1,
    size: "1024x1024",
    quality: QUALITY,
  });
}

function editViaZeakai(
  imageUrl: string,
  prompt: string,
): Promise<string | null> {
  return postImages("zeakai-edit", ZEAKAI_EDIT_URL, {
    model: MODEL_ID,
    prompt,
    image_url: imageUrl,
    n: 1,
    size: "1024x1024",
  });
}

export class GptImageAdapter {
  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<string | null> {
    const prompt = buildCharacterPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );

    if (request.referenceUrl) {
      console.log("[GptImage] character (edit) with reference:", prompt);
      const ref = request.referenceUrl;
      return withFallback(
        "character-edit",
        () => editViaPiapi(ref, prompt),
        () => editViaZeakai(ref, prompt),
      );
    }
    console.log("[GptImage] character (generate):", prompt);
    return withFallback(
      "character-generate",
      () => generateViaPiapi(prompt),
      () => generateViaZeakai(prompt),
    );
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = buildImageEditExpressionPrompt(request.expression);
    console.log(`[GptImage] expression ${request.expression}:`, prompt);
    const url = await withFallback(
      `expression-${request.expression}`,
      () => editViaPiapi(request.baseImageUrl, prompt),
      () => editViaZeakai(request.baseImageUrl, prompt),
    );
    if (!url) {
      return {
        status: "failed",
        imageUrl: null,
        error: `GptImage expression ${request.expression} failed on PiAPI and Zeakai`,
      };
    }
    return { status: "completed", imageUrl: url };
  }

  /**
   * Raw edit: run a custom prompt against a reference image.
   * Used by reference-sheet generation where no prompt builder applies.
   */
  async editWithPrompt(
    imageUrl: string,
    prompt: string,
  ): Promise<string | null> {
    console.log("[GptImage] editWithPrompt:", prompt.slice(0, 80));
    return withFallback(
      "custom-edit",
      () => editViaPiapi(imageUrl, prompt),
      () => editViaZeakai(imageUrl, prompt),
    );
  }
}
