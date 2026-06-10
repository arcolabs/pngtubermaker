/**
 * Seedream 5 Lite adapter via CocoRouter → PiAPI.
 *
 * API: POST {COCOROUTER_URL}/v1/piapi/task
 *      (model=seedream, task_type=seedream-5-lite, standard PiAPI envelope)
 *
 * Delivery is synchronous — the submit response usually already contains the
 * output. Polls GET /v1/piapi/task/:id only when it doesn't (e.g. CocoRouter
 * returned before upstream finished).
 *
 * Supports text-to-image and image editing (image_urls reference).
 */

import { PollFailedError, pollUntilDone } from "./poll";
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
const TASK_URL = `${API_BASE}/v1/piapi/task`;
// Sync delivery: a single 2K generation typically completes within the
// request. Generous timeout since the whole generation happens in-band.
const SUBMIT_TIMEOUT_MS = 120_000;

function getApiKey(): string {
  const key = process.env.COCOROUTER_KEY;
  if (!key) throw new Error("COCOROUTER_KEY environment variable not set");
  return key;
}

// ── API types ────────────────────────────────────────────────────────────────

interface TaskData {
  task_id?: string;
  status?: string;
  output?: {
    image_url?: string;
    image_urls?: string[];
    [key: string]: unknown;
  };
  error?: {
    message?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TaskResponse {
  data?: TaskData;
  [key: string]: unknown;
}

function extractImageUrl(data?: TaskData): string | undefined {
  return data?.output?.image_url || data?.output?.image_urls?.[0];
}

function isCompleted(status?: string): boolean {
  return status?.toLowerCase() === "completed";
}

function isFailed(status?: string): boolean {
  const s = status?.toLowerCase();
  return s === "failed" || s === "error";
}

// ── API calls ────────────────────────────────────────────────────────────────

async function submitTask(
  prompt: string,
  referenceUrl?: string | null,
): Promise<TaskData> {
  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: "1:1",
    size: "2K",
    output_format: "png",
  };
  if (referenceUrl) {
    input.image_urls = [referenceUrl];
  }

  const res = await fetch(TASK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: "seedream",
      task_type: "seedream-5-lite",
      input,
    }),
    signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Seedream submit failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const body = (await res.json()) as TaskResponse;
  if (!body.data) {
    throw new Error(
      `Seedream submit: no data in response: ${JSON.stringify(body).slice(0, 300)}`,
    );
  }
  return body.data;
}

async function checkTask(taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${TASK_URL}/${taskId}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Seedream poll failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return (await res.json()) as TaskResponse;
}

/**
 * Submit and resolve to an image URL. Returns the URL from the submit
 * response when delivery was synchronous, otherwise polls.
 */
async function generateImage(
  prompt: string,
  referenceUrl: string | null | undefined,
  label: string,
): Promise<string | null> {
  const startTime = Date.now();
  const data = await submitTask(prompt, referenceUrl);

  // Sync path: output already present
  const syncUrl = extractImageUrl(data);
  if (syncUrl && isCompleted(data.status)) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Seedream] ${label} complete (sync): elapsed=${elapsed}s`);
    return syncUrl;
  }
  if (isFailed(data.status)) {
    throw new Error(
      `Seedream ${label} failed: ${data.error?.message ?? "unknown error"}`,
    );
  }

  const taskId = data.task_id;
  if (!taskId) {
    console.error(
      `[Seedream] ${label}: no output and no task_id`,
      JSON.stringify(data).slice(0, 300),
    );
    return null;
  }

  console.log(`[Seedream] ${label}: not delivered sync, polling task ${taskId}`);
  const result = await pollUntilDone<TaskResponse>(
    {
      check: async () => {
        const resp = await checkTask(taskId);
        const status = resp.data?.status;
        if (isCompleted(status)) return resp;
        if (isFailed(status)) {
          throw new PollFailedError(
            resp.data?.error?.message || "Seedream generation failed",
          );
        }
        return null;
      },
      onPending: () => console.log(`[Seedream] ${label}: still generating...`),
    },
    { initialDelay: 3000, interval: 3000, timeout: 120_000 },
    `Seedream:${label}:${taskId.slice(0, 8)}`,
  );

  const imageUrl = extractImageUrl(result.data);
  if (!imageUrl) {
    console.error(
      `[Seedream] ${label}: no image in completed task ${taskId}`,
      JSON.stringify(result).slice(0, 300),
    );
    return null;
  }
  return imageUrl;
}

// ── Adapter ──────────────────────────────────────────────────────────────────

export class SeedreamAdapter {
  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<ProviderImage | null> {
    const prompt = buildCharacterPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );

    console.log("[Seedream] Submitting character generation:", prompt);
    if (request.referenceUrl)
      console.log("[Seedream] With reference image:", request.referenceUrl);

    const url = await generateImage(prompt, request.referenceUrl, "character");
    return url ? { url, provider: "seedream" } : null;
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = buildImageEditExpressionPrompt(request.expression);
    console.log(
      `[Seedream] Generating ${request.expression} expression (image-edit):`,
      prompt,
    );

    try {
      const imageUrl = await generateImage(
        prompt,
        request.baseImageUrl,
        `expression-${request.expression}`,
      );
      if (!imageUrl) {
        return {
          status: "failed",
          imageUrl: null,
          error: "No image data in Seedream response",
        };
      }
      return { status: "completed", imageUrl, provider: "seedream" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        `[Seedream] Expression ${request.expression} failed:`,
        msg,
      );
      return { status: "failed", imageUrl: null, error: msg };
    }
  }
}
