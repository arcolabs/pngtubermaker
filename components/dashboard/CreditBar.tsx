"use client";

import {
  ArrowUpCircle,
  Clock,
  Coins,
  Crown,
  ExternalLink,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface CreditBalance {
  total: number;
  subscription: number;
  purchased: number;
  expiresAt?: string;
}

interface Subscription {
  tier: "free" | "start" | "pro";
  expiresAt?: string;
}

interface CreditBarProps {
  balance: CreditBalance | null;
  subscription: Subscription | null;
  creditsUsed: number;
  monthlyLimit: number;
  loading?: boolean;
}

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
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function CreditBar({
  balance,
  subscription,
  creditsUsed,
  monthlyLimit,
  loading = false,
}: CreditBarProps) {
  const tier = subscription?.tier ?? "free";
  const totalCredits = balance?.total ?? 0;
  const [portalLoading, setPortalLoading] = useState(false);

  const usagePercentage = useMemo(() => {
    if (monthlyLimit <= 0) return 0;
    return Math.min(100, Math.round((creditsUsed / monthlyLimit) * 100));
  }, [creditsUsed, monthlyLimit]);

  const expirationInfo = useMemo(() => {
    if (!subscription?.expiresAt) return null;
    const daysLeft = getDaysUntil(subscription.expiresAt);
    const isExpiringSoon = daysLeft <= 7;
    return {
      date: formatDate(subscription.expiresAt),
      daysLeft,
      isExpiringSoon,
    };
  }, [subscription?.expiresAt]);

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-8 w-32 bg-gray-200 rounded" />
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const getTierBadge = () => {
    switch (tier) {
      case "pro":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-primary to-cyan-400">
            <Crown className="w-3 h-3" />
            PRO
          </span>
        );
      case "start":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10">
            START
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-500 bg-gray-100">
            FREE
          </span>
        );
    }
  };

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/payments/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      {/* Top: Credits + Tier */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-cyan-400/10 flex items-center justify-center flex-shrink-0">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Available Credits
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {totalCredits.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="sm:ml-auto flex flex-col items-start sm:items-end gap-2">
          {getTierBadge()}
          {expirationInfo && tier !== "free" && (
            <div
              className={`flex items-center gap-1.5 text-xs ${expirationInfo.isExpiringSoon ? "text-amber-600" : "text-gray-400"}`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {expirationInfo.isExpiringSoon
                  ? `Renews in ${expirationInfo.daysLeft} day${expirationInfo.daysLeft !== 1 ? "s" : ""}`
                  : `Renews ${expirationInfo.date}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Usage progress bar */}
      <div className="mt-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Credits used this month</span>
          <span className="font-semibold text-gray-900">
            {creditsUsed.toLocaleString()} / {monthlyLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              usagePercentage > 80
                ? "bg-gradient-to-r from-red-400 to-red-500"
                : usagePercentage > 50
                  ? "bg-gradient-to-r from-amber-400 to-amber-500"
                  : "bg-gradient-to-r from-primary to-cyan-400"
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        {tier !== "free" && (
          <Link
            href="/pricing#topup"
            className="btn btn-sm btn-outline border-gray-200 hover:border-primary hover:text-primary flex-1 min-w-[120px]"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Top Up
          </Link>
        )}

        {tier === "free" ? (
          <Link
            href="/pricing"
            className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 hover:shadow-md transition-all flex-1"
          >
            <Crown className="w-4 h-4" />
            Upgrade Plan
          </Link>
        ) : tier === "start" ? (
          <Link
            href="/pricing"
            className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 hover:shadow-md transition-all flex-1 min-w-[120px]"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Link>
        ) : null}

        {tier !== "free" && (
          <button
            type="button"
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="btn btn-sm btn-ghost text-gray-500 hover:text-gray-700 flex-1 min-w-[120px]"
          >
            {portalLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            Manage Subscription
          </button>
        )}

        {tier === "free" && (
          <div className="btn btn-sm btn-ghost no-animation cursor-default flex-1 text-gray-400">
            <span>{totalCredits} credits left</span>
          </div>
        )}
      </div>
    </div>
  );
}
