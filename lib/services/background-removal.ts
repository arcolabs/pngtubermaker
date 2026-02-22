/**
 * Async background removal via PiAPI (Qubico/image-toolkit).
 *
 * Uses the same submit→poll pattern as NanoBananaAdapter.
 * Designed to run as a fire-and-forget task via Next.js `after()`,
 * so failures are logged but never thrown to the caller.
 *
 * Processed images are uploaded to a NEW R2 key (with `_nobg` suffix)
 * to avoid CDN cache serving stale originals. The caller provides an
 * `onComplete` callback to update DB records with the new URLs/keys.
 */

import { PollFailedError, pollUntilDone } from "./generation/poll";
import { deleteFromR2, generateThumbnail, uploadImageToR2 } from "./storage";

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

/** Derive a `_nobg` R2 key from the original to avoid CDN cache hits. */
function toNoBgKey(key: string): string {
  return key.replace(/\.png$/, "_nobg.png");
}

export interface BgRemovalResult {
  imageUrl: string;
  imageR2Key: string;
  thumbnailUrl?: string;
  thumbnailR2Key?: string;
}

/**
 * Fire-and-forget: remove background, upload to a NEW R2 key (`_nobg`),
 * invoke the `onComplete` callback so the caller can update the DB,
 * then delete the old R2 files.
 *
 * Using a different key prevents Cloudflare CDN from serving the stale
 * (with-background) cached version.
 *
 * Designed to be called inside `after()` — never throws.
 */
export async function processBackgroundRemoval(
  sourceImageUrl: string,
  r2Key: string,
  options?: {
    thumbnailR2Key?: string;
    onComplete?: (result: BgRemovalResult) => Promise<void>;
  },
): Promise<void> {
  try {
    console.log(`[BackgroundRemoval] Starting for ${r2Key}`);
    const processedBuffer = await removeBackground(sourceImageUrl);

    // Upload to a NEW key with _nobg suffix
    const newR2Key = toNoBgKey(r2Key);
    const newImageUrl = await uploadImageToR2(
      processedBuffer,
      newR2Key,
      "image/png",
    );
    console.log(`[BackgroundRemoval] Uploaded ${newR2Key}`);

    let newThumbnailUrl: string | undefined;
    let newThumbnailR2Key: string | undefined;

    if (options?.thumbnailR2Key) {
      const thumbnailBuffer = await generateThumbnail(processedBuffer);
      newThumbnailR2Key = toNoBgKey(options.thumbnailR2Key);
      newThumbnailUrl = await uploadImageToR2(
        thumbnailBuffer,
        newThumbnailR2Key,
        "image/png",
      );
      console.log(
        `[BackgroundRemoval] Uploaded thumbnail ${newThumbnailR2Key}`,
      );
    }

    // Let the caller update DB records with the new URLs/keys
    if (options?.onComplete) {
      await options.onComplete({
        imageUrl: newImageUrl,
        imageR2Key: newR2Key,
        thumbnailUrl: newThumbnailUrl,
        thumbnailR2Key: newThumbnailR2Key,
      });
      console.log(`[BackgroundRemoval] DB updated for ${newR2Key}`);
    }

    // Clean up old R2 files (best-effort)
    await deleteFromR2(r2Key);
    if (options?.thumbnailR2Key) {
      await deleteFromR2(options.thumbnailR2Key);
    }

    console.log(`[BackgroundRemoval] Done for ${r2Key} → ${newR2Key}`);
  } catch (error) {
    // Silent failure — original image stays in R2, user sees it with background
    console.warn(`[BackgroundRemoval] Failed for ${r2Key}:`, error);
  }
}
