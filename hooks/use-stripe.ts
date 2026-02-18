"use client";

import { useState } from "react";
import type { BillingCycle, Tier } from "@/lib/stripe";

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (tier: Tier, cycle: BillingCycle = "monthly") => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier, cycle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return { subscribe, isLoading, error };
}

export function useTopup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topup = async (amountInCents: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountInCents }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return { topup, isLoading, error };
}
