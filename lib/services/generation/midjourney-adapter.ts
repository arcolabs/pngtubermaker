/**
 * Midjourney Niji 7 adapter for character generation via legnext.ai.
 *
 * API flow: submit job → poll until done → extract 4 candidate image URLs.
 * Auth: x-api-key header with MIDJOURNEY_API_KEY env var.
 */

import { PollFailedError, pollUntilDone } from "./poll";
import type {
  ArtStyle,
  GenerateCharacterRequest,
  GenerateCharacterResult,
} from "./types";

const API_BASE = "https://api.legnext.ai/api/v1";

/**
 * Style hints — brief, distinctive keywords only.
 * V7 understands style names natively; we just nudge the aesthetic direction.
 */
const STYLE_HINTS: Record<ArtStyle, string> = {
  anime: "anime character illustration,",
  vtuber: "modern VTuber character, hololive aesthetic,",
  chibi: "chibi character, large head small body,",
  "retro-90s": "90s retro anime character, vintage cel animation,",
  cartoon: "cartoon character illustration, western animation style,",
  none: "",
};

function getApiKey(): string {
  const key = process.env.MIDJOURNEY_API_KEY;
  if (!key) throw new Error("MIDJOURNEY_API_KEY environment variable not set");
  return key;
}

/**
 * Build the final Midjourney prompt.
 *
 * Structure (concise, V7 best practices):
 *   [image_url?] [style hint] [user description], solo, half body portrait,
 *   looking at viewer, white background [--sref?] [--oref?] --no text watermark --v 7
 *
 * Principles:
 * - Front-load the subject (style + user prompt come first)
 * - Minimal framing: "solo, half body portrait, looking at viewer, white background"
 *   is enough — V7 infers composition, expression, and quality on its own
 * - No junk words (4K, detailed, etc.) — V7 defaults are already high quality
 * - Lean --no: only exclude what actually appears unwanted (text, watermarks)
 */
function buildCharacterPrompt(
  prompt: string,
  style: ArtStyle,
  referenceUrl?: string | null,
): string {
  const hint = STYLE_HINTS[style];

  // Image prompt — prepended before text prompt
  const imagePrefix = referenceUrl ? `${referenceUrl} ` : "";

  return `${imagePrefix}${hint} ${prompt}, solo, half body portrait, looking at viewer, white background --v 7`;
}

interface SubmitResponse {
  job_id: string;
  [key: string]: unknown;
}

interface PollResponse {
  status: string;
  output?: {
    image_url?: string;
    image_urls?: string[];
    seed?: string;
    [key: string]: unknown;
  };
  error?: { code: number; message: string } | string;
  [key: string]: unknown;
}

async function submitJob(text: string): Promise<string> {
  const apiKey = getApiKey();

  const res = await fetch(`${API_BASE}/diffusion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midjourney submit failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as SubmitResponse;
  if (!data.job_id) {
    throw new Error("Midjourney submit response missing job_id");
  }

  return data.job_id;
}

async function checkJob(jobId: string): Promise<PollResponse> {
  const apiKey = getApiKey();

  const res = await fetch(`${API_BASE}/job/${jobId}`, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midjourney poll failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as PollResponse;
  console.log(
    `[Midjourney] Poll response: status=${data.status}, keys=${Object.keys(data).join(",")}`,
  );
  return data;
}

export class MidjourneyAdapter {
  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    const prompt = buildCharacterPrompt(
      request.prompt,
      request.style,
      request.referenceUrl,
    );

    console.log("[Midjourney] Submitting character generation:", prompt);
    const jobId = await submitJob(prompt);
    console.log("[Midjourney] Job submitted:", jobId);

    const result = await pollUntilDone<PollResponse>(
      {
        check: async () => {
          const data = await checkJob(jobId);

          if (data.status === "completed" || data.status === "done") {
            return data;
          }
          if (data.status === "failed" || data.status === "error") {
            const errMsg =
              typeof data.error === "string"
                ? data.error
                : data.error?.message || "Midjourney generation failed";
            throw new PollFailedError(errMsg);
          }
          // Still processing
          return null;
        },
        onPending: () => console.log("[Midjourney] Still generating..."),
      },
      { initialDelay: 8000, interval: 5000, timeout: 180_000 },
    );

    const images = result.output?.image_urls;
    if (!images || images.length === 0) {
      console.error(
        "[Midjourney] No images in response. Full result:",
        JSON.stringify(result, null, 2),
      );
      return {
        status: "failed",
        images: [],
        error: "No images returned from Midjourney",
      };
    }

    console.log(`[Midjourney] Generation complete: ${images.length} images`);

    return {
      status: "completed",
      images: images.slice(0, 4),
    };
  }
}
