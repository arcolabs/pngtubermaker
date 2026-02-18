"use client";

import { useRouter } from "next/navigation";
import {
  type BillingCycle,
  PricingSection,
  type Tier,
} from "@/components/pricing";
import CTA from "@/components/sections/CTA";
import FAQ from "@/components/sections/FAQ";
import Features from "@/components/sections/Features";
import Hero from "@/components/sections/Hero";
import Testimonials from "@/components/sections/Testimonials";
import { useSubscription } from "@/hooks/use-stripe";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { subscribe, isLoading } = useSubscription();

  const handleSubscribe = async (tier: Tier, cycle: BillingCycle) => {
    const session = await authClient.getSession();
    if (!session.data?.user) {
      router.push("/login");
      return;
    }
    await subscribe(tier, cycle);
  };

  return (
    <>
      <Hero />
      <Features />
      <PricingSection onSubscribe={handleSubscribe} isLoading={isLoading} />
      <Testimonials />
      <CTA />
      <FAQ />
    </>
  );
}
