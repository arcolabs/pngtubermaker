/**
 * BytePlus ModelArk (ARK) direct client - synchronous image generation.
 *
 * Seedream 5.0 Lite is served by ARK as a SYNCHRONOUS endpoint: the POST
 * response carries the generated image URL directly, no task id, no polling.
 *   POST {ARK_BASE_URL}/api/v3/images/generations
 *   Auth: Authorization: Bearer <ARK_API_KEY>
 *   body: { model: <endpointId>, prompt, size, response_format: "url",
 *           watermark: false, sequential_image_generation: "disabled",
 *           image?: <url | url[]> }   <- image present = image-edit mode
 *   resp: { data: [{ url }], error?: { code, message } }
 *
 * The same endpoint serves text-to-image (no `image`) and image-edit (with
 * `image`); the mode is distinguished by whether `image` is present.
 *
 * seedream-5.0-lite does NOT support a `seed` parameter - none is sent. To
 * vary candidates we vary the prompt instead.
 *
 * pngtuber sits behind Cloudflare's 100s origin wall, so the single upstream
 * fetch is capped at UPSTREAM_TIMEOUT_MS (85s) - comfortably under the wall.
 */

/** Ceiling for the single synchronous upstream fetch. */
export const UPSTREAM_TIMEOUT_MS = 85_000;

export const ARK_BASE_URL =
  process.env.ARK_BASE_URL || "https://ark.ap-southeast.bytepluses.com";

export function getArkApiKey(): string {
  const key = process.env.ARK_API_KEY;
  if (!key) throw new Error("ARK_API_KEY environment variable not set");
  return key;
}

export function getSeedreamLiteEndpoint(): string {
  const ep = process.env.ARK_SEEDREAM_LITE_ENDPOINT;
  if (!ep)
    throw new Error("ARK_SEEDREAM_LITE_ENDPOINT environment variable not set");
  return ep;
}

export interface BytePlusImageOptions {
  prompt: string;
  /** Output size; lite accepts 2K/3K. Default "2K". */
  size?: string;
  /**
   * Reference image for image-edit mode. A single URL string or an array of
   * URLs. Omit for text-to-image.
   */
  image?: string | string[];
  /** Endpoint id (model). Defaults to ARK_SEEDREAM_LITE_ENDPOINT. */
  endpointId?: string;
}

interface ArkImageData {
  url?: string;
  b64_json?: string;
  error?: { code?: string; message?: string };
}

interface ArkImageResponse {
  data?: ArkImageData[];
  error?: { code?: string; message?: string };
}

/**
 * Run a synchronous Seedream Lite generation and return the first image URL.
 *
 * Returns null only when the API succeeded but carried no image URL (e.g. an
 * empty data array without an error). Throws on HTTP failure, network error,
 * timeout, or an explicit API error envelope.
 */
export async function generateImageSync(
  opts: BytePlusImageOptions,
  label = "byteplus",
): Promise<string | null> {
  const endpointId = opts.endpointId ?? getSeedreamLiteEndpoint();

  const body: Record<string, unknown> = {
    model: endpointId,
    prompt: opts.prompt,
    size: opts.size ?? "2K",
    response_format: "url",
    watermark: false,
    sequential_image_generation: "disabled",
  };
  if (opts.image !== undefined) {
    body.image = opts.image;
  }

  const start = Date.now();
  const res = await fetch(`${ARK_BASE_URL}/api/v3/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getArkApiKey()}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `BytePlus ${label} failed (${res.status}): ${text.slice(0, 500)}`,
    );
  }

  const json = (await res.json()) as ArkImageResponse;

  if (json.error) {
    throw new Error(
      `BytePlus ${label} error: ${json.error.message ?? JSON.stringify(json.error).slice(0, 300)}`,
    );
  }

  const first = json.data?.[0];
  const url = first?.url || first?.b64_json;
  if (!url) {
    console.error(
      `[BytePlus] ${label}: no image url in response`,
      JSON.stringify(json).slice(0, 300),
    );
    return null;
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[BytePlus] ${label} complete: elapsed=${elapsed}s`);
  return url;
}
