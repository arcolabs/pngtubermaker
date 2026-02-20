/**
 * Nano Banana Pro adapter for expression generation via piapi.ai.
 *
 * API flow: submit task → poll until done → extract 1 expression image URL.
 * Auth: X-API-Key header with PIAPI_API_KEY env var.
 *
 * Note: Nano Banana only accepts text prompts (no image input),
 * so we use prompt engineering via prompt-builder.ts to maintain
 * character consistency across expressions.
 */

import { PollFailedError, pollUntilDone } from "./poll";
import { buildExpressionPrompt } from "./prompt-builder";
import type {
  GenerateExpressionRequest,
  GenerateExpressionResult,
} from "./types";

const API_BASE = "https://api.piapi.ai/api/v1";

function getApiKey(): string {
  const key = process.env.PIAPI_API_KEY;
  if (!key) throw new Error("PIAPI_API_KEY environment variable not set");
  return key;
}

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

async function submitTask(prompt: string): Promise<string> {
  const apiKey = getApiKey();

  const res = await fetch(`${API_BASE}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "gemini",
      task_type: "nano-banana-pro",
      input: {
        prompt,
        output_format: "png",
        aspect_ratio: "1:1",
        resolution: "1K",
      },
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

export class NanoBananaAdapter {
  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    if (!request.prompt) {
      return {
        status: "failed",
        imageUrl: null,
        error:
          "Character prompt is required for expression generation (Nano Banana is text-only)",
      };
    }

    const prompt = buildExpressionPrompt(
      request.prompt,
      request.expression,
      request.style,
    );

    console.log(
      `[NanoBanana] Generating ${request.expression} expression:`,
      prompt,
    );
    const taskId = await submitTask(prompt);
    console.log("[NanoBanana] Task submitted:", taskId);

    const result = await pollUntilDone<TaskResponse>(
      {
        check: async () => {
          const data = await checkTask(taskId);
          const status = data.data?.status;

          if (status === "completed") return data;
          if (status === "failed" || status === "error") {
            throw new PollFailedError(
              data.data?.error?.message || "Nano Banana generation failed",
            );
          }
          // Still processing
          return null;
        },
        onPending: () =>
          console.log(`[NanoBanana] Still generating ${request.expression}...`),
      },
      { initialDelay: 5000, interval: 5000, timeout: 120_000 },
    );

    const imageUrl = result.data?.output?.image_url;
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
