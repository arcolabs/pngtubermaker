/**
 * GPT-Image adapter via CocoRouter → Zeakai.
 *
 * Character (no reference):  POST /v1/zeakai/images/generations
 * Character (with reference): POST /v1/zeakai/images/edits (image_url)
 * Expression:                 POST /v1/zeakai/images/edits (image_url)
 *
 * Each call retries once on failure. Callers still receive null/failed on
 * double-failure and should fall back to Qwen / Doubao.
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
const GEN_URL = `${API_BASE}/v1/zeakai/images/generations`;
const EDIT_URL = `${API_BASE}/v1/zeakai/images/edits`;
const MODEL_ID = "gpt-image-2";
// Cloudflare 100s origin timeout triggers 524. GPT edit is slower than
// generate, so cut timeout to 60s — fail fast so fallback (Qwen/Doubao)
// triggers within the client's 180s budget instead of burning time on a
// guaranteed timeout.
const REQUEST_TIMEOUT_MS = 60_000;

function getApiKey(): string {
  const key = process.env.COCOROUTER_KEY;
  if (!key) throw new Error("COCOROUTER_KEY environment variable not set");
  return key;
}

interface ZeakaiResponse {
  created?: number;
  data?: Array<{ url?: string }>;
  error?: unknown;
}

async function callWithRetry<T>(
  label: string,
  fn: () => Promise<T | null>,
): Promise<T | null> {
  try {
    const result = await fn();
    if (result !== null) return result;
    console.warn(`[GptImage] ${label}: empty result, retrying`);
  } catch (e) {
    console.warn(
      `[GptImage] ${label}: first attempt failed, retrying:`,
      e instanceof Error ? e.message : e,
    );
  }
  try {
    return await fn();
  } catch (e) {
    console.error(
      `[GptImage] ${label}: retry failed:`,
      e instanceof Error ? e.message : e,
    );
    return null;
  }
}

async function postGenerate(prompt: string): Promise<string | null> {
  const startTime = Date.now();
  const res = await fetch(GEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL_ID,
      prompt,
      n: 1,
      size: "1024x1024",
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GptImage generate HTTP ${res.status} (elapsed=${elapsed}s): ${text.slice(0, 300)}`,
    );
  }
  const data = (await res.json()) as ZeakaiResponse;
  const url = data.data?.[0]?.url;
  if (!url) {
    console.warn(
      `[GptImage] generate: no url in response (elapsed=${elapsed}s)`,
      JSON.stringify(data).slice(0, 300),
    );
    return null;
  }
  console.log(`[GptImage] generate complete: elapsed=${elapsed}s`);
  return url;
}

async function postEdit(
  imageUrl: string,
  prompt: string,
): Promise<string | null> {
  const startTime = Date.now();
  const res = await fetch(EDIT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL_ID,
      prompt,
      image_url: imageUrl,
      n: 1,
      size: "1024x1024",
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GptImage edit HTTP ${res.status} (elapsed=${elapsed}s): ${text.slice(0, 300)}`,
    );
  }
  const data = (await res.json()) as ZeakaiResponse;
  const url = data.data?.[0]?.url;
  if (!url) {
    console.warn(
      `[GptImage] edit: no url in response (elapsed=${elapsed}s)`,
      JSON.stringify(data).slice(0, 300),
    );
    return null;
  }
  console.log(`[GptImage] edit complete: elapsed=${elapsed}s`);
  return url;
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
      return callWithRetry("character-edit", () =>
        postEdit(request.referenceUrl as string, prompt),
      );
    }
    console.log("[GptImage] character (generate):", prompt);
    return callWithRetry("character-generate", () => postGenerate(prompt));
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = buildImageEditExpressionPrompt(request.expression);
    console.log(`[GptImage] expression ${request.expression}:`, prompt);
    // Expression generation via edit mode is significantly slower and more likely
    // to hit Cloudflare timeouts than character generation. Skip retry on
    // expression endpoints so the production adapter's Qwen/Doubao fallback
    // chain fires faster. The 60s timeout still gives the call a fair shot.
    const url = await postEdit(request.baseImageUrl, prompt);
    if (!url) {
      return {
        status: "failed",
        imageUrl: null,
        error: `GptImage expression ${request.expression} failed after single attempt`,
      };
    }
    return { status: "completed", imageUrl: url };
  }
}
