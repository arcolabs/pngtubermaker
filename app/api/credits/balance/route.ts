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
 * Response: { total, subscription, purchased, subscriptionExpiresAt }
 */
export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // 2. Get balance
  const balance = await getBalance(userId);

  // 3. Return JSON response
  return NextResponse.json({
    total: balance.total,
    subscription: balance.subscription,
    purchased: balance.purchased,
    subscriptionExpiresAt: balance.subscriptionExpiresAt?.toISOString() || null,
  });
}
