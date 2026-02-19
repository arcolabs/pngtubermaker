import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { subscriptions } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

/**
 * GET /api/subscription
 *
 * Get current user's active subscription info.
 * Returns { tier: "free", ... } if no active subscription found.
 *
 * Auth: Required
 * Response: { tier, status, monthlyCredits, currentPeriodEnd?, cancelAtPeriodEnd }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();

    const activeSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    const sub = activeSub[0];

    if (!sub || sub.status !== "active") {
      return NextResponse.json({
        tier: "free",
        status: "inactive",
        monthlyCredits: 0,
        cancelAtPeriodEnd: false,
      });
    }

    return NextResponse.json({
      tier: sub.tier,
      status: sub.status,
      monthlyCredits: sub.monthlyCredits ?? 0,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString(),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}
