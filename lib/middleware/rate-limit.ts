import { LRUCache } from "lru-cache";

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Optional key prefix for different rate limits */
  keyPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

/**
 * Rate limiter using sliding window algorithm with LRU cache
 */
export class RateLimiter {
  private cache: LRUCache<string, number[]>;
  private windowMs: number;
  private maxRequests: number;
  private keyPrefix: string;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
    this.keyPrefix = config.keyPrefix || "rl";

    this.cache = new LRUCache<string, number[]>({
      max: 500,
      ttl: config.windowMs,
    });
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (userId, IP, etc.)
   * @returns RateLimitResult with success status and remaining quota
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const key = `${this.keyPrefix}:${identifier}`;

    // Get existing timestamps and filter out expired ones
    const timestamps = this.cache.get(key) || [];
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    // Check if limit exceeded
    if (validTimestamps.length >= this.maxRequests) {
      const resetTime = validTimestamps[0] + this.windowMs;
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: Math.ceil(resetTime / 1000),
      };
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.cache.set(key, validTimestamps);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - validTimestamps.length,
      reset: Math.ceil((now + this.windowMs) / 1000),
    };
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier - Unique identifier
   */
  reset(identifier: string): void {
    const key = `${this.keyPrefix}:${identifier}`;
    this.cache.delete(key);
  }
}

// ============================================================================
// Pre-configured rate limiters for different endpoints
// ============================================================================

/**
 * Avatar generation: 3 requests per minute
 * High cost operation - strict limit
 */
export const avatarGenerationLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3,
  keyPrefix: "avatar_gen",
});

/**
 * Expression pack generation: 5 requests per minute
 */
export const expressionPackLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  keyPrefix: "expr_pack",
});

/**
 * Expression regeneration: 10 requests per minute
 */
export const expressionRegenerateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: "expr_regen",
});

/**
 * Image upload: 10 requests per minute
 */
export const uploadLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: "upload",
});

/**
 * General API: 60 requests per minute
 */
export const generalApiLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyPrefix: "api",
});

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Get rate limit identifier from request
 * Priority: authenticated user ID > forwarded IP > direct IP
 */
export function getRateLimitIdentifier(req: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from headers (works with reverse proxies)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP if multiple are present
    return `ip:${forwarded.split(",")[0].trim()}`;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return `ip:${realIp}`;
  }

  // Fallback to unknown
  return "ip:unknown";
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}
