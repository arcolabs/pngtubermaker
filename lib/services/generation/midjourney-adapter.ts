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

/** Style-specific prompt prefixes */
const STYLE_PREFIXES: Record<ArtStyle, string> = {
  anime: "anime style character portrait, detailed anime art,",
  "modern-vtuber": "modern vtuber style, clean digital art,",
  chibi: "chibi style character, cute kawaii proportions, large head,",
  "retro-90s": "90s retro anime style, vintage anime art,",
  "kawaii-moe": "kawaii moe style, cute adorable character,",
  "cyber-anime": "cyber anime style, futuristic digital art,",
  "fantasy-anime": "fantasy anime style, magical character art,",
  "shonen-style": "shonen anime style, dynamic action pose,",
};

/** Standard PNGTuber framing appended to every prompt */
const PNGTUBER_FRAME =
  "PNGTuber avatar, single character, bust shot, transparent background, clean lines, vibrant colors";

function getApiKey(): string {
  const key = process.env.MIDJOURNEY_API_KEY;
  if (!key) throw new Error("MIDJOURNEY_API_KEY environment variable not set");
  return key;
}

function buildCharacterPrompt(prompt: string, style: ArtStyle): string {
  const prefix = STYLE_PREFIXES[style];
  return `${prefix} ${prompt}, ${PNGTUBER_FRAME} --niji 7`;
}

interface SubmitResponse {
  job_id: string;
  [key: string]: unknown;
}

interface PollResponse {
  status: string;
  result?: {
    images?: string[];
    [key: string]: unknown;
  };
  error?: string;
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
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midjourney poll failed (${res.status}): ${body}`);
  }

  return (await res.json()) as PollResponse;
}

export class MidjourneyAdapter {
  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    const prompt = buildCharacterPrompt(request.prompt, request.style);

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
            throw new PollFailedError(
              data.error || "Midjourney generation failed",
            );
          }
          // Still processing
          return null;
        },
        onPending: () => console.log("[Midjourney] Still generating..."),
      },
      { initialDelay: 8000, interval: 5000, timeout: 180_000 },
    );

    const images = result.result?.images;
    if (!images || images.length === 0) {
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
