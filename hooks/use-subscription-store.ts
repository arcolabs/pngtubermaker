"use client";

import { create } from "zustand";
import type { Tier } from "@/lib/stripe";

// ============================================================================
// Types
// ============================================================================

export interface CreditBalance {
  total: number;
  subscription: number;
  purchased: number;
  subscriptionExpiresAt: string | null;
}

export interface SubscriptionInfo {
  tier: Tier;
  status: string;
  monthlyCredits: number;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionStore {
  credits: CreditBalance | null;
  subscription: SubscriptionInfo | null;
  isLoaded: boolean;

  /** Fetch both credits + subscription from API. Call on mount and after mutations. */
  refresh: () => Promise<void>;
}

// ============================================================================
// Store
// ============================================================================

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  credits: null,
  subscription: null,
  isLoaded: false,

  refresh: async () => {
    try {
      const [creditRes, subRes] = await Promise.all([
        fetch("/api/credits/balance"),
        fetch("/api/subscription"),
      ]);

      const updates: Partial<
        Pick<SubscriptionStore, "credits" | "subscription" | "isLoaded">
      > = { isLoaded: true };

      if (creditRes.ok) {
        const data = await creditRes.json();
        updates.credits = {
          total: data.total,
          subscription: data.subscription,
          purchased: data.purchased,
          subscriptionExpiresAt: data.subscriptionExpiresAt ?? null,
        };
      }

      if (subRes.ok) {
        updates.subscription = await subRes.json();
      }

      set(updates);
    } catch (error) {
      console.error("Failed to fetch subscription data:", error);
      set({ isLoaded: true });
    }
  },
}));
