"use client";

import { useEffect, useState } from "react";
import type { BillingCycle, Tier } from "@/lib/stripe";
import { CreatorPassCard } from "./PricingCard";
import CreditPacks from "./TopUpPackages";

interface PricingSectionProps {
  onSubscribe: (tier: Tier, cycle: BillingCycle) => void;
  onTopUp?: (packageId: string, credits: number, price: number) => void;
  isLoading?: boolean;
}

export function PricingSection({
  onSubscribe,
  onTopUp,
  isLoading = false,
}: PricingSectionProps) {
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const data = await res.json();
          if (data.tier) {
            setCurrentTier(data.tier);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      }
    };
    fetchSubscription();
  }, []);

  const handleTopUp = (packageId: string, credits: number, price: number) => {
    if (onTopUp) {
      onTopUp(packageId, credits, price);
    }
  };

  return (
    <section className="w-full py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-base-content md:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-base-content/60">
            Buy credits when you need them. Subscribe to save more.
          </p>
        </div>

        {/* Primary: Credit Packs */}
        {onTopUp && (
          <div className="mb-20">
            <CreditPacks onPurchase={handleTopUp} isLoading={isLoading} />
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-base-content/10" />
          <span className="text-sm text-base-content/40 uppercase tracking-wider font-medium">
            or
          </span>
          <div className="flex-1 h-px bg-base-content/10" />
        </div>

        {/* Secondary: Creator Pass */}
        <CreatorPassCard
          isLoading={isLoading}
          isCurrentPlan={currentTier === "creator"}
          onSubscribe={onSubscribe}
        />

        <div className="mt-12 text-center">
          <p className="text-sm text-base-content/50">
            Credits purchased via packs never expire. Subscription credits
            refresh monthly and expire at billing cycle end.
          </p>
        </div>
      </div>
    </section>
  );
}

export { CreatorPassCard as PricingCard } from "./PricingCard";
export { PricingToggle } from "./PricingToggle";
export type { Tier, BillingCycle };
