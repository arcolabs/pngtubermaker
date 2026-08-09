import { NextResponse } from "next/server";
import { expireSubscriptionCredits } from "@/lib/services/credits";

/**
 * POST /api/cron/expire-credits
 *
 * Expire subscription credits that have passed their expiration date.
 * Should be called periodically (e.g., daily via Vercel Cron or external scheduler).
 *
 * Auth: Bearer token matching CRON_SECRET env var
 * Response: { expired: number }
 */

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET environment variable not set");
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expiredCount = await expireSubscriptionCredits();
    console.log(
      `[Cron] Expired subscription credits for ${expiredCount} wallet(s)`,
    );

    return NextResponse.json({ expired: expiredCount });
  } catch (error) {
    console.error("[Cron] Failed to expire credits:", error);
    return NextResponse.json(
      { error: "Failed to expire credits" },
      { status: 500 },
    );
  }
}
