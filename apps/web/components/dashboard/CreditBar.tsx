"use client";

import {
  ArrowUpCircle,
  Clock,
  Coins,
  Crown,
  Gift,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSubscriptionStore } from "@/hooks/use-subscription-store";
import { formatDate, getDaysUntil } from "@/lib/utils";

export default function CreditBar() {
  const { credits, subscription, isLoaded, refresh } = useSubscriptionStore();
  const [portalLoading, setPortalLoading] = useState(false);

  // Self-hydrate: fetch data on mount if not already loaded
  useEffect(() => {
    if (!isLoaded) refresh();
  }, [isLoaded, refresh]);

  const tier = subscription?.tier ?? "free";
  const totalCredits = credits?.total ?? 0;
  const subCredits = credits?.subscription ?? 0;
  const purchasedCredits = credits?.purchased ?? 0;
  const expiresAt = credits?.subscriptionExpiresAt;

  const monthlyLimit = subscription?.monthlyCredits ?? 0;

  const expirationInfo = useMemo(() => {
    if (!expiresAt) return null;
    const daysLeft = getDaysUntil(expiresAt);
    return {
      date: formatDate(expiresAt),
      daysLeft,
      isExpiringSoon: daysLeft <= 7,
    };
  }, [expiresAt]);

  // For the segmented bar: calculate proportions
  const barSegments = useMemo(() => {
    if (totalCredits <= 0) return { sub: 0, purchased: 0 };
    return {
      sub: Math.round((subCredits / totalCredits) * 100),
      purchased: Math.round((purchasedCredits / totalCredits) * 100),
    };
  }, [totalCredits, subCredits, purchasedCredits]);

  if (!isLoaded) {
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
      case "creator":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-primary to-cyan-400">
            <Crown className="w-3 h-3" />
            CREATOR
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

  // Determine subscription row label/color based on tier
  const isFreeUser = tier === "free";
  const subLabel = isFreeUser ? "Free Credits" : "Subscription Credits";
  const SubIcon = isFreeUser ? Gift : Sparkles;
  // Cyan for paid subscription, violet for free welcome
  const subBarColor = isFreeUser
    ? "bg-violet-400"
    : "bg-gradient-to-r from-primary to-cyan-400";
  const subDotColor = isFreeUser ? "bg-violet-400" : "bg-primary";

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
        </div>
      </div>

      {/* Segmented credit bar */}
      <div className="mt-5">
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
          {barSegments.sub > 0 && (
            <div
              className={`h-full ${subBarColor} transition-all duration-700 ease-out`}
              style={{ width: `${barSegments.sub}%` }}
            />
          )}
          {barSegments.purchased > 0 && (
            <div
              className="h-full bg-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${barSegments.purchased}%` }}
            />
          )}
        </div>
      </div>

      {/* Legend rows */}
      <div className="mt-3 space-y-2">
        {/* Subscription / Welcome row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${subDotColor}`}
            />
            <SubIcon className="w-3.5 h-3.5" />
            <span>{subLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {subCredits.toLocaleString()}
              {!isFreeUser && monthlyLimit > 0 && (
                <span className="text-gray-400 font-normal">
                  {" "}
                  / {monthlyLimit.toLocaleString()}
                </span>
              )}
            </span>
            {expirationInfo && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${expirationInfo.isExpiringSoon ? "text-amber-600" : "text-gray-400"}`}
              >
                <Clock className="w-3 h-3" />
                {isFreeUser
                  ? expirationInfo.daysLeft <= 0
                    ? "expired"
                    : `expires ${expirationInfo.date}`
                  : expirationInfo.isExpiringSoon
                    ? `renews in ${expirationInfo.daysLeft}d`
                    : `renews ${expirationInfo.date}`}
              </span>
            )}
          </div>
        </div>

        {/* Top-up row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-emerald-400" />
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Top-up Credits</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {purchasedCredits.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">never expires</span>
          </div>
        </div>
      </div>

      {/* Expiration warning for free users */}
      {isFreeUser && expirationInfo?.isExpiringSoon && subCredits > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200/60 px-4 py-3 text-sm text-amber-800">
          <span className="mt-0.5 flex-shrink-0">⚠</span>
          <p>
            Your credits expire in {expirationInfo.daysLeft} day
            {expirationInfo.daysLeft !== 1 && "s"}.{" "}
            <span className="text-amber-600">
              Purchased credits never expire.
            </span>{" "}
            <Link
              href="/pricing"
              className="font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
            >
              Buy Credits
            </Link>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        {tier !== "free" && (
          <Link
            href="/pricing"
            className="btn btn-sm btn-outline border-gray-200 hover:border-primary hover:text-primary flex-1 min-w-[120px]"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Buy Credits
          </Link>
        )}

        {tier === "free" && (
          <Link
            href="/pricing"
            className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 hover:shadow-md transition-all flex-1"
          >
            <Crown className="w-4 h-4" />
            Buy Credits
          </Link>
        )}

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
