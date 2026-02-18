"use client";

import { cn } from "@/lib/utils";

interface PricingToggleProps {
  cycle: "monthly" | "yearly";
  onCycleChange: (cycle: "monthly" | "yearly") => void;
  savingsPercentage?: number;
}

export function PricingToggle({
  cycle,
  onCycleChange,
  savingsPercentage = 20,
}: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          cycle === "monthly" ? "text-white" : "text-zinc-500",
        )}
      >
        Monthly
      </span>

      <button
        type="button"
        onClick={() =>
          onCycleChange(cycle === "monthly" ? "yearly" : "monthly")
        }
        className="relative inline-flex h-7 w-14 items-center rounded-full bg-zinc-800 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label={`Switch to ${cycle === "monthly" ? "yearly" : "monthly"} billing`}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200",
            cycle === "yearly" ? "translate-x-8" : "translate-x-1",
          )}
        />
      </button>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            cycle === "yearly" ? "text-white" : "text-zinc-500",
          )}
        >
          Yearly
        </span>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
          Save {savingsPercentage}%
        </span>
      </div>
    </div>
  );
}
