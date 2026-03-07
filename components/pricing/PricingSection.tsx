"use client";

import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import type { BillingCycle, Tier } from "@/lib/stripe";
import { CreatorPassCard } from "./PricingCard";
import CreditPacks from "./TopUpPackages";

interface PricingSectionProps {
  onSubscribe: (tier: Tier, cycle: BillingCycle) => void;
  onTopUp?: (packageId: string, credits: number, price: number) => void;
  isLoading?: boolean;
}

function FreeTrialCard() {
  const t = useTranslations("pricing");
  const { user, isHydrated, hydrate } = useAuthStore();

  const freeTrialFeatures = [
    t("freeTrial.features.0"),
    t("freeTrial.features.1"),
    t("freeTrial.features.2"),
    t("freeTrial.features.3"),
    t("freeTrial.features.4"),
  ];

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  return (
    <div className="rounded-2xl border border-base-content/10 bg-white p-8 h-full flex flex-col">
      <div className="mb-6 text-center">
        <h3 className="mb-1 text-xl font-bold text-base-content">
          {t("freeTrial.title")}
        </h3>
        <p className="text-sm text-base-content/60">
          {t("freeTrial.subtitle")}
        </p>
      </div>

      <div className="mb-6 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-base-content">
            {t("freeTrial.price")}
          </span>
        </div>
        <p className="mt-1 text-sm text-base-content/50">
          {t("freeTrial.note")}
        </p>
      </div>

      <ul className="mb-8 space-y-3 flex-1">
        {freeTrialFeatures.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm text-base-content/70">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={user ? "/create" : "/login"}
        className="w-full rounded-xl py-3 font-semibold text-center btn btn-primary"
      >
        <ShieldCheck className="w-4 h-4" />
        {user ? t("freeTrial.ctaLoggedIn") : t("freeTrial.ctaLoggedOut")}
      </Link>
    </div>
  );
}

export function PricingSection({
  onSubscribe,
  onTopUp,
  isLoading = false,
}: PricingSectionProps) {
  const t = useTranslations("pricing");
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
            {t("heading")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-base-content/60">
            {t("subtitle")}
          </p>
        </div>

        {/* Primary: Free Trial + Creator Pass side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
          <FreeTrialCard />
          <CreatorPassCard
            isLoading={isLoading}
            isCurrentPlan={currentTier === "creator"}
            onSubscribe={onSubscribe}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-base-content/10" />
          <span className="text-sm text-base-content/40 uppercase tracking-wider font-medium">
            or
          </span>
          <div className="flex-1 h-px bg-base-content/10" />
        </div>

        {/* Secondary: Credit Packs */}
        {onTopUp && (
          <CreditPacks onPurchase={handleTopUp} isLoading={isLoading} />
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-base-content/50">{t("creditsNote")}</p>
        </div>
      </div>
    </section>
  );
}

export { CreatorPassCard as PricingCard } from "./PricingCard";
export { PricingToggle } from "./PricingToggle";
export type { Tier, BillingCycle };
