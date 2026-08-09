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
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
        <div className="h-2.5 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <h3 className="font-semibold text-gray-900 mb-4">This Month</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Credits used</span>
            <span className="font-semibold text-gray-900">
              {creditsUsed.toLocaleString()} / {monthlyLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                percentage > 80
                  ? "bg-gradient-to-r from-red-400 to-red-500"
                  : percentage > 50
                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : "bg-gradient-to-r from-primary to-cyan-400"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-400">Avatars created</span>
            <span className="block font-semibold text-gray-900">
              {avatarsCreated}
            </span>
          </div>
          {formattedPeriodEnd && (
            <div>
              <span className="text-gray-400">Resets</span>
              <span className="block font-semibold text-gray-900">
                {formattedPeriodEnd}
              </span>
            </div>
          )}
        </div>
      </div>

      {monthlyLimit <= 500 && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm">
          <span className="text-amber-600">
            Buy credits or subscribe to the Creator Pass for monthly credits!
          </span>
        </div>
      )}
    </div>
  );
}
