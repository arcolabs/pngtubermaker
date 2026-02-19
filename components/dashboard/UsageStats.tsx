"use client";

import { useMemo } from "react";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

interface UsageStatsProps {
  creditsUsed: number;
  monthlyLimit: number;
  avatarsCreated: number;
  periodEnd?: string | null;
  loading?: boolean;
}

export default function UsageStats({
  creditsUsed,
  monthlyLimit,
  avatarsCreated,
  periodEnd,
  loading = false,
}: UsageStatsProps) {
  const percentage = useMemo(() => {
    if (monthlyLimit <= 0) return 0;
    return Math.min(100, Math.round((creditsUsed / monthlyLimit) * 100));
  }, [creditsUsed, monthlyLimit]);

  const formattedPeriodEnd = useMemo(() => {
    if (!periodEnd) return null;
    try {
      return formatDate(periodEnd);
    } catch {
      return null;
    }
  }, [periodEnd]);

  if (loading) {
    return (
      <div className="bg-base-200 rounded-2xl p-4 sm:p-6 animate-pulse">
        <div className="h-6 w-48 bg-base-content/10 rounded mb-4" />
        <div className="h-4 w-full bg-base-content/10 rounded mb-2" />
        <div className="h-4 w-32 bg-base-content/10 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium">Usage This Month</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>
            Credits used: {creditsUsed.toLocaleString()} /{" "}
            {monthlyLimit.toLocaleString()}
          </span>
          <span className="text-base-content/60">{percentage}%</span>
        </div>
        <progress
          className={`progress ${
            percentage > 80
              ? "progress-error"
              : percentage > 50
                ? "progress-warning"
                : "progress-primary"
          } w-full`}
          value={percentage}
          max={100}
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/60">
        <span>Avatars created: {avatarsCreated}</span>
        {formattedPeriodEnd && <span>Resets: {formattedPeriodEnd}</span>}
      </div>

      {monthlyLimit <= 500 && (
        <div className="mt-4 p-3 bg-warning/10 rounded-lg text-sm">
          <span className="text-warning">
            You&apos;re using welcome credits. Subscribe to get monthly credits!
          </span>
        </div>
      )}
    </div>
  );
}
