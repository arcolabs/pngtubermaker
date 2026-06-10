/**
 * GPT-Image adapter via CocoRouter. Same model (gpt-image-2) on two pools;
 * primary/fallback order is chosen per operation by measured latency:
 *
 * Generations (PiAPI primary, Zeakai fallback): PiAPI ~46s ≈ Zeakai p50 42s
 * Edits (Zeakai primary, PiAPI fallback): Zeakai p50 48s vs PiAPI ~96s —
 *   PiAPI edits routinely blow the 90s timeout / Cloudflare 100s wall, and
 *   abandoned sync calls are still billed upstream.
 *
 * Callers still receive null/failed on double-failure and should fall back
 * to Qwen / Seedream.
 */

import { buildImageEditExpressionPrompt } from "./prompt-builder";
import {
  buildCharacterPrompt,
  type GenerateCharacterRequest,
  type GenerateExpressionRequest,
  type GenerateExpressionResult,
  type ProviderImage,
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

interface Attempt {
  provider: string;
  run: () => Promise<string | null>;
}

/** Try primary; on failure or empty result, fall back to the other pool. */
async function withFallback(
  label: string,
  primary: Attempt,
  fallback: Attempt,
): Promise<ProviderImage | null> {
  try {
    const url = await primary.run();
    if (url !== null) return { url, provider: primary.provider };
    console.warn(
      `[GptImage] ${label}: ${primary.provider} empty result, trying ${fallback.provider}`,
    );
  } catch (e) {
    console.warn(
      `[GptImage] ${label}: ${primary.provider} failed, trying ${fallback.provider}:`,
      e instanceof Error ? e.message : e,
    );
  }
  try {
    const url = await fallback.run();
    return url !== null ? { url, provider: fallback.provider } : null;
  } catch (e) {
    console.error(
      `[GptImage] ${label}: ${fallback.provider} fallback failed:`,
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

function generateAttempts(prompt: string): [Attempt, Attempt] {
  return [
    {
      provider: "piapi-gpt",
      run: () =>
        postImages("piapi-generate", PIAPI_GEN_URL, {
          model: MODEL_ID,
          prompt,
          n: 1,
          size: "1024x1024",
          quality: QUALITY,
        }),
    },
    {
      provider: "zeakai-gpt",
      run: () =>
        postImages("zeakai-generate", ZEAKAI_GEN_URL, {
          model: MODEL_ID,
          prompt,
          n: 1,
          size: "1024x1024",
        }),
    },
  ];
}

function editAttempts(imageUrl: string, prompt: string): [Attempt, Attempt] {
  return [
    {
      provider: "zeakai-gpt",
      run: () =>
        postImages("zeakai-edit", ZEAKAI_EDIT_URL, {
          model: MODEL_ID,
          prompt,
          image_url: imageUrl,
          n: 1,
          size: "1024x1024",
        }),
    },
    {
      provider: "piapi-gpt",
      run: () =>
        postImages("piapi-edit", PIAPI_EDIT_URL, {
          model: MODEL_ID,
          prompt,
          image_url: imageUrl,
          n: 1,
          size: "1024x1024",
          quality: QUALITY,
        }),
    },
  ];
}

export class GptImageAdapter {
  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<ProviderImage | null> {
    const prompt = buildCharacterPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );

    if (request.referenceUrl) {
      console.log("[GptImage] character (edit) with reference:", prompt);
      const [primary, fallback] = editAttempts(request.referenceUrl, prompt);
      return withFallback("character-edit", primary, fallback);
    }
    console.log("[GptImage] character (generate):", prompt);
    const [primary, fallback] = generateAttempts(prompt);
    return withFallback("character-generate", primary, fallback);
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = buildImageEditExpressionPrompt(request.expression);
    console.log(`[GptImage] expression ${request.expression}:`, prompt);
    const [primary, fallback] = editAttempts(request.baseImageUrl, prompt);
    const result = await withFallback(
      `expression-${request.expression}`,
      primary,
      fallback,
    );
    if (!result) {
      return {
        status: "failed",
        imageUrl: null,
        error: `GptImage expression ${request.expression} failed on Zeakai and PiAPI`,
      };
    }
    return {
      status: "completed",
      imageUrl: result.url,
      provider: result.provider,
    };
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
    const [primary, fallback] = editAttempts(imageUrl, prompt);
    const result = await withFallback("custom-edit", primary, fallback);
    return result?.url ?? null;
  }
}
