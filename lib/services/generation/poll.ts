/**
 * Shared polling utility for submit-then-poll AI generation APIs.
 *
 * Transient network errors (ETIMEDOUT, fetch failures) are tolerated
 * up to maxRetries times before the polling loop gives up.
 * Only PollFailedError (explicit API failure) is thrown immediately.
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
  /** Max consecutive transient errors before giving up. Default: 3 */
  maxRetries?: number;
}

const DEFAULTS: Required<PollConfig> = {
  initialDelay: 5000,
  interval: 5000,
  timeout: 120_000,
  maxRetries: 3,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll an async operation until it completes or times out.
 * Transient errors (network issues) are retried; PollFailedError is thrown immediately.
 */
export async function pollUntilDone<T>(
  callbacks: PollCallbacks<T>,
  config?: PollConfig,
  /** Optional label for log messages (e.g. "Qwen:talking" ) */
  label?: string,
): Promise<T> {
  const { initialDelay, interval, timeout, maxRetries } = {
    ...DEFAULTS,
    ...config,
  };
  const tag = label ? `[poll:${label}]` : "[poll]";
  const startTime = Date.now();
  const deadline = startTime + timeout;
  let consecutiveErrors = 0;
  let pollCount = 0;

  await delay(initialDelay);

  while (Date.now() < deadline) {
    pollCount++;
    try {
      const result = await callbacks.check();
      consecutiveErrors = 0; // reset on success
      if (result !== null) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `${tag} Completed after ${pollCount} polls, ${elapsed}s total`,
        );
        return result;
      }
      callbacks.onPending?.();
    } catch (error) {
      // PollFailedError = explicit API failure, throw immediately
      if (error instanceof PollFailedError) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.error(
          `${tag} API failure after ${pollCount} polls, ${elapsed}s:`,
          error.message,
        );
        throw error;
      }

      // Transient error (network timeout, fetch failure, etc.)
      consecutiveErrors++;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.warn(
        `${tag} Transient error (${consecutiveErrors}/${maxRetries}) at ${elapsed}s, poll #${pollCount}:`,
        error instanceof Error ? error.message : error,
      );

      if (consecutiveErrors >= maxRetries) {
        console.error(
          `${tag} Giving up after ${consecutiveErrors} consecutive failures`,
        );
        throw error; // too many consecutive failures
      }
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await delay(Math.min(interval, remaining));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.error(
    `${tag} Timeout after ${pollCount} polls, ${elapsed}s (limit: ${timeout}ms)`,
  );
  throw new PollTimeoutError(timeout);
}
