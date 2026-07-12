/**
 * Qwen Image adapter for character generation via direct PiAPI.
 *
 * API flow: submit task -> poll until done -> extract 1 character image URL.
 * Auth: X-API-Key header with PIAPI_KEY env var.
 *
 * Supports two task types:
 * - txt2img: text-only generation
 * - image-edit: generation with a reference image (image1)
 */

import {
  checkTask,
  extractImageUrl,
  isCompleted,
  isFailed,
  type PiApiResponse,
  submitTask,
} from "./piapi-client";
import { PollFailedError, pollUntilDone } from "./poll";
import { buildImageEditExpressionPrompt } from "./prompt-builder";
import {
  buildCharacterPrompt,
  type GenerateCharacterRequest,
  type GenerateExpressionRequest,
  type GenerateExpressionResult,
  type ProviderImage,
} from "./types";

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

// ── API calls ────────────────────────────────────────────────────────────────

async function submitQwenTask(
  prompt: string,
  referenceUrl?: string | null,
): Promise<string> {
  const taskType = referenceUrl ? "image-edit" : "txt2img";
  console.log(
    `[Qwen] task_type=${taskType}, referenceUrl=${referenceUrl ?? "none"}`,
  );

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

  const data = await submitTask({
    model: "Qubico/qwen-image",
    task_type: taskType,
    input,
  });

  const taskId = data.task_id;
  if (!taskId) {
    throw new Error(
      `Qwen submit response missing task_id: ${JSON.stringify(data)}`,
    );
  }
  return taskId;
}

// ── Adapter ──────────────────────────────────────────────────────────────────

export class QwenAdapter {
  async generateCharacterImage(
    request: GenerateCharacterRequest,
  ): Promise<ProviderImage | null> {
    const prompt = buildQwenPrompt(
      request.prompt,
      request.style,
      !!request.referenceUrl,
    );

    console.log("[Qwen] Submitting character generation:", prompt);
    if (request.referenceUrl) {
      console.log(
        "[Qwen] With reference image (image-edit):",
        request.referenceUrl,
      );
    }
    const taskId = await submitQwenTask(prompt, request.referenceUrl);
    console.log("[Qwen] Task submitted:", taskId);

    const result = await pollUntilDone<PiApiResponse>(
      {
        check: async () => {
          const data = await checkTask(taskId);
          const status = data.data?.status;

          if (isCompleted(status)) return data;
          if (isFailed(status)) {
            const errMsg =
              data.data?.error?.message || "Qwen generation failed";
            console.error(
              `[Qwen] Character generation failed: taskId=${taskId} error=${errMsg}`,
            );
            throw new PollFailedError(errMsg);
          }
          return null;
        },
        onPending: () => console.log("[Qwen] Still generating..."),
      },
      { initialDelay: 5000, interval: 5000, timeout: 85_000 },
      `Qwen:character:${taskId.slice(0, 8)}`,
    );

    const imageUrl = extractImageUrl(result.data);
    if (!imageUrl) {
      console.error(
        `[Qwen] No image in response: taskId=${taskId}`,
        JSON.stringify(result, null, 2),
      );
      return null;
    }

    console.log(`[Qwen] Generation complete: taskId=${taskId}`);
    return { url: imageUrl, provider: "qwen" };
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const prompt = `based on image1, ${buildImageEditExpressionPrompt(request.expression)}`;

    console.log(
      `[Qwen] Generating ${request.expression} expression (image-edit):`,
      prompt,
    );

    // Retry submit on transient timeouts (submitTask has no internal retry)
    let taskId: string;
    try {
      taskId = await submitQwenTask(prompt, request.baseImageUrl);
    } catch (e) {
      console.warn(
        `[Qwen] Expression ${request.expression} submit failed, retrying:`,
        e instanceof Error ? e.message : e,
      );
      try {
        taskId = await submitQwenTask(prompt, request.baseImageUrl);
      } catch (retryError) {
        console.error(
          `[Qwen] Expression ${request.expression} submit retry failed:`,
          retryError instanceof Error ? retryError.message : retryError,
        );
        return {
          status: "failed",
          imageUrl: null,
          error:
            retryError instanceof Error
              ? retryError.message
              : "Qwen expression submit failed after retry",
        };
      }
    }
    console.log("[Qwen] Expression task submitted:", taskId);

    try {
      const result = await pollUntilDone<PiApiResponse>(
        {
          check: async () => {
            const data = await checkTask(taskId);
            const status = data.data?.status;

            if (isCompleted(status)) return data;
            if (isFailed(status)) {
              const errMsg =
                data.data?.error?.message ||
                "Qwen expression generation failed";
              console.error(
                `[Qwen] Expression ${request.expression} failed: taskId=${taskId} error=${errMsg}`,
              );
              throw new PollFailedError(errMsg);
            }
            return null;
          },
          onPending: () =>
            console.log(`[Qwen] Still generating ${request.expression}...`),
        },
        { initialDelay: 5000, interval: 5000, timeout: 85_000 },
        `Qwen:${request.expression}:${taskId.slice(0, 8)}`,
      );

      const imageUrl = extractImageUrl(result.data);
      if (!imageUrl) {
        console.error(
          `[Qwen] No image in expression response: taskId=${taskId} type=${request.expression}`,
        );
        return {
          status: "failed",
          imageUrl: null,
          error: "No image URL in Qwen response",
        };
      }

      console.log(
        `[Qwen] Expression ${request.expression} complete: taskId=${taskId}`,
      );
      return { status: "completed", imageUrl, provider: "qwen" };
    } catch (error) {
      console.error(
        `[Qwen] Expression ${request.expression} error: taskId=${taskId}`,
        error instanceof Error ? error.message : error,
      );
      return {
        status: "failed",
        imageUrl: null,
        error:
          error instanceof Error ? error.message : "Qwen expression failed",
      };
    }
  }
}
