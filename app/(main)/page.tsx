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
import ExplorePages from "@/components/sections/ExplorePages";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import Testimonials from "@/components/sections/Testimonials";
import { useSubscription, useTopup } from "@/hooks/use-stripe";
import { authClient } from "@/lib/auth-client";
import { generateFAQJsonLd } from "@/lib/faq-data";

const faqJsonLd = generateFAQJsonLd();

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PNGTuberMaker",
  url: "https://pngtubermaker.com",
  logo: {
    "@type": "ImageObject",
    url: "https://pngtubermaker.com/logo.svg",
  },
  sameAs: ["https://discord.gg/zysPAnvP8f"],
  description:
    "AI-powered PNGTuber avatar generator for Twitch, YouTube, and Discord streamers.",
};

const videoJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "PNGTuber Maker — Create AI PNGTuber Avatars for Streaming",
  description:
    "See how PNGTuberMaker lets you create custom PNGTuber avatars with AI, generate expression packs, and go live on Twitch, YouTube & Discord in minutes.",
  thumbnailUrl: "https://pngtubermaker.com/og-image.jpg",
  uploadDate: "2026-01-15",
  contentUrl: "https://pngtubermaker.com/videos/pngtuber_showcase.mp4",
  embedUrl: "https://pngtubermaker.com",
  publisher: {
    "@type": "Organization",
    name: "PNGTuberMaker",
    logo: {
      "@type": "ImageObject",
      url: "https://pngtubermaker.com/logo.svg",
    },
  },
};

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
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Organization structured data for SEO
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: FAQ structured data for SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Video structured data for SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <Hero />
      <AITools />
      <Comparison />
      <PricingSection
        onSubscribe={handleSubscribe}
        onTopUp={handleTopUp}
        isLoading={subscribeLoading || topupLoading}
      />
      <Testimonials />
      <ExplorePages />
      <FAQ />
      <DiscordCTA />
    </>
  );
}
