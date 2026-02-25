import { count, desc, eq, gte, max, sql, sum } from "drizzle-orm";
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

export type UserSegment =
  | "inactive"
  | "exploring"
  | "exhausted"
  | "paying"
  | "dormant";

export interface CustomerStats {
  totalUsers: number;
  newUsersThisWeek: number;
  activationRate: number; // 0-1
  conversionRate: number; // 0-1
  totalRevenueCents: number;
}

export interface GenerationStats {
  totalAvatars: number;
  totalExpressions: number;
  expressionSuccessRate: number; // 0-1
  expressionFailedCount: number;
  // 24h window
  last24hTotal: number;
  last24hCompleted: number;
  last24hFailed: number;
  last24hSuccessRate: number; // 0-1
}

export interface RecentTransaction {
  id: string;
  userName: string;
  type: string;
  amount: number; // cents
  status: string;
  createdAt: string;
}

export interface SubscriptionStats {
  activeCount: number;
  cancelPendingCount: number;
  canceledCount: number;
  mrrCents: number; // monthly recurring revenue
}

export interface DailyCount {
  date: string; // YYYY-MM-DD
  registrations: number;
  generations: number; // avatar + expression creates
}

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  provider: string; // google | github | discord | twitch
  avatarCount: number;
  creditsBalance: number;
  totalPaidCents: number;
  lastActiveAt: string | null;
  segment: UserSegment;
}

export interface CustomerDashboardData {
  stats: CustomerStats;
  generationStats: GenerationStats;
  segmentCounts: Record<UserSegment, number>;
  providerCounts: Record<string, number>;
  trend7d: DailyCount[];
  customers: CustomerRow[];
  recentTransactions: RecentTransaction[];
  subscriptionStats: SubscriptionStats;
}

// ── Queries ─────────────────────────────────────────────────────────────────

