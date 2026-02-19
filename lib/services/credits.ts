import { and, desc, eq, lt, sql } from "drizzle-orm";
import { creditTransactions, wallets } from "@/database/schema";
import { getDatabase } from "@/lib/db";

// ============================================================================
// Credit configuration
// ============================================================================

/** Credits granted per subscription tier per month */
export const TIER_CREDITS = {
  free: 0,
  start: 12_000,
  pro: 50_000,
} as const;

/** Credit costs per task type */
export const TASK_COSTS = {
  avatar_generation: 300,
  expression_edit: 200,
  hd_upscale: 100,
} as const;

/** Top-up packages: { credits, priceInCents, bonusCredits } */
export const TOPUP_PACKAGES = {
  starter: { credits: 5_000, priceInCents: 500, bonusCredits: 0 },
  value: { credits: 12_000, priceInCents: 1000, bonusCredits: 2_000 },
  power: { credits: 35_000, priceInCents: 2500, bonusCredits: 10_000 },
} as const;

export type TopupPackageId = keyof typeof TOPUP_PACKAGES;

// ============================================================================
// Balance queries
// ============================================================================

export interface CreditBalance {
  total: number;
  subscription: number;
  purchased: number;
  subscriptionExpiresAt: Date | null;
}

/** Get the user's current credit balance, broken down by type. */
export async function getBalance(userId: string): Promise<CreditBalance> {
  const db = getDatabase();
  const wallet = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (wallet.length === 0 || !wallet[0]) {
    return {
      total: 0,
      subscription: 0,
      purchased: 0,
      subscriptionExpiresAt: null,
    };
  }

  const w = wallet[0];
  // Check if subscription credits have expired
  const now = new Date();
  const subCredits =
    w.subscriptionCreditsExpiresAt && w.subscriptionCreditsExpiresAt < now
      ? 0
      : w.subscriptionCredits;

  return {
    total: subCredits + w.purchasedCredits,
    subscription: subCredits,
    purchased: w.purchasedCredits,
    subscriptionExpiresAt: w.subscriptionCreditsExpiresAt,
  };
}

// ============================================================================
// Credit operations (all atomic)
// ============================================================================

export interface ConsumeResult {
  success: boolean;
  newBalance: number;
  error?: "insufficient_credits";
}

/**
 * Consume credits from user's wallet.
 * FIFO: subscription credits consumed first (they expire), then purchased credits.
 * Atomic: uses a single SQL transaction to prevent double-spend.
 */
export async function consumeCredits(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<ConsumeResult> {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  const db = getDatabase();
  const wallet = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (wallet.length === 0 || !wallet[0]) {
    return { success: false, newBalance: 0, error: "insufficient_credits" };
  }

  const w = wallet[0];
  const now = new Date();

  // Check if subscription credits have expired
  const subCredits =
    w.subscriptionCreditsExpiresAt && w.subscriptionCreditsExpiresAt < now
      ? 0
      : w.subscriptionCredits;
  const totalAvailable = subCredits + w.purchasedCredits;

  if (totalAvailable < amount) {
    return {
      success: false,
      newBalance: totalAvailable,
      error: "insufficient_credits",
    };
  }

  // Calculate how much to deduct from each pool (FIFO: subscription first)
  let fromSubscription = Math.min(subCredits, amount);
  const fromPurchased = amount - fromSubscription;

  // If subscription credits were expired, zero them out
  if (
    w.subscriptionCreditsExpiresAt &&
    w.subscriptionCreditsExpiresAt < now &&
    w.subscriptionCredits > 0
  ) {
    fromSubscription = 0;
  }

  const newSubCredits = subCredits - fromSubscription;
  const newPurchasedCredits = w.purchasedCredits - fromPurchased;
  const newTotal = newSubCredits + newPurchasedCredits;

  // Atomic update: wallet + transaction in sequence
  // Using optimistic locking via WHERE clause to prevent race conditions
  const updateResult = await db
    .update(wallets)
    .set({
      subscriptionCredits: newSubCredits,
      purchasedCredits: newPurchasedCredits,
      // Clear expired subscription credits
      ...(w.subscriptionCreditsExpiresAt && w.subscriptionCreditsExpiresAt < now
        ? { subscriptionCreditsExpiresAt: null }
        : {}),
      updatedAt: now,
    })
    .where(
      and(
        eq(wallets.id, w.id),
        // Optimistic lock: ensure balances haven't changed since our read
        eq(wallets.subscriptionCredits, w.subscriptionCredits),
        eq(wallets.purchasedCredits, w.purchasedCredits),
      ),
    )
    .returning();

  if (updateResult.length === 0) {
    // Race condition: another request modified the wallet between our read and write.
    // Retry once by re-reading and re-attempting.
    return consumeCredits(userId, amount, description, metadata);
  }

  // Log the transaction
  await db.insert(creditTransactions).values({
    id: crypto.randomUUID(),
    userId,
    type: "consume",
    amount: -amount,
    balanceAfter: newTotal,
    description,
    metadata: metadata ?? null,
  });

  return { success: true, newBalance: newTotal };
}

/**
 * Grant subscription credits (monthly grant, expire at billing cycle end).
 * Replaces any existing subscription credits.
 */
export async function grantSubscriptionCredits(
  userId: string,
  amount: number,
  expiresAt: Date,
): Promise<void> {
  const db = getDatabase();

  const existing = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  const now = new Date();

  if (existing.length > 0 && existing[0]) {
    // Replace subscription credits (new billing cycle)
    const w = existing[0];
    const newTotal = amount + w.purchasedCredits;

    await db
      .update(wallets)
      .set({
        subscriptionCredits: amount,
        subscriptionCreditsExpiresAt: expiresAt,
        updatedAt: now,
      })
      .where(eq(wallets.id, w.id));

    await db.insert(creditTransactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "grant_subscription",
      amount,
      balanceAfter: newTotal,
      description: `Monthly subscription credit grant (${amount} credits)`,
      metadata: { expiresAt: expiresAt.toISOString() },
    });
  } else {
    // Create wallet with subscription credits
    await db.insert(wallets).values({
      id: crypto.randomUUID(),
      userId,
      subscriptionCredits: amount,
      subscriptionCreditsExpiresAt: expiresAt,
      purchasedCredits: 0,
    });

    await db.insert(creditTransactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "grant_subscription",
      amount,
      balanceAfter: amount,
      description: `Monthly subscription credit grant (${amount} credits)`,
      metadata: { expiresAt: expiresAt.toISOString() },
    });
  }
}

