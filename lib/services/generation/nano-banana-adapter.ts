/**
 * Nano Banana Pro adapter via piapi.ai.
 *
 * Capabilities:
 * - Character generation: text prompt + optional reference images (image_urls)
 * - Expression generation: text-only prompt engineering via prompt-builder.ts
 *
 * API flow: submit task → poll until done → extract image URL.
 * Auth: X-API-Key header with PIAPI_API_KEY env var.
 */

import { PollFailedError, pollUntilDone } from "./poll";
import { buildImageEditExpressionPrompt } from "./prompt-builder";
import {
  buildCharacterPrompt,
  type GenerateCharacterRequest,
  type GenerateExpressionRequest,
  type GenerateExpressionResult,
} from "./types";

const API_BASE = "https://api.piapi.ai/api/v1";

function getApiKey(): string {
  const key = process.env.PIAPI_API_KEY;
  if (!key) throw new Error("PIAPI_API_KEY environment variable not set");
  return key;
}

// ── API types ────────────────────────────────────────────────────────────────

interface SubmitResponse {
  data?: {
    task_id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TaskResponse {
  data?: {
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
  };
  [key: string]: unknown;
}

/** Extract image URL from output — handles both image_url and image_urls */
function extractImageUrl(output?: TaskResponse["data"]): string | undefined {
  return output?.output?.image_url || output?.output?.image_urls?.[0];
}

// ── API calls ────────────────────────────────────────────────────────────────

async function submitTask(
  prompt: string,
  imageUrls?: string[],
): Promise<string> {
  const apiKey = getApiKey();

  const input: Record<string, unknown> = {
    prompt,
    output_format: "png",
    aspect_ratio: "1:1",
    resolution: "1K",
  };

  if (imageUrls && imageUrls.length > 0) {
    input.image_urls = imageUrls;
  }

  const res = await fetch(`${API_BASE}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "gemini",
      task_type: "nano-banana-pro",
      input,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Nano Banana submit failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as SubmitResponse;
  const taskId = data.data?.task_id;
  if (!taskId) {
    throw new Error(
      `Nano Banana submit response missing task_id: ${JSON.stringify(data)}`,
    );
  }

  return taskId;
}

async function checkTask(taskId: string): Promise<TaskResponse> {
  const apiKey = getApiKey();

  const res = await fetch(`${API_BASE}/task/${taskId}`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Nano Banana poll failed (${res.status}): ${body}`);
  }

  return (await res.json()) as TaskResponse;
}

/** Check if a status string indicates completion (case-insensitive) */
function isCompleted(status?: string): boolean {
  return status?.toLowerCase() === "completed";
}

/** Check if a status string indicates failure (case-insensitive) */
function isFailed(status?: string): boolean {
  const s = status?.toLowerCase();
  return s === "failed" || s === "error";
}

// ── Adapter ──────────────────────────────────────────────────────────────────

export class NanoBananaAdapter {
  /**
   * Generate a single character image (used in multi-model parallel generation).
   * Supports optional reference images via the image_urls parameter.
   */
  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<string | null> {
    const prompt = buildCharacterPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );
    const imageUrls = request.referenceUrl ? [request.referenceUrl] : undefined;

    console.log("[NanoBanana] Submitting character generation:", prompt);
    if (imageUrls) console.log("[NanoBanana] With reference image:", imageUrls);

    const taskId = await submitTask(prompt, imageUrls);
    console.log("[NanoBanana] Character task submitted:", taskId);

    const result = await pollUntilDone<TaskResponse>(
      {
        check: async () => {
          const data = await checkTask(taskId);
          const status = data.data?.status;

          if (isCompleted(status)) return data;
          if (isFailed(status)) {
            throw new PollFailedError(
              data.data?.error?.message || "Nano Banana generation failed",
            );
          }
          return null;
        },
        onPending: () =>
          console.log("[NanoBanana] Still generating character..."),
      },
      { initialDelay: 5000, interval: 5000, timeout: 180_000 },
    );

    const imageUrl = extractImageUrl(result.data);
    if (!imageUrl) {
      console.error(
        "[NanoBanana] No image in character response:",
        JSON.stringify(result, null, 2),
      );
      return null;
    }

    console.log("[NanoBanana] Character generation complete");
    return imageUrl;
  }

  /**
   * Generate a single expression variant.
   * Uses base image as reference via image_urls + expression edit prompt.
   * Note: baseImageUrl is required for expression generation.
   */
  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    // Note: This adapter requires baseImageUrl for expression generation
    // We always use image-edit mode with the base character image
    if (!request.baseImageUrl) {
      return {
        status: "failed",
        imageUrl: null,
        error: "baseImageUrl is required for NanoBanana expression generation",
      };
    }

    const prompt = buildImageEditExpressionPrompt(request.expression);
    const imageUrls = [request.baseImageUrl];

    console.log(
      `[NanoBanana] Generating ${request.expression} expression (image-edit):`,
      prompt,
    );
    const taskId = await submitTask(prompt, imageUrls);
    console.log("[NanoBanana] Task submitted:", taskId);

    const result = await pollUntilDone<TaskResponse>(
      {
        check: async () => {
          const data = await checkTask(taskId);
          const status = data.data?.status;

          if (isCompleted(status)) return data;
          if (isFailed(status)) {
            throw new PollFailedError(
              data.data?.error?.message || "Nano Banana generation failed",
            );
          }
          return null;
        },
        onPending: () =>
          console.log(`[NanoBanana] Still generating ${request.expression}...`),
      },
      { initialDelay: 5000, interval: 5000, timeout: 180_000 },
    );

    const imageUrl = extractImageUrl(result.data);
    if (!imageUrl) {
      return {
        status: "failed",
        imageUrl: null,
        error: "No image URL in Nano Banana response",
      };
    }

    console.log(`[NanoBanana] Expression ${request.expression} complete`);

    return {
      status: "completed",
      imageUrl,
    };
  }
}
