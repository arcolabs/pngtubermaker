"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  DollarSign,
  Flame,
  Image,
  Moon,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type {
  CustomerDashboardData,
  CustomerStats,
  DailyCount,
  GenerationStats,
  RecentTransaction,
  SubscriptionStats,
  UserSegment,
} from "@/lib/services/admin-customers";

const PROVIDER_ICON: Record<string, string> = {
  google: "G",
  github: "GH",
  discord: "DC",
  twitch: "TW",
  unknown: "?",
};

const SEGMENT_CONFIG: {
  key: UserSegment;
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "paying",
    label: "Paying",
    color: "text-success",
    icon: <DollarSign className="w-3.5 h-3.5" />,
  },
  {
    key: "exhausted",
    label: "Exhausted",
    color: "text-secondary",
    icon: <Flame className="w-3.5 h-3.5" />,
  },
  {
    key: "exploring",
    label: "Exploring",
    color: "text-warning",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    key: "inactive",
    label: "Inactive",
    color: "text-error",
    icon: <UserMinus className="w-3.5 h-3.5" />,
  },
  {
    key: "dormant",
    label: "Dormant",
    color: "text-gray-400",
    icon: <Moon className="w-3.5 h-3.5" />,
  },
];

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">{error || "Failed to load data"}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Row 1: User Stats + Generation Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatsCards stats={data.stats} />
        <GenerationStatsCard stats={data.generationStats} />
      </div>

      {/* Row 2: 7-Day Trend + Provider Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrendChart trend={data.trend7d} />
        </div>
        <ProviderBreakdown
          counts={data.providerCounts}
          total={data.stats.totalUsers}
        />
      </div>

      {/* Row 3: Subscription Overview + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SubscriptionOverview stats={data.subscriptionStats} />
        <div className="lg:col-span-2 bg-base-200/50 rounded-lg p-4 border border-base-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500">User Funnel</h2>
            <Link
              href="/admin/customers"
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              View all customers →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SEGMENT_CONFIG.map((seg) => (
              <Link
                key={seg.key}
                href={`/admin/customers?segment=${seg.key}`}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-base-200 transition-colors"
              >
                <span className={seg.color}>{seg.icon}</span>
                <div>
                  <p className="text-lg font-bold leading-none">
                    {data.segmentCounts[seg.key]}
                  </p>
                  <p className="text-[11px] text-gray-500">{seg.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Transactions */}
      <RecentTransactionsCard transactions={data.recentTransactions} />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatsCards({ stats }: { stats: CustomerStats }) {
  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5 text-primary" />,
    },
    {
      label: "New This Week",
      value: `+${stats.newUsersThisWeek}`,
      icon: <UserPlus className="w-5 h-5 text-success" />,
    },
    {
      label: "Activation",
      value: formatPercent(stats.activationRate),
      icon: <UserCheck className="w-5 h-5 text-warning" />,
    },
    {
      label: "Conversion",
      value: formatPercent(stats.conversionRate),
      icon: <TrendingUp className="w-5 h-5 text-secondary" />,
    },
    {
      label: "Revenue",
      value: formatCents(stats.totalRevenueCents),
      icon: <DollarSign className="w-5 h-5 text-success" />,
    },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-500">Users</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-base-200/50 rounded-lg p-3 border border-base-200"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {card.icon}
              <span className="text-[11px] text-gray-500">{card.label}</span>
            </div>
            <p className="text-lg font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenerationStatsCard({ stats }: { stats: GenerationStats }) {
  const cards = [
    {
      label: "Avatars",
      value: stats.totalAvatars.toLocaleString(),
      sub: null,
      icon: <Image className="w-5 h-5 text-primary" />,
    },
    {
      label: "Expressions",
      value: stats.totalExpressions.toLocaleString(),
      sub: null,
      icon: <Sparkles className="w-5 h-5 text-primary" />,
    },
    {
      label: "24h Success",
      value:
        stats.last24hTotal > 0
          ? formatPercent(stats.last24hSuccessRate)
          : "\u2014",
      sub: `${stats.last24hCompleted}/${stats.last24hTotal} last 24h`,
      icon:
        stats.last24hSuccessRate < 0.9 && stats.last24hTotal > 0 ? (
          <AlertTriangle className="w-5 h-5 text-warning" />
        ) : (
          <CheckCircle className="w-5 h-5 text-success" />
        ),
    },
    {
      label: "24h Failed",
      value: stats.last24hFailed.toLocaleString(),
      sub: `${stats.expressionFailedCount} all-time`,
      icon: <XCircle className="w-5 h-5 text-error" />,
    },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-500">Generation Health</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-base-200/50 rounded-lg p-3 border border-base-200"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {card.icon}
              <span className="text-[11px] text-gray-500">{card.label}</span>
            </div>
            <p className="text-lg font-bold">{card.value}</p>
            {card.sub && (
              <p className="text-[10px] text-gray-400">{card.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ trend }: { trend: DailyCount[] }) {
  const maxVal = Math.max(
    ...trend.map((d) => Math.max(d.registrations, d.generations)),
    1,
  );

  return (
    <div className="bg-base-200/50 rounded-lg p-4 border border-base-200">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-gray-500">7-Day Trend</h2>
        <div className="flex items-center gap-3 ml-auto text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            Registrations
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-secondary" />
            Generations
          </span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-24">
        {trend.map((d) => (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center gap-0.5"
          >
            <div className="w-full flex items-end gap-0.5 h-16">
              <div
                className="flex-1 bg-primary/70 rounded-t-sm min-h-[2px]"
                style={{ height: `${(d.registrations / maxVal) * 100}%` }}
                title={`${d.registrations} registrations`}
              />
              <div
                className="flex-1 bg-secondary/70 rounded-t-sm min-h-[2px]"
                style={{ height: `${(d.generations / maxVal) * 100}%` }}
                title={`${d.generations} generations`}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              {new Date(d.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              {d.registrations}/{d.generations}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderBreakdown({
  counts,
  total,
}: {
  counts: Record<string, number>;
  total: number;
}) {
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-base-200/50 rounded-lg p-4 border border-base-200">
      <h2 className="text-sm font-semibold text-gray-500 mb-3">
        Registration Source
      </h2>
      <div className="space-y-2">
        {sorted.map(([provider, cnt]) => {
          const pct = total > 0 ? (cnt / total) * 100 : 0;
          return (
            <div key={provider} className="flex items-center gap-2">
              <span className="text-xs font-mono w-6 text-center text-gray-500">
                {PROVIDER_ICON[provider] ?? provider}
              </span>
              <div className="flex-1 bg-base-300 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-16 text-right">
                {cnt} ({pct.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubscriptionOverview({ stats }: { stats: SubscriptionStats }) {
  const items = [
    {
      label: "Active",
      value: stats.activeCount,
      icon: <CreditCard className="w-4 h-4 text-success" />,
    },
    {
      label: "MRR",
      value: formatCents(stats.mrrCents),
      icon: <DollarSign className="w-4 h-4 text-primary" />,
    },
    {
      label: "Cancelling",
      value: stats.cancelPendingCount,
      icon: <AlertTriangle className="w-4 h-4 text-warning" />,
    },
    {
      label: "Canceled",
      value: stats.canceledCount,
      icon: <XCircle className="w-4 h-4 text-error" />,
    },
  ];

  return (
    <div className="bg-base-200/50 rounded-lg p-4 border border-base-200">
      <h2 className="text-sm font-semibold text-gray-500 mb-3">
        Subscriptions
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <span className="text-sm font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTransactionsCard({
  transactions: txs,
}: {
  transactions: RecentTransaction[];
}) {
  if (txs.length === 0) return null;

  const STATUS_BADGE: Record<string, string> = {
    completed: "badge-success",
    pending: "badge-ghost",
    failed: "badge-error",
    cancelled: "badge-ghost",
  };

  return (
    <div className="bg-base-200/50 rounded-lg p-4 border border-base-200">
      <h2 className="text-sm font-semibold text-gray-500 mb-3">
        Recent Transactions
      </h2>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="hover:bg-base-200/30">
                <td className="text-xs whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="text-sm">{tx.userName}</td>
                <td>
                  <span className="badge badge-xs badge-outline capitalize">
                    {tx.type}
                  </span>
                </td>
                <td className="text-sm font-medium text-success">
                  {formatCents(tx.amount)}
                </td>
                <td>
                  <span
                    className={`badge badge-xs ${STATUS_BADGE[tx.status] ?? "badge-ghost"}`}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
