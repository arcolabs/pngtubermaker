/**
 * Shared polling utility for submit-then-poll AI generation APIs.
 * Used by both MidjourneyAdapter and NanoBananaAdapter.
 */

export class PollTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Polling timed out after ${timeoutMs}ms`);
    this.name = "PollTimeoutError";
  }
}

export class PollFailedError extends Error {
  constructor(reason: string) {
    super(`Polling failed: ${reason}`);
    this.name = "PollFailedError";
  }
}

export interface PollCallbacks<T> {
  /** Check current status; return result if done, null if still pending */
  check: () => Promise<T | null>;
  /** Optional: called when a check returns null (still pending) */
  onPending?: () => void;
}

export interface PollConfig {
  /** Delay before first check (ms). Default: 5000 */
  initialDelay?: number;
  /** Interval between checks (ms). Default: 5000 */
  interval?: number;
  /** Maximum total wait time (ms). Default: 120000 */
  timeout?: number;
}

const DEFAULTS: Required<PollConfig> = {
  initialDelay: 5000,
  interval: 5000,
  timeout: 120_000,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll an async operation until it completes or times out.
 *
 * @example
 * const result = await pollUntilDone({
 *   check: async () => {
 *     const res = await fetch(`/api/job/${id}`);
 *     const data = await res.json();
 *     if (data.status === "completed") return data;
 *     if (data.status === "failed") throw new PollFailedError(data.error);
 *     return null; // still pending
 *   },
 * });
 */
export async function pollUntilDone<T>(
  callbacks: PollCallbacks<T>,
  config?: PollConfig,
): Promise<T> {
  const { initialDelay, interval, timeout } = { ...DEFAULTS, ...config };
  const deadline = Date.now() + timeout;

  await delay(initialDelay);

  while (Date.now() < deadline) {
    const result = await callbacks.check();
    if (result !== null) return result;
    callbacks.onPending?.();

    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await delay(Math.min(interval, remaining));
  }

  throw new PollTimeoutError(timeout);
}
