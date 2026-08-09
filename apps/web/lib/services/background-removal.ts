/**
 * Async background removal via direct PiAPI (Qubico/image-toolkit).
 *
 * Uses the same submit->poll pattern as other PiAPI adapters.
 * Designed to run as a fire-and-forget task via Next.js `after()`,
 * so failures are logged but never thrown to the caller.
 *
 * Processed images are uploaded to a NEW R2 key (with `_nobg` suffix)
 * to avoid CDN cache serving stale originals. The caller provides an
 * `onComplete` callback to update DB records with the new URLs/keys.
 *
 * Original R2 files are NOT deleted - they are kept as AI generation input
 * because external AI APIs may timeout downloading _nobg images.
 */

import {
  checkTask,
  isCompleted,
  isFailed,
  type PiApiResponse,
  submitTask,
} from "./generation/piapi-client";
import { PollFailedError, pollUntilDone } from "./generation/poll";
import { generateThumbnail, uploadImageToR2 } from "./storage";

async function submitRemoveBackground(imageUrl: string): Promise<string> {
  const data = await submitTask({
    model: "Qubico/image-toolkit",
    task_type: "background-remove",
    input: {
      rmbg_model: "RMBG-2.0",
      image: imageUrl,
    },
  });

  const taskId = data.task_id;
  if (!taskId) {
    throw new Error(
      `Remove background response missing task_id: ${JSON.stringify(data)}`,
    );
  }

  return taskId;
}

/**
 * Remove background from an image URL.
 * Returns the processed image as a Buffer.
 */
export async function removeBackground(imageUrl: string): Promise<Buffer> {
  const taskId = await submitRemoveBackground(imageUrl);
  console.log("[BackgroundRemoval] Task submitted:", taskId);

  const result = await pollUntilDone<PiApiResponse>(
    {
      check: async () => {
        const resp = await checkTask(taskId);
        const status = resp.data?.status;

        if (isCompleted(status)) return resp;
        if (isFailed(status)) {
          throw new PollFailedError(
            resp.data?.error?.message || "Background removal failed",
          );
        }
        return null;
      },
      onPending: () => console.log("[BackgroundRemoval] Still processing..."),
    },
    { initialDelay: 3000, interval: 3000, timeout: 60_000 },
    `BgRemoval:${taskId.slice(0, 8)}`,
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
 * Designed to be called inside `after()` - never throws.
 */
export async function processBackgroundRemoval(
  sourceImageUrl: string,
  r2Key: string,
  options?: {
    thumbnailR2Key?: string;
    onComplete?: (result: BgRemovalResult) => Promise<void>;
  },
): Promise<void> {
  const MAX_RETRIES = 2;

  try {
    console.log(`[BackgroundRemoval] Starting for ${r2Key}`);

    let processedBuffer: Buffer | null = null;
    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        processedBuffer = await removeBackground(sourceImageUrl);
        break;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          const waitMs = 5000 * (attempt + 1);
          console.warn(
            `[BackgroundRemoval] Attempt ${attempt + 1} failed for ${r2Key}, retrying in ${waitMs / 1000}s:`,
            err instanceof Error ? err.message : err,
          );
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }
    }

    if (!processedBuffer) {
      throw lastError ?? new Error("Background removal failed after retries");
    }

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

    // Original R2 files are intentionally kept - they serve as AI generation
    // input (external APIs may timeout downloading _nobg images)

    console.log(`[BackgroundRemoval] Done for ${r2Key} -> ${newR2Key}`);
  } catch (error) {
    // Silent failure - original image stays in R2, user sees it with background
    console.warn(`[BackgroundRemoval] Failed for ${r2Key}:`, error);
  }
}

/**
 * Process multiple background removals with a concurrency limit.
 * Prevents overwhelming the API when processing expression packs.
 */
export async function processBackgroundRemovalBatch(
  tasks: {
    sourceImageUrl: string;
    r2Key: string;
    options?: {
      thumbnailR2Key?: string;
      onComplete?: (result: BgRemovalResult) => Promise<void>;
    };
  }[],
  concurrency = 3,
): Promise<void> {
  const queue = [...tasks];
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length > 0) {
        const task = queue.shift();
        if (!task) break;
        await processBackgroundRemoval(
          task.sourceImageUrl,
          task.r2Key,
          task.options,
        );
      }
    },
  );
  await Promise.all(workers);
}
