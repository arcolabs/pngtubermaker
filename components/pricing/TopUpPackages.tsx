"use client";

import { Coins, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/stripe";
import { cn } from "@/lib/utils";

interface CreditPacksProps {
  onPurchase: (packageId: string, credits: number, price: number) => void;
  isLoading?: boolean;
}

const PACK_KEYS: Record<CreditPackId, string> = {
  starter: "packStarter",
  popular: "packPopular",
  best_value: "packBestValue",
  studio: "packStudio",
};

const PACK_HIGHLIGHTED: Record<CreditPackId, boolean> = {
  starter: false,
  popular: true,
  best_value: false,
  studio: false,
};

export default function CreditPacks({
  onPurchase,
  isLoading = false,
}: CreditPacksProps) {
  const t = useTranslations("pricing.creditPacks");
  const tCommon = useTranslations("common");

  const packEntries = Object.entries(CREDIT_PACKS) as [
    CreditPackId,
    (typeof CREDIT_PACKS)[CreditPackId],
  ][];

  return (
    <div>
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold mb-2">{t("title")}</h3>
        <p className="text-base-content/60">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packEntries.map(([id, pack]) => {
          const highlighted = PACK_HIGHLIGHTED[id];
          const priceInDollars = pack.priceInCents / 100;

          return (
            <div
              key={id}
              className={cn(
                "relative card border transition-all duration-200",
                highlighted
                  ? "border-2 border-primary bg-gradient-to-b from-primary/10 to-transparent"
                  : "border-base-content/10 bg-base-200/50 hover:border-base-content/20 hover:bg-base-200",
              )}
            >
              {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-content flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t("mostPopular")}
                </div>
              )}

              <div className="card-body items-center text-center pt-8">
                <h4 className="card-title text-lg">{t(PACK_KEYS[id])}</h4>

                <div className="flex items-center gap-2 my-3">
                  <Coins className="w-6 h-6 text-primary" />
                  <span className="text-3xl font-bold">
                    {pack.credits.toLocaleString()}
                  </span>
                  <span className="text-sm text-base-content/50">
                    {t("credits")}
                  </span>
                </div>

                <p className="text-2xl font-bold text-primary mb-4">
                  ${priceInDollars.toFixed(2)}
                </p>

                <button
                  type="button"
                  className={cn(
                    "w-full rounded-xl py-3 font-semibold transition-all duration-200",
                    highlighted
                      ? "btn btn-primary"
                      : "btn btn-outline btn-primary",
                  )}
                  disabled={isLoading}
                  onClick={() => onPurchase(id, pack.credits, priceInDollars)}
                >
                  {isLoading ? tCommon("loading") : t("buyCredits")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
