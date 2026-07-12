/**
 * Shared PiAPI direct client (no relay).
 *
 * PiAPI task protocol:
 *   submit: POST {PIAPI_BASE_URL}/api/v1/task          header: X-API-Key
 *   poll:   GET  {PIAPI_BASE_URL}/api/v1/task/{task_id} header: X-API-Key
 *   envelope: { code, data: { task_id, status, output: { image_url | image_urls[] },
 *                             error: { code, message } } }
 *   status (lowercase): pending | processing | completed | failed
 *
 * pngtuber sits behind Cloudflare's 100s origin wall, so every individual
 * upstream fetch is capped at UPSTREAM_TIMEOUT_MS (85s) - no single
 * connection outlives the wall. Aggregate poll budgets are set per-adapter
 * and also kept within the wall.
 */

import { PollFailedError, pollUntilDone } from "./poll";

export const PIAPI_BASE_URL =
  process.env.PIAPI_BASE_URL || "https://api.piapi.ai";

/**
 * Ceiling for a single upstream fetch. Comfortably under Cloudflare's 100s
 * origin wall so a slow submit/poll never leaves a connection hanging after
 * the edge has already returned 524 to the client.
 */
export const UPSTREAM_TIMEOUT_MS = 85_000;

export function getPiApiKey(): string {
  const key = process.env.PIAPI_KEY;
  if (!key) throw new Error("PIAPI_KEY environment variable not set");
  return key;
}

// ── Envelope types ───────────────────────────────────────────────────────────

export interface PiApiOutput {
  image_url?: string;
  image_urls?: string[];
  [key: string]: unknown;
}

export interface PiApiTaskData {
  task_id?: string;
  status?: string;
  output?: PiApiOutput;
  error?: { code?: string | number; message?: string };
  [key: string]: unknown;
}

export interface PiApiResponse {
  code?: number;
  message?: string;
  data?: PiApiTaskData;
}

export function extractImageUrl(data?: PiApiTaskData): string | undefined {
  return data?.output?.image_url || data?.output?.image_urls?.[0];
}

export function isCompleted(status?: string): boolean {
  return status?.toLowerCase() === "completed";
}

export function isFailed(status?: string): boolean {
  const s = status?.toLowerCase();
  return s === "failed" || s === "error";
}

// ── HTTP ─────────────────────────────────────────────────────────────────────

export async function submitTask(body: unknown): Promise<PiApiTaskData> {
  const res = await fetch(`${PIAPI_BASE_URL}/api/v1/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getPiApiKey(),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `PiAPI submit failed (${res.status}): ${text.slice(0, 500)}`,
    );
  }

  const json = (await res.json()) as PiApiResponse;
  if (!json.data) {
    throw new Error(
      `PiAPI submit: no data in response (code=${json.code}): ${JSON.stringify(json).slice(0, 300)}`,
    );
  }
  return json.data;
}

export async function checkTask(taskId: string): Promise<PiApiResponse> {
  const res = await fetch(`${PIAPI_BASE_URL}/api/v1/task/${taskId}`, {
    headers: { "X-API-Key": getPiApiKey() },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PiAPI poll failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return (await res.json()) as PiApiResponse;
}

export interface SubmitAndResolveOptions {
  label: string;
  /** Aggregate poll budget (ms). Default 85_000 (wall-safe). */
  pollTimeoutMs?: number;
  initialDelay?: number;
  interval?: number;
}

/**
 * Submit a task and resolve to an image URL.
 *
 * Fast path: if the submit response already carries a completed output, use
 * it (some models deliver synchronously). Otherwise poll GET /api/v1/task/:id
 * until done.
 *
 * Returns null only when the task completed but carried no image URL.
 * Throws on submit failure, explicit API failure, or poll timeout.
 */
export async function submitAndResolve(
  body: unknown,
  opts: SubmitAndResolveOptions,
): Promise<string | null> {
  const {
    label,
    pollTimeoutMs = 85_000,
    initialDelay = 3000,
    interval = 3000,
  } = opts;

  const start = Date.now();
  const data = await submitTask(body);

  // Sync delivery: output already present in the submit response.
  const syncUrl = extractImageUrl(data);
  if (syncUrl && isCompleted(data.status)) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[PiAPI] ${label} complete (sync): elapsed=${elapsed}s`);
    return syncUrl;
  }
  if (isFailed(data.status)) {
    throw new Error(
      `PiAPI ${label} failed: ${data.error?.message ?? "unknown error"}`,
    );
  }

  const taskId = data.task_id;
  if (!taskId) {
    console.error(
      `[PiAPI] ${label}: no output and no task_id`,
      JSON.stringify(data).slice(0, 300),
    );
    return null;
  }

  console.log(`[PiAPI] ${label}: polling task ${taskId}`);
  const result = await pollUntilDone<PiApiResponse>(
    {
      check: async () => {
        const resp = await checkTask(taskId);
        const status = resp.data?.status;
        if (isCompleted(status)) return resp;
        if (isFailed(status)) {
          throw new PollFailedError(
            resp.data?.error?.message || `PiAPI ${label} failed`,
          );
        }
        return null;
      },
      onPending: () => console.log(`[PiAPI] ${label}: still generating...`),
    },
    { initialDelay, interval, timeout: pollTimeoutMs },
    `PiAPI:${label}:${taskId.slice(0, 8)}`,
  );

  const imageUrl = extractImageUrl(result.data);
  if (!imageUrl) {
    console.error(
      `[PiAPI] ${label}: no image in completed task ${taskId}`,
      JSON.stringify(result).slice(0, 300),
    );
    return null;
  }
  return imageUrl;
}
