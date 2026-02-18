"use client";

import { useRouter } from "next/navigation";
import {
  type BillingCycle,
  PricingSection,
  type Tier,
} from "@/components/pricing";
import AITools from "@/components/sections/AITools";
import CharacterShowcase from "@/components/sections/CharacterShowcase";
import Comparison from "@/components/sections/Comparison";
import DiscordCTA from "@/components/sections/DiscordCTA";
import FAQ from "@/components/sections/FAQ";
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
      <CharacterShowcase />
      <AITools />
      <Comparison />
      <PricingSection onSubscribe={handleSubscribe} isLoading={isLoading} />
      <Testimonials />
      <FAQ />
      <DiscordCTA />
    </>
  );
}
