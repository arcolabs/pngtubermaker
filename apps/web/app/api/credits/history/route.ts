import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { creditTransactions } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

/**
 * GET /api/credits/history?page=1&limit=20
 *
 * Get paginated credit transaction history for the current user.
 *
 * Auth: Required
 * Query: { page?: number, limit?: number }
 * Response: { transactions: CreditTransaction[], hasMore: boolean }
 */

// Validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse and validate query parameters
  const { searchParams } = new URL(req.url);
  const parseResult = querySchema.safeParse({
    page: searchParams.get("page") || undefined,
    limit: searchParams.get("limit") || undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parseResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { page, limit } = parseResult.data;

  // 3. Query database with pagination
  const db = getDatabase();
  const offset = (page - 1) * limit;

  const results = await db
    .select({
      id: creditTransactions.id,
      type: creditTransactions.type,
      amount: creditTransactions.amount,
      balanceAfter: creditTransactions.balanceAfter,
      description: creditTransactions.description,
      metadata: creditTransactions.metadata,
      createdAt: creditTransactions.createdAt,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, session.user.id))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit + 1) // Fetch one extra to determine hasMore
    .offset(offset);

  // 4. Determine if there are more results
  const hasMore = results.length > limit;
  const transactions = hasMore ? results.slice(0, limit) : results;

  // 5. Format response
  const formattedTransactions = transactions.map((tx) => ({
    ...tx,
    createdAt: tx.createdAt.toISOString(),
    metadata: tx.metadata || undefined,
  }));

  return NextResponse.json({
    transactions: formattedTransactions,
    hasMore,
    page,
    limit,
  });
}