export async function getCustomerDashboardData(): Promise<CustomerDashboardData> {
  const db = getDatabase();
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all data in parallel
  const [
    usersRaw,
    avatarCounts,
    walletData,
    paidTotals,
    lastActivity,
    providerData,
    avatarStats,
    expressionStats,
    recentRegistrations,
    recentGenerations,
    expr24hStats,
    recentTxRows,
    subStats,
  ] = await Promise.all([
    // All users
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user),

    // Avatar count per user
    db
      .select({
        userId: avatars.userId,
        count: count().as("count"),
      })
      .from(avatars)
      .groupBy(avatars.userId),

    // Wallet balances
    db
      .select({
        userId: wallets.userId,
        subscriptionCredits: wallets.subscriptionCredits,
        purchasedCredits: wallets.purchasedCredits,
      })
      .from(wallets),

    // Total paid (completed transactions) per user
    db
      .select({
        userId: transactions.userId,
        total: sum(sql`CAST(${transactions.amount} AS integer)`)
          .mapWith(Number)
          .as("total"),
      })
      .from(transactions)
      .where(eq(transactions.status, "completed"))
      .groupBy(transactions.userId),

    // Last credit transaction per user
    db
      .select({
        userId: creditTransactions.userId,
        lastAt: max(creditTransactions.createdAt).as("last_at"),
      })
      .from(creditTransactions)
      .groupBy(creditTransactions.userId),

    // OAuth provider per user (first account)
    db
      .select({
        userId: account.userId,
        providerId: account.providerId,
      })
      .from(account),

    // Avatar generation stats (all time)
    db
      .select({
        status: avatars.status,
        count: count().as("count"),
      })
      .from(avatars)
      .groupBy(avatars.status),

    // Expression generation stats (all time)
    db
      .select({
        status: avatarExpressions.status,
        count: count().as("count"),
      })
      .from(avatarExpressions)
      .groupBy(avatarExpressions.status),

    // 7-day registration trend
    db
      .select({
        date: sql<string>`TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')`.as("date"),
        count: count().as("count"),
      })
      .from(user)
      .where(gte(user.createdAt, weekAgo))
      .groupBy(sql`TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')`),

    // 7-day generation trend (avatars created)
    db
      .select({
        date: sql<string>`TO_CHAR(${avatars.createdAt}, 'YYYY-MM-DD')`.as(
          "date",
        ),
        count: count().as("count"),
      })
      .from(avatars)
      .where(gte(avatars.createdAt, weekAgo))
      .groupBy(sql`TO_CHAR(${avatars.createdAt}, 'YYYY-MM-DD')`),

    // P1: 24h expression generation stats
    db
      .select({
        status: avatarExpressions.status,
        count: count().as("count"),
      })
      .from(avatarExpressions)
      .where(gte(avatarExpressions.createdAt, dayAgo))
      .groupBy(avatarExpressions.status),

    // P1: Recent transactions (last 20, joined with user name)
    db
      .select({
        id: transactions.id,
        userName: user.name,
        type: transactions.type,
        amount: transactions.amount,
        status: transactions.status,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(user, eq(transactions.userId, user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(20),

    // P2: Subscription stats
    db
      .select({
        status: subscriptions.status,
        tier: subscriptions.tier,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        count: count().as("count"),
      })
      .from(subscriptions)
      .groupBy(
        subscriptions.status,
        subscriptions.tier,
        subscriptions.cancelAtPeriodEnd,
      ),
  ]);

  // Build lookup maps
  const avatarMap = new Map(avatarCounts.map((r) => [r.userId, r.count]));
  const walletMap = new Map(
    walletData.map((r) => [
      r.userId,
      r.subscriptionCredits + r.purchasedCredits,
    ]),
  );
  const paidMap = new Map(paidTotals.map((r) => [r.userId, r.total ?? 0]));
  const activityMap = new Map(
    lastActivity.map((r) => [r.userId, r.lastAt as Date | null]),
  );
  // First provider per user
  const providerMap = new Map<string, string>();
  for (const p of providerData) {
    if (!providerMap.has(p.userId)) {
      providerMap.set(p.userId, p.providerId);
    }
  }

  // Build customer rows with segment classification
  const customers: CustomerRow[] = usersRaw.map((u) => {
    const avatarCount = avatarMap.get(u.id) ?? 0;
    const credits = walletMap.get(u.id) ?? 0;
    const totalPaid = paidMap.get(u.id) ?? 0;
    const lastAt = activityMap.get(u.id) ?? null;

    const segment = classifySegment(
      avatarCount,
      credits,
      totalPaid,
      lastAt,
      thirtyDaysAgo,
    );

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      provider: providerMap.get(u.id) ?? "unknown",
      avatarCount,
      creditsBalance: credits,
      totalPaidCents: totalPaid,
      lastActiveAt: lastAt?.toISOString() ?? null,
      segment,
    };
  });

  // Compute user stats
  const totalUsers = customers.length;
  const newUsersThisWeek = usersRaw.filter(
    (u) => u.createdAt >= weekAgo,
  ).length;
  const usersWithAvatars = customers.filter((c) => c.avatarCount > 0).length;
  const usersWhoPaid = customers.filter((c) => c.totalPaidCents > 0).length;
  const totalRevenueCents = customers.reduce((s, c) => s + c.totalPaidCents, 0);

  // Segment counts
  const segmentCounts: Record<UserSegment, number> = {
    inactive: 0,
    exploring: 0,
    exhausted: 0,
    paying: 0,
    dormant: 0,
  };
  for (const c of customers) {
    segmentCounts[c.segment]++;
  }

  // Provider counts
  const providerCounts: Record<string, number> = {};
  for (const c of customers) {
    providerCounts[c.provider] = (providerCounts[c.provider] ?? 0) + 1;
  }

  // Generation stats (all-time)
  const totalAvatars = avatarStats.reduce((s, r) => s + r.count, 0);
  const exprByStatus = new Map(expressionStats.map((r) => [r.status, r.count]));
  const totalExpressions = expressionStats.reduce((s, r) => s + r.count, 0);
  const completedExpressions = exprByStatus.get("completed") ?? 0;
  const failedExpressions = exprByStatus.get("failed") ?? 0;

  // P1: 24h generation health
  const expr24hByStatus = new Map(expr24hStats.map((r) => [r.status, r.count]));
  const last24hTotal = expr24hStats.reduce((s, r) => s + r.count, 0);
  const last24hCompleted = expr24hByStatus.get("completed") ?? 0;
  const last24hFailed = expr24hByStatus.get("failed") ?? 0;

  // P1: Recent transactions
  const recentTransactions: RecentTransaction[] = recentTxRows.map((r) => ({
    id: r.id,
    userName: r.userName,
    type: r.type,
    amount: Number(r.amount),
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  // P2: Subscription stats
  const TIER_MONTHLY_CENTS: Record<string, number> = {
    creator: 799,
  };
  let activeCount = 0;
  let cancelPendingCount = 0;
  let canceledCount = 0;
  let mrrCents = 0;
  for (const row of subStats) {
    if (row.status === "active") {
      activeCount += row.count;
      mrrCents += (TIER_MONTHLY_CENTS[row.tier] ?? 0) * row.count;
      if (row.cancelAtPeriodEnd) {
        cancelPendingCount += row.count;
      }
    } else if (row.status === "canceled") {
      canceledCount += row.count;
    }
  }

  // 7-day trend
  const regMap = new Map(recentRegistrations.map((r) => [r.date, r.count]));
  const genMap = new Map(recentGenerations.map((r) => [r.date, r.count]));
  const trend7d: DailyCount[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    trend7d.push({
      date: dateStr,
      registrations: regMap.get(dateStr) ?? 0,
      generations: genMap.get(dateStr) ?? 0,
    });
  }

  return {
    stats: {
      totalUsers,
      newUsersThisWeek,
      activationRate: totalUsers > 0 ? usersWithAvatars / totalUsers : 0,
      conversionRate: totalUsers > 0 ? usersWhoPaid / totalUsers : 0,
      totalRevenueCents,
    },
    generationStats: {
      totalAvatars,
      totalExpressions,
      expressionSuccessRate:
        totalExpressions > 0 ? completedExpressions / totalExpressions : 0,
      expressionFailedCount: failedExpressions,
      last24hTotal,
      last24hCompleted,
      last24hFailed,
      last24hSuccessRate:
        last24hTotal > 0 ? last24hCompleted / last24hTotal : 0,
    },
    segmentCounts,
    providerCounts,
    trend7d,
    customers,
    recentTransactions,
    subscriptionStats: {
      activeCount,
      cancelPendingCount,
      canceledCount,
      mrrCents,
    },
  };
}

// ── Segment classification ──────────────────────────────────────────────────

function classifySegment(
  avatarCount: number,
  credits: number,
  totalPaid: number,
  lastActiveAt: Date | null,
  thirtyDaysAgo: Date,
): UserSegment {
  if (totalPaid > 0) return "paying";
  if (lastActiveAt && lastActiveAt < thirtyDaysAgo && avatarCount > 0)
    return "dormant";
  if (avatarCount > 0 && credits === 0) return "exhausted";
  if (avatarCount > 0) return "exploring";
  return "inactive";
}
