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

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-8 transition-all duration-300",
        highlighted
          ? "border-2 border-primary bg-gradient-to-b from-primary/10 to-transparent"
          : "border border-base-content/10 bg-base-200/50 hover:border-base-content/20 hover:bg-base-200",
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-content">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 text-xl font-bold text-base-content">{name}</h3>
        <p className="text-sm text-base-content/60">{description}</p>
      </div>

      <div className="mb-6">
        {tier === "free" ? (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-base-content">$0</span>
              <span className="text-base-content/50">forever</span>
            </div>
            <p className="mt-1 text-sm text-base-content/50">
              No credit card required
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-base-content">
                {formatPrice(price)}
              </span>
              <span className="text-base-content/50">
                /{cycle === "monthly" ? "mo" : "yr"}
              </span>
            </div>
            {cycle === "yearly" ? (
              <p className="mt-1 text-sm text-success">
                Save{" "}
                {Math.round(
                  ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) *
                    100,
                )}
                % vs monthly
              </p>
            ) : (
              <p className="mt-1 text-sm text-base-content/50">
                {formatPrice(yearlyPrice / 12)}/mo when billed annually
              </p>
            )}
          </div>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm text-base-content/70">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSubscribe(tier)}
        disabled={isLoading}
        className={cn(
          "w-full rounded-xl py-3 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:opacity-50",
          tier === "free"
            ? "btn btn-outline btn-primary"
            : highlighted
              ? "btn btn-primary"
              : "btn btn-outline",
        )}
      >
        {isLoading
          ? "Loading..."
          : tier === "free"
            ? "Get Started Free"
            : cycle === "yearly"
              ? `Subscribe Yearly`
              : `Subscribe Monthly`}
      </button>
    </div>
  );
}
