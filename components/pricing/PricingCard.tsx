"use client";

import { Check, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  type BillingCycle,
  CREATOR_PASS,
  formatPrice,
  getYearlySavings,
  type Tier,
} from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { PricingToggle } from "./PricingToggle";

interface CreatorPassCardProps {
  isLoading?: boolean;
  isCurrentPlan?: boolean;
  onSubscribe: (tier: Tier, cycle: BillingCycle) => void;
}

export function CreatorPassCard({
  isLoading = false,
  isCurrentPlan = false,
  onSubscribe,
}: CreatorPassCardProps) {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const price =
    cycle === "monthly"
      ? CREATOR_PASS.monthlyPrice
      : CREATOR_PASS.yearlyPrice / 12;
  const savings = getYearlySavings();

  return (
    <div className="relative rounded-2xl border border-base-content/10 bg-base-200/50 p-8 max-w-lg mx-auto">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-cyan-400 px-4 py-1 text-xs font-semibold text-white flex items-center gap-1">
        <Crown className="w-3 h-3" />
        Subscribe & Save
      </div>

      <div className="mb-6 text-center">
        <h3 className="mb-1 text-xl font-bold text-base-content">
          {CREATOR_PASS.name}
        </h3>
        <p className="text-sm text-base-content/60">
          For creators who want the best value on credits and HD export
        </p>
      </div>

      <div className="mb-6">
        <PricingToggle
          cycle={cycle}
          onCycleChange={setCycle}
          savingsPercentage={savings}
        />
      </div>

      <div className="mb-6 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-base-content">
            {formatPrice(price)}
          </span>
          <span className="text-base-content/50">{t("perMonth")}</span>
        </div>
        {cycle === "yearly" ? (
          <p className="mt-1 text-sm text-success">
            {formatPrice(CREATOR_PASS.yearlyPrice)}/yr —{" "}
            {t("savings", { percent: savings })}
          </p>
        ) : (
          <p className="mt-1 text-sm text-base-content/50">
            {formatPrice(CREATOR_PASS.yearlyPrice / 12)}
            {t("annualNote")}
          </p>
        )}
        <p className="mt-2 text-sm font-medium text-primary">
          {t("savingsNote")}
        </p>
      </div>

      <ul className="mb-8 space-y-3">
        {CREATOR_PASS.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm text-base-content/70">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <div className="w-full rounded-xl py-3 font-semibold text-center bg-success/10 text-success">
          {t("currentPlan")}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSubscribe("creator", cycle)}
          disabled={isLoading}
          className={cn(
            "w-full rounded-xl py-3 font-semibold transition-all duration-200",
            "btn btn-outline btn-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:opacity-50",
          )}
        >
          {isLoading
            ? tCommon("loading")
            : cycle === "yearly"
              ? t("subscribeYearly")
              : t("subscribeMonthly")}
        </button>
      )}
    </div>
  );
}
