import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standardized API Error classes
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends APIError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends APIError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends APIError {
  constructor(
    message = "Validation failed",
    details?: Record<string, unknown>,
  ) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class InsufficientCreditsError extends APIError {
  constructor(balance: number, required: number) {
    super(
      `Insufficient credits. Balance: ${balance}, Required: ${required}`,
      402,
      "INSUFFICIENT_CREDITS",
      { balance, required },
    );
  }
}

export class RateLimitError extends APIError {
  constructor(resetTime: number) {
    super("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED", { resetTime });
  }
}

export class ConflictError extends APIError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}

/**
 * Global error handler for API routes
 * Converts all error types to standardized JSON responses
 */
export function handleAPIError(error: unknown): NextResponse {
  // Log error for monitoring
  console.error("[API Error]", {
    name: error instanceof Error ? error.name : "Unknown",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Handle known error types
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode },
    );
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      },
      { status: 400 },
    );
  }

  // Handle standard errors with status codes
  if (error instanceof Error) {
    // Check for common error messages
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }
    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message, code: "NOT_FOUND" },
        { status: 404 },
      );
    }
  }

  // Unknown error - don't expose details in production
  const isDev = process.env.NODE_ENV === "development";
  return NextResponse.json(
    {
      error: isDev
        ? error instanceof Error
          ? error.message
          : "Unknown error"
        : "Internal server error",
      code: "INTERNAL_ERROR",
      ...(isDev && error instanceof Error ? { stack: error.stack } : {}),
    },
    { status: 500 },
  );
}

/**
 * Wrapper for API route handlers to automatically handle errors
 * Usage:
 * export const POST = withErrorHandler(async (req) => {
 *   // Your handler code
 * });
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<NextResponse>,
) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

/**
 * Assert that a condition is true, otherwise throw an error
 */
export function assert(
  condition: boolean,
  message: string,
  statusCode = 400,
): asserts condition {
  if (!condition) {
    throw new APIError(message, statusCode, "ASSERTION_FAILED");
  }
}

/**
 * Assert that a value is not null/undefined
 */
export function assertExists<T>(
  value: T | null | undefined,
  message = "Resource not found",
): T {
  if (value == null) {
    throw new NotFoundError(message);
  }
  return value;
}
