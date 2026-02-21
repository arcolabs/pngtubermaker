/**
 * Qwen Image adapter for character generation via piapi.ai.
 *
 * API flow: submit task → poll until done → extract 1 character image URL.
 * Auth: X-API-Key header with PIAPI_API_KEY env var.
 *
 * Supports two task types:
 * - txt2img: text-only generation
 * - image-edit: generation with a reference image (image1)
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

/**
 * Build Qwen-specific prompt. For image-edit mode, also references "image1"
 * so Qwen knows to use the uploaded reference image.
 */
function buildQwenPrompt(
  prompt: string,
  style: Parameters<typeof buildCharacterPrompt>[1],
  hasReference: boolean,
): string {
  const base = buildCharacterPrompt(prompt, style, hasReference);
  // Qwen image-edit references images by field name in prompt text
  return hasReference ? `based on image1, ${base}` : base;
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
  referenceUrl?: string | null,
): Promise<string> {
  const apiKey = getApiKey();

  const taskType = referenceUrl ? "image-edit" : "txt2img";
  console.log(`[Qwen] task_type=${taskType}, referenceUrl=${referenceUrl ?? "none"}`);

  const input: Record<string, unknown> = {
    prompt,
    seed: Math.floor(Math.random() * 2_147_483_647),
    steps: 16,
    width: 1024,
    height: 1024,
    flow_shift: 3,
  };

  if (referenceUrl) {
    input.image1 = referenceUrl;
  }

  const res = await fetch(`${API_BASE}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "Qubico/qwen-image",
      task_type: taskType,
      input,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Qwen submit failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as SubmitResponse;
  const taskId = data.data?.task_id;
  if (!taskId) {
    throw new Error(
      `Qwen submit response missing task_id: ${JSON.stringify(data)}`,
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
    throw new Error(`Qwen poll failed (${res.status}): ${body}`);
  }

  return (await res.json()) as TaskResponse;
}

// ── Status helpers ────────────────────────────────────────────────────────────

function isCompleted(status?: string): boolean {
  return status?.toLowerCase() === "completed";
}

function isFailed(status?: string): boolean {
  const s = status?.toLowerCase();
  return s === "failed" || s === "error";
}

// ── Adapter ──────────────────────────────────────────────────────────────────

export class QwenAdapter {
  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<string | null> {
    const prompt = buildQwenPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );

    console.log("[Qwen] Submitting character generation:", prompt);
    if (request.referenceUrl)
      console.log("[Qwen] With reference image (image-edit):", request.referenceUrl);
    const taskId = await submitTask(prompt, request.referenceUrl);
    console.log("[Qwen] Task submitted:", taskId);

    const result = await pollUntilDone<TaskResponse>(
      {
        check: async () => {
          const data = await checkTask(taskId);
          const status = data.data?.status;

          if (isCompleted(status)) return data;
          if (isFailed(status)) {
            throw new PollFailedError(
              data.data?.error?.message || "Qwen generation failed",
            );
          }
          return null;
        },
        onPending: () => console.log("[Qwen] Still generating..."),
      },
      { initialDelay: 5000, interval: 5000, timeout: 180_000 },
    );

    const imageUrl = extractImageUrl(result.data);
    if (!imageUrl) {
      console.error(
        "[Qwen] No image in response:",
        JSON.stringify(result, null, 2),
      );
      return null;
    }

    console.log("[Qwen] Generation complete");
    return imageUrl;
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = `based on image1, ${buildImageEditExpressionPrompt(request.expression)}`;

    console.log(`[Qwen] Generating ${request.expression} expression (image-edit):`, prompt);
    const taskId = await submitTask(prompt, request.baseImageUrl);
    console.log("[Qwen] Expression task submitted:", taskId);

    try {
      const result = await pollUntilDone<TaskResponse>(
        {
          check: async () => {
            const data = await checkTask(taskId);
            const status = data.data?.status;

            if (isCompleted(status)) return data;
            if (isFailed(status)) {
              throw new PollFailedError(
                data.data?.error?.message || "Qwen expression generation failed",
              );
            }
            return null;
          },
          onPending: () =>
            console.log(`[Qwen] Still generating ${request.expression}...`),
        },
        { initialDelay: 5000, interval: 5000, timeout: 180_000 },
      );

      const imageUrl = extractImageUrl(result.data);
      if (!imageUrl) {
        return {
          status: "failed",
          imageUrl: null,
          error: "No image URL in Qwen response",
        };
      }

      console.log(`[Qwen] Expression ${request.expression} complete`);
      return { status: "completed", imageUrl };
    } catch (error) {
      return {
        status: "failed",
        imageUrl: null,
        error: error instanceof Error ? error.message : "Qwen expression failed",
      };
    }
  }
}
