/**
 * Perceptual-hash gate for image-edit results.
 *
 * Defends against the "HTTP 200 but garbage" upstream failure mode where an
 * edit endpoint silently degrades to text-to-image and returns an image
 * unrelated to the reference (incident: 2026-06-09, Zeakai pool produced
 * photoreal people for an anime avatar — every response was a success).
 *
 * dHash (64-bit difference hash) distances calibrated on that incident's
 * real images against the same base:
 *   - faithful expression edits:  1-6
 *   - unrelated garbage images:   22-34
 */

import sharp from "sharp";

const HAMMING_THRESHOLD = 14;

// A pack generates 2-3 expressions against the same base image — memoize
// recent hashes so the base isn't re-downloaded per expression.
const hashCache = new Map<string, Promise<Uint8Array>>();
const HASH_CACHE_MAX = 32;

function dhashFromUrlCached(url: string): Promise<Uint8Array> {
  const cached = hashCache.get(url);
  if (cached) return cached;
  const promise = dhashFromUrl(url).catch((e) => {
    hashCache.delete(url); // don't cache failures
    throw e;
  });
  hashCache.set(url, promise);
  if (hashCache.size > HASH_CACHE_MAX) {
    const oldest = hashCache.keys().next().value;
    if (oldest !== undefined) hashCache.delete(oldest);
  }
  return promise;
}

async function dhashFromUrl(url: string): Promise<Uint8Array> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`fetch ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const pixels = await sharp(buf)
    .flatten({ background: "#ffffff" })
    .grayscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer();

  const bits = new Uint8Array(64);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = pixels[row * 9 + col] ?? 0;
      const right = pixels[row * 9 + col + 1] ?? 0;
      bits[row * 8 + col] = left > right ? 1 : 0;
    }
  }
  return bits;
}

function hammingDistance(a: Uint8Array, b: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < 64; i++) {
    if (a[i] !== b[i]) n++;
  }
  return n;
}

/**
 * Check whether an edit result plausibly derives from the base image.
 * Fails OPEN: any error computing the hashes accepts the result —
 * availability beats strictness for a soft quality gate.
 */
export async function resemblesBase(
  baseImageUrl: string,
  resultImageUrl: string,
  label = "",
): Promise<boolean> {
  try {
    const [baseHash, resultHash] = await Promise.all([
      dhashFromUrlCached(baseImageUrl),
      dhashFromUrl(resultImageUrl),
    ]);
    const distance = hammingDistance(baseHash, resultHash);
    if (distance > HAMMING_THRESHOLD) {
      console.warn(
        `[Similarity] ${label} REJECTED: distance=${distance} > ${HAMMING_THRESHOLD} (result unrelated to base)`,
      );
      return false;
    }
    return true;
  } catch (e) {
    console.warn(
      `[Similarity] ${label} check failed, accepting result:`,
      e instanceof Error ? e.message : e,
    );
    return true;
  }
}
