import { and, eq, ne } from "drizzle-orm";
import { avatars, creditTransactions, wallets } from "@/database/schema";
import { getDatabase } from "@/lib/db";

/**
 * Check if a user is eligible for their one-time free trial generation.
 *
 * Eligible = never generated a non-failed avatar, never consumed credits,
 * and has no purchased credits (i.e. truly a brand-new free user).
 */
export async function canUseFreeTrial(userId: string): Promise<boolean> {
  const db = getDatabase();

  // 1. Any non-failed avatar → already used the product
  const existingAvatars = await db
    .select({ id: avatars.id })
    .from(avatars)
    .where(and(eq(avatars.userId, userId), ne(avatars.status, "failed")))
    .limit(1);

  if (existingAvatars.length > 0) return false;

  // 2. Any 'consume' credit transaction → already spent credits
  const consumeTx = await db
    .select({ id: creditTransactions.id })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.type, "consume"),
      ),
    )
    .limit(1);

  if (consumeTx.length > 0) return false;

  // 3. Has purchased credits → paying user, not trial-eligible
  const wallet = await db
    .select({ purchasedCredits: wallets.purchasedCredits })
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (wallet.length > 0 && wallet[0] && wallet[0].purchasedCredits > 0) {
    return false;
  }

  return true;
}

/**
 * Atomically consume the user's one-time free trial inside a DB transaction.
 * Re-checks avatar count inside the transaction to prevent race conditions
 * (e.g. two tabs submitting simultaneously).
 *
 * Inserts a `grant_trial` credit transaction as an audit trail.
 */
export async function consumeFreeTrial(
  userId: string,
): Promise<{ success: boolean; reason?: string }> {
  const db = getDatabase();

  return await db.transaction(async (tx) => {
    // Re-check inside transaction for atomicity
    const existingAvatars = await tx
      .select({ id: avatars.id })
      .from(avatars)
      .where(and(eq(avatars.userId, userId), ne(avatars.status, "failed")))
      .limit(1);

    if (existingAvatars.length > 0) {
      return { success: false, reason: "trial_already_used" };
    }

    // Insert audit trail transaction
    await tx.insert(creditTransactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "grant_trial",
      amount: 0,
      balanceAfter: 0,
      description: "Free trial generation",
      metadata: { source: "free_trial" },
    });

    return { success: true };
  });
}

/**
 * Revert a consumed free trial (e.g. when generation fails).
 * Deletes the trial audit-trail transaction so the user can retry.
 */
export async function revertFreeTrial(userId: string): Promise<void> {
  const db = getDatabase();
  await db
    .delete(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.type, "grant_trial"),
      ),
    );
}
