/**
 * Async background removal via PiAPI (Qubico/image-toolkit).
 *
 * Uses the same submit→poll pattern as NanoBananaAdapter.
 * Designed to run as a fire-and-forget task via Next.js `after()`,
 * so failures are logged but never thrown to the caller.
 */

import { PollFailedError, pollUntilDone } from "./generation/poll";
import { generateThumbnail, uploadImageToR2 } from "./storage";

const API_BASE = "https://api.piapi.ai/api/v1";

function getApiKey(): string {
  const key = process.env.PIAPI_API_KEY;
  if (!key) throw new Error("PIAPI_API_KEY environment variable not set");
  return key;
}

interface TaskResponse {
  data?: {
    task_id?: string;
    status?: string;
    output?: {
      image_url?: string;
    };
    error?: {
      message?: string;
    };
  };
}

async function submitRemoveBackground(imageUrl: string): Promise<string> {
  const res = await fetch(`${API_BASE}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
    },
    body: JSON.stringify({
      model: "Qubico/image-toolkit",
      task_type: "background-remove",
      input: {
        rmbg_model: "RMBG-2.0",
        image: imageUrl,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Remove background submit failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as TaskResponse;
  const taskId = data.data?.task_id;
  if (!taskId) {
    throw new Error(
      `Remove background response missing task_id: ${JSON.stringify(data)}`,
    );
  }

  return taskId;
}

async function checkTask(taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${API_BASE}/task/${taskId}`, {
    headers: { "X-API-Key": getApiKey() },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Remove background poll failed (${res.status}): ${body}`);
  }

  return (await res.json()) as TaskResponse;
}

/**
 * Remove background from an image URL.
 * Returns the processed image as a Buffer.
 */
export async function removeBackground(imageUrl: string): Promise<Buffer> {
  const taskId = await submitRemoveBackground(imageUrl);
  console.log("[BackgroundRemoval] Task submitted:", taskId);

  const result = await pollUntilDone<TaskResponse>(
    {
      check: async () => {
        const data = await checkTask(taskId);
        const status = data.data?.status;

        if (status === "completed") return data;
        if (status === "failed" || status === "error") {
          throw new PollFailedError(
            data.data?.error?.message || "Background removal failed",
          );
        }
        return null;
      },
      onPending: () => console.log("[BackgroundRemoval] Still processing..."),
    },
    { initialDelay: 3000, interval: 3000, timeout: 60_000 },
  );

  const resultUrl = result.data?.output?.image_url;
  if (!resultUrl) {
    throw new Error("No image_url in background removal result");
  }

  const imageRes = await fetch(resultUrl);
  if (!imageRes.ok) {
    throw new Error(`Failed to download processed image: ${imageRes.status}`);
  }

  return Buffer.from(await imageRes.arrayBuffer());
}

/**
 * Fire-and-forget: remove background and overwrite existing R2 image.
 * Optionally regenerates thumbnail from the processed image.
 *
 * Designed to be called inside `after()` — never throws.
 */
export async function processBackgroundRemoval(
  sourceImageUrl: string,
  r2Key: string,
  thumbnailR2Key?: string,
): Promise<void> {
  try {
    console.log(`[BackgroundRemoval] Starting for ${r2Key}`);
    const processedBuffer = await removeBackground(sourceImageUrl);

    await uploadImageToR2(processedBuffer, r2Key, "image/png");
    console.log(`[BackgroundRemoval] Replaced ${r2Key}`);

    if (thumbnailR2Key) {
      const thumbnailBuffer = await generateThumbnail(processedBuffer);
      await uploadImageToR2(thumbnailBuffer, thumbnailR2Key, "image/png");
      console.log(`[BackgroundRemoval] Replaced thumbnail ${thumbnailR2Key}`);
    }

    console.log(`[BackgroundRemoval] Done for ${r2Key}`);
  } catch (error) {
    // Silent failure — original image stays in R2, user never notices
    console.warn(`[BackgroundRemoval] Failed for ${r2Key}:`, error);
  }
}
