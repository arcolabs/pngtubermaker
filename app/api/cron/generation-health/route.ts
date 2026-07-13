import { gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { avatars } from "@/database/schema";
import { getDatabase } from "@/lib/db";

/**
 * POST /api/cron/generation-health
 *
 * Answers one question: is avatar generation actually working right now?
 *
 * The 2026-07-08→12 outage ran ~100% failed for four days and the first thing
 * that told us was a customer email. The `avatars` table knew the whole time —
 * nobody asked it. This asks it, on a schedule.
 *
 * Unhealthy → posts to Lark and returns 503, so a plain `curl -f` scheduler
 * alarms too. Auth: Bearer CRON_SECRET.
 */

const WINDOW_HOURS = 6;
// Below this a quiet window is not evidence of breakage — pngtuber sees a
// generation every ~20min, so a handful of attempts says nothing either way.
const MIN_SAMPLES = 10;
const MAX_FAILURE_RATE = 0.5;

async function alertLark(text: string): Promise<void> {
  const url = process.env.LARK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg_type: "text", content: { text } }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    console.error("[HealthCheck] Lark alert failed:", e);
  }
}

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);
  const rows = await getDatabase()
    .select({ status: avatars.status })
    .from(avatars)
    .where(gt(avatars.createdAt, since));

  const total = rows.length;
  const failed = rows.filter((r) => r.status === "failed").length;
  const ok = rows.filter(
    (r) => r.status === "completed" || r.status === "selecting",
  ).length;
  const failureRate = total > 0 ? failed / total : 0;

  const body = {
    windowHours: WINDOW_HOURS,
    total,
    ok,
    failed,
    failureRate: Number(failureRate.toFixed(3)),
  };

  if (total < MIN_SAMPLES) {
    return NextResponse.json({
      ...body,
      healthy: true,
      reason: "too_few_samples",
    });
  }

  if (failureRate > MAX_FAILURE_RATE) {
    const pct = (failureRate * 100).toFixed(0);
    await alertLark(
      `🚨 PNGTuberMaker: generation is broken\n\n` +
        `${pct}% of the last ${total} attempts failed (${failed} failed / ${ok} ok, ${WINDOW_HOURS}h window).\n\n` +
        `Check the upstream BALANCES first — a drained account does not fail fast, it\n` +
        `hangs until our timeout, so the endpoint still looks alive when you probe it:\n` +
        `  BytePlus/ARK (primary, all seedream) — console.byteplus.com\n` +
        `  PiAPI (qwen + fallback) — piapi quota\n\n` +
        `Tell-tale in the data: candidate_providers = qwen,qwen,qwen,qwen means every\n` +
        `BytePlus slot died and qwen backfilled them.`,
    );
    console.error(
      `[HealthCheck] UNHEALTHY: ${pct}% failure over ${total} attempts`,
    );
    return NextResponse.json({ ...body, healthy: false }, { status: 503 });
  }

  return NextResponse.json({ ...body, healthy: true });
}
