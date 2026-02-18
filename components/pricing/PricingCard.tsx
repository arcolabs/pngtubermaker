"use client";

import { Check } from "lucide-react";
import type { BillingCycle, Tier } from "@/lib/stripe";
import { formatPrice } from "@/lib/stripe";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: Tier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  cycle: BillingCycle;
  isLoading?: boolean;
  onSubscribe: (tier: Tier) => void;
}

export function PricingCard({
  tier,
  name,
  description,
  monthlyPrice,
  yearlyPrice,
  features,
  highlighted = false,
  cycle,
  isLoading = false,
  onSubscribe,
}: PricingCardProps) {
  const price = cycle === "monthly" ? monthlyPrice : yearlyPrice;
  const monthlyEquivalent = cycle === "yearly" ? yearlyPrice / 12 : null;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-8 transition-all duration-300",
        highlighted
          ? "border-2 border-primary bg-gradient-to-b from-primary/10 to-transparent"
          : "border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 text-xl font-bold text-white">{name}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">
            {formatPrice(price)}
          </span>
          <span className="text-zinc-500">
            /{cycle === "monthly" ? "mo" : "yr"}
          </span>
        </div>
        {monthlyEquivalent && (
          <p className="mt-1 text-sm text-zinc-500">
            {formatPrice(monthlyEquivalent)}/month billed annually
          </p>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSubscribe(tier)}
        disabled={isLoading}
        className={cn(
          "w-full rounded-xl py-3 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50",
          highlighted
            ? "bg-primary text-white hover:bg-primary/90"
            : "border border-white/20 bg-white/5 text-white hover:bg-white/10",
        )}
      >
        {isLoading ? "Loading..." : `Subscribe to ${name}`}
      </button>
    </div>
  );
}
