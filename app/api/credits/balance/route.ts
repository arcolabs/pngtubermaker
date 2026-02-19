import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBalance } from "@/lib/services/credits";

/**
 * GET /api/credits/balance
 *
 * Get the current user's credit balance.
 *
 * Auth: Required
 * Response: { total: number, subscription: number, purchased: number, subscriptionExpiresAt: string | null }
 */
export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get balance from credit service
  const balance = await getBalance(session.user.id);

  // 3. Return JSON response
  return NextResponse.json({
    total: balance.total,
    subscription: balance.subscription,
    purchased: balance.purchased,
    subscriptionExpiresAt: balance.subscriptionExpiresAt?.toISOString() || null,
  });
}
