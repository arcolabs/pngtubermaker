"use client";

import Image from "next/image";
import { memo } from "react";

// ============================================================
// Types
// ============================================================
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  image: string;
}

// ============================================================
// Data
// ============================================================
const PRIMARY_FEATURES: FeatureCard[] = [
  {
    id: "instant-generation",
    title: "100% Free. Unlimited Forever.",
    description:
      "No hidden fees. No credits. No limits. Generate as many stunning thumbnails as you need, completely free.",
    image: "/images/features/01.JPG",
  },
  {
    id: "viral-templates",
    title: "Title + Photo = Pro Thumbnail",
    description:
      "Just enter your video title and upload your photo. Our AI creates scroll-stopping thumbnails in seconds.",
    image: "/images/features/02.JPG",
  },
];

const SECONDARY_FEATURES: FeatureCard[] = [
  {
    id: "face-detection",
    title: "AI-powered face enhancement",
    description:
      "Smart detection captures your best expressions and creates professional-looking results automatically.",
    image: "/images/features/03.JPG",
  },
  {
    id: "ab-testing",
    title: "Multiple variations, zero wait",
    description:
      "Generate endless variations instantly to A/B test and find the thumbnail that drives maximum clicks.",
    image: "/images/features/04.JPG",
  },
  {
    id: "4k-exports",
    title: "Ready for YouTube & Shorts",
    description:
      "Download high-resolution thumbnails optimized perfectly for YouTube, TikTok, and all major platforms.",
    image: "/images/features/05.JPG",
  },
];

// ============================================================
// Sub-components
// ============================================================

const FeatureCardComponent = memo(function FeatureCardComponent({
  feature,
  variant = "default",
}: {
  feature: FeatureCard;
  variant?: "default" | "compact";
}) {
  const isCompact = variant === "compact";

  return (
    <div
      className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden
                 border border-white/10 hover:border-white/20
                 transition-all duration-500 hover:scale-[1.02]
                 hover:shadow-2xl hover:shadow-black/50"
    >
      {/* Image Container - matches actual image aspect ratios */}
      <div
        className={`relative overflow-hidden ${
          isCompact ? "aspect-[4/3]" : "aspect-video"
        }`}
      >
        <Image
          src={feature.image}
          alt={feature.title}
          fill
          sizes={
            isCompact
              ? "(max-width: 768px) 100vw, 33vw"
              : "(max-width: 768px) 100vw, 50vw"
          }
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        <h3
          className={`font-bold text-white mb-3 ${
            isCompact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          }`}
        >
          {feature.title}
        </h3>
        <p className="text-white/60 text-sm sm:text-base leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF0033]/5 to-transparent
                   opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
});

// ============================================================
// Main Component
// ============================================================
export default function Features() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Why creators choose Thumb-Free
          </h2>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            The world's first completely free, unlimited AI thumbnail generator.
            No tricks. No limits. Just results.
          </p>
        </div>

        {/* Primary Features Grid - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {PRIMARY_FEATURES.map((feature) => (
            <FeatureCardComponent
              key={feature.id}
              feature={feature}
              variant="default"
            />
          ))}
        </div>

        {/* Secondary Features Grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SECONDARY_FEATURES.map((feature) => (
            <FeatureCardComponent
              key={feature.id}
              feature={feature}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
