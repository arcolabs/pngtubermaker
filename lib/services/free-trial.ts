import { and, eq, ne } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import {
  avatars,
  creditTransactions,
  expressionPacks,
  wallets,
} from "@/database/schema";
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
 * Atomically consume the user's one-time free trial AND create business
 * records (avatar row) in a single transaction.
 *
 * This prevents:
 * - Concurrent double-spend (two requests both passing the eligibility check)
 * - "Stuck" trial markers (trial consumed but avatar creation fails outside tx)
 *
 * The `createRecords` callback runs inside the same transaction, so either
 * everything succeeds or everything rolls back.
 */
export async function consumeFreeTrial<T>(
  userId: string,
  createRecords: (
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle transaction type requires any for generics
    tx: PgTransaction<any, any, any>,
  ) => Promise<T>,
): Promise<{ success: true; result: T } | { success: false; reason: string }> {
  const db = getDatabase();

  return await db.transaction(async (tx) => {
    // 1. Re-check: no existing non-failed avatars
    const existingAvatars = await tx
      .select({ id: avatars.id })
      .from(avatars)
      .where(and(eq(avatars.userId, userId), ne(avatars.status, "failed")))
      .limit(1);

    if (existingAvatars.length > 0) {
      return { success: false, reason: "avatar_trial_already_used" };
    }

    // 2. Re-check: no existing trial audit record (catches concurrent requests)
    const existingTrial = await tx
      .select({ id: creditTransactions.id })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, userId),
          eq(creditTransactions.type, "grant_trial"),
        ),
      )
      .limit(1);

    if (existingTrial.length > 0) {
      return { success: false, reason: "avatar_trial_already_used" };
    }

    // 3. Insert audit trail transaction
    await tx.insert(creditTransactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "grant_trial",
      amount: 0,
      balanceAfter: 0,
      description: "Free trial generation",
      metadata: { source: "free_trial" },
    });

    // 4. Create business records inside the same transaction
    const result = await createRecords(tx);

    return { success: true, result };
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

// ============================================================================
// Expression pack free trial
// ============================================================================

/**
 * Check if a user is eligible for a one-time free base expression pack.
 *
 * Eligible = has at least one completed avatar but has never generated
 * a non-failed expression pack, and has no `grant_trial_expression`
 * audit transaction.
 */
export async function canUseFreeExpressionTrial(
  userId: string,
): Promise<boolean> {
  const db = getDatabase();

  // 1. Must have a non-failed avatar (selecting or completed)
  const existingAvatars = await db
    .select({ id: avatars.id })
    .from(avatars)
    .where(and(eq(avatars.userId, userId), ne(avatars.status, "failed")))
    .limit(1);

  if (existingAvatars.length === 0) return false;

  // 2. No existing non-failed expression packs → never used the feature
  const existingPacks = await db
    .select({ id: expressionPacks.id })
    .from(expressionPacks)
    .innerJoin(avatars, eq(expressionPacks.avatarId, avatars.id))
    .where(
      and(eq(avatars.userId, userId), ne(expressionPacks.status, "failed")),
    )
    .limit(1);

  if (existingPacks.length > 0) return false;

  // 3. No trial-expression audit record (prevents race condition double-use)
  const trialTx = await db
    .select({ id: creditTransactions.id })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.type, "grant_trial_expression"),
      ),
    )
    .limit(1);

  if (trialTx.length > 0) return false;

  return true;
}

/**
 * Atomically consume the user's one-time free expression pack trial AND
 * create business records (pack + expressions) in a single transaction.
 *
 * This prevents:
 * - Concurrent double-spend (two requests both passing the eligibility check)
 * - "Stuck" trial markers (trial consumed but pack creation fails outside tx)
 *
 * The `createRecords` callback runs inside the same transaction, so either
 * everything succeeds or everything rolls back.
 */
export async function consumeFreeExpressionTrial<T>(
  userId: string,
  createRecords: (
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle transaction type requires any for generics
    tx: PgTransaction<any, any, any>,
  ) => Promise<T>,
): Promise<{ success: true; result: T } | { success: false; reason: string }> {
  const db = getDatabase();

  return await db.transaction(async (tx) => {
    // 1. Re-check: no existing non-failed packs
    const existingPacks = await tx
      .select({ id: expressionPacks.id })
      .from(expressionPacks)
      .innerJoin(avatars, eq(expressionPacks.avatarId, avatars.id))
      .where(
        and(eq(avatars.userId, userId), ne(expressionPacks.status, "failed")),
      )
      .limit(1);

    if (existingPacks.length > 0) {
      return { success: false, reason: "expression_trial_already_used" };
    }

    // 2. Re-check: no existing trial audit record (catches concurrent requests)
    const existingTrial = await tx
      .select({ id: creditTransactions.id })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, userId),
          eq(creditTransactions.type, "grant_trial_expression"),
        ),
      )
      .limit(1);

    if (existingTrial.length > 0) {
      return { success: false, reason: "expression_trial_already_used" };
    }

    // 3. Insert audit trail
    await tx.insert(creditTransactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "grant_trial_expression",
      amount: 0,
      balanceAfter: 0,
      description: "Free trial expression pack",
      metadata: { source: "free_trial_expression" },
    });

    // 4. Create business records inside the same transaction
    const result = await createRecords(tx);

    return { success: true, result };
  });
}

/**
 * Revert a consumed free expression pack trial (e.g. when generation fails).
 */
export async function revertFreeExpressionTrial(userId: string): Promise<void> {
  const db = getDatabase();
  await db
    .delete(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.type, "grant_trial_expression"),
      ),
    );
}
