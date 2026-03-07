"use client";

import { Coins, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";
import { useBuyCreditsModal } from "@/hooks/use-buy-credits-modal";
import { useTopup } from "@/hooks/use-stripe";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/stripe";
import { cn } from "@/lib/utils";

const PACK_HIGHLIGHTED: Record<CreditPackId, boolean> = {
  starter: false,
  popular: true,
  best_value: false,
};

export default function BuyCreditsModal() {
  const { isOpen, requiredCredits, close } = useBuyCreditsModal();
  const { topup, isLoading } = useTopup();
  const t = useTranslations("pricing.buyCreditsModal");
  const tPacks = useTranslations("pricing.creditPacks");

  const handlePurchase = async (packageId: string, priceInCents: number) => {
    await topup(priceInCents, packageId);
  };

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    },
    [close],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const packEntries = Object.entries(CREDIT_PACKS) as [
    CreditPackId,
    (typeof CREDIT_PACKS)[CreditPackId],
  ][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        role="presentation"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t("title")}</h3>
              {requiredCredits && (
                <p className="text-sm text-gray-500">
                  {t("requiresCredits", {
                    count: requiredCredits.toLocaleString(),
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Credit Packs */}
        <div className="px-6 pb-6 space-y-3">
          {packEntries.map(([id, pack]) => {
            const highlighted = PACK_HIGHLIGHTED[id];
            const priceInDollars = pack.priceInCents / 100;

            return (
              <button
                type="button"
                key={id}
                disabled={isLoading}
                onClick={() => handlePurchase(id, pack.priceInCents)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-left",
                  highlighted
                    ? "border-primary bg-primary/5 hover:bg-primary/10 ring-1 ring-primary/20"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  isLoading && "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="font-bold text-gray-900">
                      {pack.credits.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {tPacks("credits")}
                    </span>
                  </div>
                  {highlighted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-white">
                      <Sparkles className="w-2.5 h-2.5" />
                      {t("best")}
                    </span>
                  )}
                </div>
                <span className="font-bold text-primary text-lg">
                  ${priceInDollars.toFixed(2)}
                </span>
              </button>
            );
          })}

          <p className="text-center text-xs text-gray-400 pt-1">
            {t("footer")}
          </p>
        </div>
      </div>
    </div>
  );
}
