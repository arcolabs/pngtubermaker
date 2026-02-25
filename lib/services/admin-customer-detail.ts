import { desc, eq } from "drizzle-orm";
import {
  account,
  avatarExpressions,
  avatars,
  creditTransactions,
  subscriptions,
  transactions,
  user,
  wallets,
} from "@/database/schema";
import { getDatabase } from "@/lib/db";

// ── Types ───────────────────────────────────────────────────────────────────

export interface CustomerDetail {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: string;
    provider: string;
  };
  wallet: {
    subscriptionCredits: number;
    purchasedCredits: number;
    total: number;
    subscriptionExpiresAt: string | null;
  };
  subscription: {
    tier: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  creditHistory: CreditHistoryRow[];
  generations: GenerationRow[];
  payments: PaymentRow[];
}

export interface CreditHistoryRow {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface GenerationRow {
  id: string;
  kind: "avatar" | "expression";
  label: string; // prompt or expression type
  status: string;
  creditsUsed: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface PaymentRow {
  id: string;
  type: string;
  amount: number; // cents
  currency: string;
  status: string;
  description: string | null;
  stripeSessionId: string | null;
  createdAt: string;
}

// ── Query ───────────────────────────────────────────────────────────────────

export async function getCustomerDetail(
  userId: string,
): Promise<CustomerDetail | null> {
  const db = getDatabase();

  // Fetch user first — if not found, return null
  const [userRow] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userRow) return null;

  // Fetch all detail data in parallel
  const [
    providerRows,
    walletRows,
    subscriptionRows,
    creditRows,
    avatarRows,
    expressionRows,
    paymentRows,
  ] = await Promise.all([
    // OAuth provider
    db
      .select({ providerId: account.providerId })
      .from(account)
      .where(eq(account.userId, userId))
      .limit(1),

    // Wallet
    db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1),

    // Active subscription
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1),

    // Credit history (last 50)
    db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(50),

    // Avatars (last 30)
    db
      .select({
        id: avatars.id,
        prompt: avatars.prompt,
        status: avatars.status,
        creditsUsed: avatars.creditsUsed,
        baseImageUrl: avatars.baseImageUrl,
        createdAt: avatars.createdAt,
      })
      .from(avatars)
      .where(eq(avatars.userId, userId))
      .orderBy(desc(avatars.createdAt))
      .limit(30),

    // Expressions for user's avatars (last 50)
    db
      .select({
        id: avatarExpressions.id,
        type: avatarExpressions.type,
        status: avatarExpressions.status,
        creditsUsed: avatarExpressions.creditsUsed,
        imageUrl: avatarExpressions.imageUrl,
        createdAt: avatarExpressions.createdAt,
      })
      .from(avatarExpressions)
      .innerJoin(avatars, eq(avatarExpressions.avatarId, avatars.id))
      .where(eq(avatars.userId, userId))
      .orderBy(desc(avatarExpressions.createdAt))
      .limit(50),

    // Payment transactions (last 30)
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(30),
  ]);

  const provider = providerRows[0]?.providerId ?? "unknown";
  const w = walletRows[0];
  const sub = subscriptionRows[0];

  // Build wallet snapshot
  const now = new Date();
  const subCredits =
    w?.subscriptionCreditsExpiresAt && w.subscriptionCreditsExpiresAt < now
      ? 0
      : (w?.subscriptionCredits ?? 0);
  const purchasedCredits = w?.purchasedCredits ?? 0;

  // Build generations list (avatars + expressions merged, sorted by date)
  const generations: GenerationRow[] = [
    ...avatarRows.map((a) => ({
      id: a.id,
      kind: "avatar" as const,
      label: a.prompt.length > 60 ? `${a.prompt.slice(0, 60)}...` : a.prompt,
      status: a.status,
      creditsUsed: a.creditsUsed,
      imageUrl: a.baseImageUrl,
      createdAt: a.createdAt.toISOString(),
    })),
    ...expressionRows.map((e) => ({
      id: e.id,
      kind: "expression" as const,
      label: e.type,
      status: e.status,
      creditsUsed: e.creditsUsed,
      imageUrl: e.imageUrl,
      createdAt: e.createdAt.toISOString(),
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    user: {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      image: userRow.image,
      createdAt: userRow.createdAt.toISOString(),
      provider,
    },
    wallet: {
      subscriptionCredits: subCredits,
      purchasedCredits,
      total: subCredits + purchasedCredits,
      subscriptionExpiresAt:
        w?.subscriptionCreditsExpiresAt?.toISOString() ?? null,
    },
    subscription: sub
      ? {
          tier: sub.tier,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        }
      : null,
    creditHistory: creditRows.map((c) => ({
      id: c.id,
      type: c.type,
      amount: c.amount,
      balanceAfter: c.balanceAfter,
      description: c.description,
      createdAt: c.createdAt.toISOString(),
    })),
    generations,
    payments: paymentRows.map((p) => ({
      id: p.id,
      type: p.type,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      description: p.description,
      stripeSessionId: p.stripeSessionId,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}
