import { eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { creditTransactions, wallets } from "@/database/schema";
import { getDatabase } from "@/lib/db";

// ============================================================================
// Credit configuration re-exports
// ============================================================================

export const TIER_CREDITS = {
  free: 0,
  creator: 6_000,
} as const;

export const TASK_COSTS = {
  avatar_generation: 300,
  expression_edit: 200,
  hd_upscale: 100,
  reference_sheet: 200,
} as const;

export interface CreditBalance {
  total: number;
  subscription: number;
  purchased: number;
  subscriptionExpiresAt: Date | null;
}

export interface ConsumeResult {
  success: boolean;
  newBalance: number;
  error?: "insufficient_credits";
}

// ============================================================================
// Transaction Context Types
// ============================================================================

export type CreditTxContext = {
  // biome-ignore lint/suspicious/noExplicitAny: Drizzle transaction type requires any for generics
  tx: PgTransaction<any, any, any>;
};

// ============================================================================
// Transaction-safe Credit Operations
// ============================================================================

/**
 * Transaction-version of consumeCredits - must be called within a transaction
 * The transaction itself provides isolation, so we don't need explicit row locking
 */
export async function consumeCreditsTx(
  ctx: CreditTxContext,
  userId: string,
  amount: number,
  _description: string,
  _metadata?: Record<string, unknown>,
): Promise<ConsumeResult> {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  const { tx } = ctx;

  // Query wallet within transaction
  const wallet = await tx
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
  const fromSubscription = Math.min(subCredits, amount);
  const fromPurchased = amount - fromSubscription;

  const newSubCredits = subCredits - fromSubscription;
  const newPurchasedCredits = w.purchasedCredits - fromPurchased;
  const newTotal = newSubCredits + newPurchasedCredits;

  // Update wallet within transaction
  await tx
    .update(wallets)
    .set({
      subscriptionCredits: newSubCredits,
      purchasedCredits: newPurchasedCredits,
      ...(w.subscriptionCreditsExpiresAt && w.subscriptionCreditsExpiresAt < now
        ? { subscriptionCreditsExpiresAt: null }
        : {}),
      updatedAt: now,
    })
    .where(eq(wallets.id, w.id));

  return { success: true, newBalance: newTotal };
}

/**
 * Transaction-version of refundCredits - must be called within a transaction
 */
export async function refundCreditsTx(
  ctx: CreditTxContext,
  userId: string,
  amount: number,
  _description: string,
  _metadata?: Record<string, unknown>,
): Promise<number> {
  const { tx } = ctx;

  const wallet = await tx
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

  await tx
    .update(wallets)
    .set({
      purchasedCredits: sql`${wallets.purchasedCredits} + ${amount}`,
      updatedAt: now,
    })
    .where(eq(wallets.id, w.id));

  return subCredits + w.purchasedCredits + amount;
}

// ============================================================================
// Atomic Business Operations
// ============================================================================

export interface ConsumeWithRecordResult<T> {
  success: true;
  result: T;
  newBalance: number;
  transactionId: string;
}

export interface ConsumeWithRecordError {
  success: false;
  error: "insufficient_credits" | string;
  newBalance: number;
}

/**
 * Atomic operation: consume credits and create a business record
 * Both operations happen in the same transaction - either both succeed or both fail
 *
 * @param userId - User ID
 * @param amount - Amount of credits to consume
 * @param description - Description for the transaction log
 * @param createRecord - Function to create the business record within the transaction
 * @param metadata - Optional metadata to store with the transaction
 * @returns Result of the operation
 *
 * @example
 * ```typescript
 * const result = await consumeWithRecord(
 *   userId,
 *   300,
 *   'Avatar generation',
 *   async (tx, transactionId) => {
 *     const [avatar] = await tx.insert(avatars).values({
 *       id: crypto.randomUUID(),
 *       userId,
 *       transactionId,
 *       // ... other fields
 *     }).returning();
 *     return avatar;
 *   },
 *   { style: 'anime' }
 * );
 * ```
 */
export async function consumeWithRecord<T>(
  userId: string,
  amount: number,
  description: string,
  createRecord: (
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle transaction type requires any for generics
    tx: PgTransaction<any, any, any>,
    transactionId: string,
  ) => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<ConsumeWithRecordResult<T> | ConsumeWithRecordError> {
  const db = getDatabase();
  const transactionId = crypto.randomUUID();

  try {
    return await db.transaction(async (tx) => {
      // 1. Consume credits within transaction
      const consumeResult = await consumeCreditsTx(
        { tx },
        userId,
        amount,
        description,
        metadata,
      );

      if (!consumeResult.success) {
        return {
          success: false,
          error: consumeResult.error ?? "unknown_error",
          newBalance: consumeResult.newBalance,
        };
      }

      // 2. Create business record within the same transaction
      const record = await createRecord(tx, transactionId);

      // 3. Log the transaction
      await tx.insert(creditTransactions).values({
        id: transactionId,
        userId,
        type: "consume",
        amount: -amount,
        balanceAfter: consumeResult.newBalance,
        description,
        metadata: metadata ?? null,
      });

      return {
        success: true,
        result: record,
        newBalance: consumeResult.newBalance,
        transactionId,
      };
    });
  } catch (error) {
    console.error("[consumeWithRecord] Transaction failed:", error);
    throw error; // Re-throw to let caller handle unexpected errors
  }
}

/**
 * Atomic operation: refund credits and update business record status
 *
 * @param userId - User ID
 * @param amount - Amount to refund
 * @param description - Description for the refund
 * @param updateRecord - Function to update the business record within the transaction
 * @param metadata - Optional metadata
 */
export async function refundWithUpdate<T>(
  userId: string,
  amount: number,
  description: string,
  // biome-ignore lint/suspicious/noExplicitAny: Drizzle transaction type requires any for generics
  updateRecord: (tx: PgTransaction<any, any, any>) => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<{ result: T; newBalance: number; transactionId: string }> {
  const db = getDatabase();
  const transactionId = crypto.randomUUID();

  return await db.transaction(async (tx) => {
    // 1. Refund credits within transaction
    const newBalance = await refundCreditsTx(
      { tx },
      userId,
      amount,
      description,
      metadata,
    );

    // 2. Update business record within the same transaction
    const record = await updateRecord(tx);

    // 3. Log the refund transaction
    await tx.insert(creditTransactions).values({
      id: transactionId,
      userId,
      type: "refund",
      amount,
      balanceAfter: newBalance,
      description,
      metadata: metadata ?? null,
    });

    return { result: record, newBalance, transactionId };
  });
}

// ============================================================================
// Balance Query (Non-transactional, safe to use outside transactions)
// ============================================================================

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
