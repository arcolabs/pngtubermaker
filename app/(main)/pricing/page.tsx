"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PricingSection } from "@/components/pricing/PricingSection";
import { useSubscription } from "@/hooks/use-stripe";
import { authClient } from "@/lib/auth-client";
import type { BillingCycle, Tier } from "@/lib/stripe";

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subscribe, isLoading, error: subscribeError } = useSubscription();
  const [success, setSuccess] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  useEffect(() => {
    const successParam = searchParams.get("success");
    const canceledParam = searchParams.get("canceled");

    if (successParam) {
      setSuccess(true);
      window.history.replaceState({}, "", "/pricing");
    }

    if (canceledParam) {
      setCancelMessage(
        "Payment was canceled. You can try again when you're ready.",
      );
      window.history.replaceState({}, "", "/pricing");
    }
  }, [searchParams]);

  const handleSubscribe = async (tier: Tier, cycle: BillingCycle) => {
    // Check auth status before attempting subscribe
    const session = await authClient.getSession();
    if (!session.data?.user) {
      router.push("/login");
      return;
    }

    await subscribe(tier, cycle);
  };

  const displayError = subscribeError || cancelMessage;

  return (
    <div className="min-h-screen bg-base-100">
      {success && (
        <div className="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 rounded-xl border border-success/30 bg-success/10 px-6 py-4 text-success shadow-lg">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Success</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p>Subscription successful! Welcome to our premium features.</p>
          </div>
        </div>
      )}

      {displayError && (
        <div className="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 rounded-xl border border-error/30 bg-error/10 px-6 py-4 text-error shadow-lg">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Error</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p>{displayError}</p>
          </div>
        </div>
      )}

      <PricingSection onSubscribe={handleSubscribe} isLoading={isLoading} />
    </div>
  );
}
