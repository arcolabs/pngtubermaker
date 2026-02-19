"use client";

import { ArrowUpCircle, Coins } from "lucide-react";
import Link from "next/link";

interface CreditBalance {
  total: number;
  subscription: number;
  purchased: number;
  expiresAt?: string;
}

interface Subscription {
  tier: "free" | "start" | "pro";
}

interface CreditBarProps {
  balance: CreditBalance | null;
  subscription: Subscription | null;
  loading?: boolean;
}

export default function CreditBar({
  balance,
  subscription,
  loading = false,
}: CreditBarProps) {
  const tier = subscription?.tier ?? "free";
  const totalCredits = balance?.total ?? 0;

  const tierBadgeClass = {
    free: "badge-ghost",
    start: "badge-primary",
    pro: "bg-gradient-to-r from-primary to-secondary badge-gradient",
  };

  if (loading) {
    return (
      <div className="bg-base-200 rounded-2xl p-4 sm:p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-8 w-32 bg-base-content/10 rounded" />
          <div className="h-6 w-24 bg-base-content/10 rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-base-content/10 rounded" />
            <div className="h-10 w-24 bg-base-content/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-base-content/60">Credits</p>
            <p className="text-2xl font-bold">
              {totalCredits.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <span
            className={`badge badge-lg ${
              tier === "pro"
                ? "bg-gradient-to-r from-primary to-secondary border-0 text-white"
                : tierBadgeClass[tier]
            }`}
          >
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </span>
        </div>

        <div className="flex gap-2 sm:ml-4">
          <Link href="/pricing#topup" className="btn btn-outline btn-sm gap-1">
            <ArrowUpCircle className="w-4 h-4" />
            Top Up
          </Link>
          {tier !== "pro" && (
            <Link href="/pricing" className="btn btn-primary btn-sm">
              Upgrade
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