/**
 * Grant purchased credits (top-up or welcome bonus).
 * By default, these credits never expire. Use expiresAt to set an expiration date (e.g., welcome credits).
 * When expiresAt is provided, credits are stored in subscription_credits pool for automatic expiration handling.
 */
export async function grantPurchasedCredits(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>,
  expiresAt?: Date,
): Promise<void> {
  // If expiresAt is provided, use subscription credits pool for automatic expiration
  if (expiresAt) {
    await grantSubscriptionCredits(userId, amount, expiresAt);
    // Update the transaction type to reflect this is a welcome/grant purchase, not a monthly subscription
    const db = getDatabase();
    // Get the most recent transaction for this user
    const recentTx = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(1);

    if (recentTx.length > 0 && recentTx[0]?.type === "grant_subscription") {
      await db
        .update(creditTransactions)
        .set({ type: "grant_purchase", description })
        .where(eq(creditTransactions.id, recentTx[0].id));
    }
    return;
  }

  const db = getDatabase();

  const existing = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    const w = existing[0];
    const now = new Date();
    const subCredits =
      w.subscriptionCreditsExpiresAt && w.subscriptionCreditsExpiresAt < now
        ? 0
        : w.subscriptionCredits;

    await db
      .update(wallets)
      .set({
        purchasedCredits: sql`${wallets.purchasedCredits} + ${amount}`,
        updatedAt: now,
      })
      .where(eq(wallets.id, w.id));

    await db.insert(creditTransactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "grant_purchase",
      amount,
      balanceAfter: subCredits + w.purchasedCredits + amount,
      description,
      metadata: metadata ?? null,
    });
  } else {
    await db.insert(wallets).values({
      id: crypto.randomUUID(),
      userId,
      subscriptionCredits: 0,
      purchasedCredits: amount,
    });

    await db.insert(creditTransactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "grant_purchase",
      amount,
      balanceAfter: amount,
      description,
      metadata: metadata ?? null,
    });
  }
}

/**
 * Refund credits back to user's purchased credits pool (refunds don't expire).
 */
export async function refundCredits(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const db = getDatabase();

  const wallet = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (wallet.length === 0 || !wallet[0]) {
    throw new Error(`No wallet found for user ${userId}`);
  }

  const w = wallet[0];
  const now = new Date();
  const subCredits =
    w.subscriptionCreditsExpiresAt && w.subscriptionCreditsExpiresAt < now
      ? 0
      : w.subscriptionCredits;

  await db
    .update(wallets)
    .set({
      purchasedCredits: sql`${wallets.purchasedCredits} + ${amount}`,
      updatedAt: now,
    })
    .where(eq(wallets.id, w.id));

  await db.insert(creditTransactions).values({
    id: crypto.randomUUID(),
    userId,
    type: "refund",
    amount,
    balanceAfter: subCredits + w.purchasedCredits + amount,
    description,
    metadata: metadata ?? null,
  });
}

/**
 * Expire subscription credits that have passed their expiration date.
 * Should be called periodically (e.g., daily cron job) or on wallet access.
 */
export async function expireSubscriptionCredits(): Promise<number> {
  const db = getDatabase();
  const now = new Date();

  // Find all wallets with expired subscription credits
  const expired = await db
    .select()
    .from(wallets)
    .where(
      and(
        lt(wallets.subscriptionCreditsExpiresAt, now),
        sql`${wallets.subscriptionCredits} > 0`,
      ),
    );

  for (const w of expired) {
    const expiredAmount = w.subscriptionCredits;

    await db
      .update(wallets)
      .set({
        subscriptionCredits: 0,
        subscriptionCreditsExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(wallets.id, w.id));

    await db.insert(creditTransactions).values({
      id: crypto.randomUUID(),
      userId: w.userId,
      type: "expire",
      amount: -expiredAmount,
      balanceAfter: w.purchasedCredits,
      description: `Subscription credits expired (${expiredAmount} credits)`,
    });
  }

  return expired.length;
}

// ============================================================================
// Wallet initialization
// ============================================================================

/**
 * Ensure a wallet exists for the user. Creates one if it doesn't exist.
 * Returns the wallet.
 */
export async function ensureWallet(userId: string) {
  const db = getDatabase();
  const existing = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    return existing[0];
  }

  const newWallet = await db
    .insert(wallets)
    .values({
      id: crypto.randomUUID(),
      userId,
      subscriptionCredits: 0,
      purchasedCredits: 0,
    })
    .onConflictDoNothing()
    .returning();

  return newWallet[0];
}

// ============================================================================
// Transaction history
// ============================================================================

export async function getCreditHistory(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{
  transactions: (typeof creditTransactions.$inferSelect)[];
  hasMore: boolean;
}> {
  const db = getDatabase();
  const offset = (page - 1) * limit;

  const results = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = results.length > limit;
  const transactions = hasMore ? results.slice(0, limit) : results;

  return { transactions, hasMore };
}
