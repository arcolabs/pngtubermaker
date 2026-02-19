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

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-cyan-400/10 flex items-center justify-center">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Credits
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalCredits.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="sm:ml-auto">
          {tier === "pro" ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-primary to-cyan-400">
              PRO
            </span>
          ) : tier === "start" ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10">
              START
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-500 bg-gray-100">
              FREE
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href="/pricing#topup"
            className="btn btn-sm btn-outline border-gray-200 hover:border-primary hover:text-primary"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Top Up
          </Link>
          {tier !== "pro" && (
            <Link
              href="/pricing"
              className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 hover:shadow-md transition-all"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
