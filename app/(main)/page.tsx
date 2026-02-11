import type { Metadata } from "next";
import { AIImageGenerator } from "@/components/ai-image-generator";
import CTA from "@/components/sections/CTA";
import FAQ from "@/components/sections/FAQ";
import Features from "@/components/sections/Features";
import Hero from "@/components/sections/Hero";
import Showcase from "@/components/sections/Showcase";
import StealPhilosophy from "@/components/sections/StealPhilosophy";
import TargetAudience from "@/components/sections/TargetAudience";
import Testimonials from "@/components/sections/Testimonials";
import { SoftwareStructuredData } from "@/components/seo/StructuredData";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thumb-free.com";

export const metadata: Metadata = {
  title: "Free AI YouTube Thumbnail Generator | Thumb-Free",
  description:
    "Create professional YouTube thumbnails in seconds with AI. 100% free, unlimited generations. No credit card required. Best AI thumbnail maker for creators.",
  keywords: [
    "AI thumbnail generator",
    "YouTube thumbnail maker",
    "free thumbnail creator",
    "AI YouTube thumbnails",
    "thumbnail generator free",
    "create YouTube thumbnails",
  ],
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Free AI YouTube Thumbnail Generator | Thumb-Free",
    description:
      "Create professional YouTube thumbnails in seconds with AI. 100% free, unlimited generations.",
    url: baseUrl,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Thumb-Free - Free AI YouTube Thumbnail Generator",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <SoftwareStructuredData />
      <Hero />
      <Showcase videoSrc="/videos/Thumbfree.mp4" />

      {/* AI Image Generator Section */}
      <section
        id="image-generator"
        className="pt-4 sm:pt-6 pb-16 sm:pb-20 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AIImageGenerator />
        </div>
      </section>
      <Features />
      <StealPhilosophy />
      <TargetAudience />
      {/* Placeholder for future sections */}
      <section id="how-it-works" className="scroll-mt-16" />
      <section id="pricing" className="scroll-mt-16" />
      <Testimonials />
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <FAQ />
      </div>
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <CTA />
      </div>
    </>
  );
}
