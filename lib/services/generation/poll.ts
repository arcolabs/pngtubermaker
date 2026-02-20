/**
 * Shared polling utility for submit-then-poll AI generation APIs.
 * Used by both MidjourneyAdapter and NanoBananaAdapter.
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
): Promise<T> {
	const { initialDelay, interval, timeout, maxRetries } = {
		...DEFAULTS,
		...config,
	};
	const deadline = Date.now() + timeout;
	let consecutiveErrors = 0;

	await delay(initialDelay);

	while (Date.now() < deadline) {
		try {
			const result = await callbacks.check();
			consecutiveErrors = 0; // reset on success
			if (result !== null) return result;
			callbacks.onPending?.();
		} catch (error) {
			// PollFailedError = explicit API failure, throw immediately
			if (error instanceof PollFailedError) throw error;

			// Transient error (network timeout, fetch failure, etc.)
			consecutiveErrors++;
			console.warn(
				`[poll] Transient error (${consecutiveErrors}/${maxRetries}):`,
				error instanceof Error ? error.message : error,
			);

			if (consecutiveErrors >= maxRetries) {
				throw error; // too many consecutive failures
			}
		}

		const remaining = deadline - Date.now();
		if (remaining <= 0) break;
		await delay(Math.min(interval, remaining));
	}

	throw new PollTimeoutError(timeout);
}
