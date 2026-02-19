"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";
import { PricingSection } from "@/components/pricing/PricingSection";
import { useSubscription, useTopup } from "@/hooks/use-stripe";
import { authClient } from "@/lib/auth-client";
import type { BillingCycle, Tier } from "@/lib/stripe";

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    subscribe,
    isLoading: subscribeLoading,
    error: subscribeError,
  } = useSubscription();
  const { topup, isLoading: topupLoading, error: topupError } = useTopup();

  useEffect(() => {
    const successParam = searchParams.get("success");
    const canceledParam = searchParams.get("canceled");

    if (successParam) {
      toast.success("Subscription successful! Welcome to premium.", {
        duration: 5000,
      });
      window.history.replaceState({}, "", "/pricing");
    }

    if (canceledParam) {
      toast("Payment canceled. You can try again anytime.", {
        icon: "ℹ️",
        duration: 4000,
      });
      window.history.replaceState({}, "", "/pricing");
    }
  }, [searchParams]);

  useEffect(() => {
    if (subscribeError) {
      toast.error(subscribeError);
    }
  }, [subscribeError]);

  useEffect(() => {
    if (topupError) {
      toast.error(topupError);
    }
  }, [topupError]);

  const handleSubscribe = async (tier: Tier, cycle: BillingCycle) => {
    const session = await authClient.getSession();
    if (!session.data?.user) {
      router.push("/login");
      return;
    }

    await subscribe(tier, cycle);
  };

  const handleTopUp = async (
    packageId: string,
    _credits: number,
    price: number,
  ) => {
    const session = await authClient.getSession();
    if (!session.data?.user) {
      router.push("/login");
      return;
    }

    await topup(price * 100, packageId);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <PricingSection
        onSubscribe={handleSubscribe}
        onTopUp={handleTopUp}
        isLoading={subscribeLoading || topupLoading}
      />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
