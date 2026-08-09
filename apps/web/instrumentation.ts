export async function register() {
  // Only run scheduler on the Node.js server, not during build or in Edge runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const { expireSubscriptionCredits } = await import(
      "@/lib/services/credits"
    );

    // Every day at 01:00 — expire subscription credits past their expiration date
    cron.default.schedule("0 1 * * *", async () => {
      try {
        const count = await expireSubscriptionCredits();
        if (count > 0) {
          console.log(
            `[Scheduler] Expired subscription credits for ${count} wallet(s)`,
          );
        }
      } catch (error) {
        console.error("[Scheduler] Failed to expire credits:", error);
      }
    });

    console.log("[Scheduler] Credit expiration cron registered (daily 01:00)");
  }
}
