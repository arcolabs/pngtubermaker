"use client";

import { useRouter } from "next/navigation";
import {
  type BillingCycle,
  PricingSection,
  type Tier,
} from "@/components/pricing";
import AITools from "@/components/sections/AITools";
import Comparison from "@/components/sections/Comparison";
import DiscordCTA from "@/components/sections/DiscordCTA";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import Testimonials from "@/components/sections/Testimonials";
import { useSubscription, useTopup } from "@/hooks/use-stripe";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { subscribe, isLoading: subscribeLoading } = useSubscription();
  const { topup, isLoading: topupLoading } = useTopup();

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
    <>
      <Hero />
      <AITools />
      <Comparison />
      <PricingSection
        onSubscribe={handleSubscribe}
        onTopUp={handleTopUp}
        isLoading={subscribeLoading || topupLoading}
      />
      <Testimonials />
      <FAQ />
      <DiscordCTA />
    </>
  );
}
