"use client";

import { useState } from "react";
import {
  type BillingCycle,
  getYearlySavings,
  PRICING_CONFIG,
  type Tier,
} from "@/lib/stripe";
import { PricingCard } from "./PricingCard";
import { PricingToggle } from "./PricingToggle";

interface PricingSectionProps {
  onSubscribe: (tier: Tier, cycle: BillingCycle) => void;
  isLoading?: boolean;
}

export function PricingSection({
  onSubscribe,
  isLoading = false,
}: PricingSectionProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const handleSubscribe = (tier: Tier) => {
    onSubscribe(tier, cycle);
  };

  return (
    <section className="w-full py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-base-content md:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-base-content/60">
            Choose the plan that fits your needs. Upgrade or downgrade at any
            time.
          </p>
        </div>

        <div className="mb-12">
          <PricingToggle
            cycle={cycle}
            onCycleChange={setCycle}
            savingsPercentage={getYearlySavings("pro")}
          />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <PricingCard
            tier="free"
            name={PRICING_CONFIG.free.name}
            description={PRICING_CONFIG.free.description}
            monthlyPrice={PRICING_CONFIG.free.monthlyPrice}
            yearlyPrice={PRICING_CONFIG.free.yearlyPrice}
            features={PRICING_CONFIG.free.features}
            highlighted={PRICING_CONFIG.free.highlighted}
            cycle={cycle}
            isLoading={isLoading}
            onSubscribe={handleSubscribe}
          />

          <PricingCard
            tier="start"
            name={PRICING_CONFIG.start.name}
            description={PRICING_CONFIG.start.description}
            monthlyPrice={PRICING_CONFIG.start.monthlyPrice}
            yearlyPrice={PRICING_CONFIG.start.yearlyPrice}
            features={PRICING_CONFIG.start.features}
            highlighted={PRICING_CONFIG.start.highlighted}
            cycle={cycle}
            isLoading={isLoading}
            onSubscribe={handleSubscribe}
          />

          <PricingCard
            tier="pro"
            name={PRICING_CONFIG.pro.name}
            description={PRICING_CONFIG.pro.description}
            monthlyPrice={PRICING_CONFIG.pro.monthlyPrice}
            yearlyPrice={PRICING_CONFIG.pro.yearlyPrice}
            features={PRICING_CONFIG.pro.features}
            highlighted={PRICING_CONFIG.pro.highlighted}
            cycle={cycle}
            isLoading={isLoading}
            onSubscribe={handleSubscribe}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-base-content/50">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

export { PricingCard, PricingToggle };
export type { Tier, BillingCycle };
