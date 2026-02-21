/**
 * Gemini 2.5 Flash Image adapter for character generation via piapi.ai.
 *
 * API flow: submit task → poll until done → extract 1 character image URL.
 * Auth: X-API-Key header with PIAPI_API_KEY env var.
 *
 * Supports optional reference images via image_urls parameter.
 * $0.03 per image.
 */

import { PollFailedError, pollUntilDone } from "./poll";
import { buildCharacterPrompt, type GenerateCharacterRequest } from "./types";

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
      task_type: "gemini-2.5-flash-image",
      input,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini Flash submit failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as SubmitResponse;
  const taskId = data.data?.task_id;
  if (!taskId) {
    throw new Error(
      `Gemini Flash submit response missing task_id: ${JSON.stringify(data)}`,
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
    throw new Error(`Gemini Flash poll failed (${res.status}): ${body}`);
  }

  return (await res.json()) as TaskResponse;
}

// ── Status helpers ───────────────────────────────────────────────────────────

function isCompleted(status?: string): boolean {
  return status?.toLowerCase() === "completed";
}

function isFailed(status?: string): boolean {
  const s = status?.toLowerCase();
  return s === "failed" || s === "error";
}

// ── Adapter ──────────────────────────────────────────────────────────────────

export class GeminiFlashAdapter {
  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<string | null> {
    const prompt = buildCharacterPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );
    const imageUrls = request.referenceUrl ? [request.referenceUrl] : undefined;

    console.log("[GeminiFlash] Submitting character generation:", prompt);
    if (imageUrls)
      console.log("[GeminiFlash] With reference image:", imageUrls);

    const taskId = await submitTask(prompt, imageUrls);
    console.log("[GeminiFlash] Task submitted:", taskId);

    const result = await pollUntilDone<TaskResponse>(
      {
        check: async () => {
          const data = await checkTask(taskId);
          const status = data.data?.status;

          if (isCompleted(status)) return data;
          if (isFailed(status)) {
            throw new PollFailedError(
              data.data?.error?.message || "Gemini Flash generation failed",
            );
          }
          return null;
        },
        onPending: () => console.log("[GeminiFlash] Still generating..."),
      },
      { initialDelay: 5000, interval: 5000, timeout: 180_000 },
    );

    const imageUrl = extractImageUrl(result.data);
    if (!imageUrl) {
      console.error(
        "[GeminiFlash] No image in response:",
        JSON.stringify(result, null, 2),
      );
      return null;
    }

    console.log("[GeminiFlash] Generation complete");
    return imageUrl;
  }
}
