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
  index,
}: {
  feature: FeatureCard;
  variant?: "default" | "compact";
  index: number;
}) {
  const isCompact = variant === "compact";

  return (
    <div
      className="group relative rounded-2xl overflow-hidden
                 border border-white/10 
                 shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                 hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.2)]
                 hover:border-white/20
                 hover:bg-white/10
                 transition-all duration-300 ease-in-out"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Number badge */}
      <div className="absolute top-4 right-4 z-10 text-xs font-mono text-white/20 group-hover:text-primary/40 transition-colors duration-300">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Image Container */}
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
      <div className="relative p-4 sm:p-6 lg:p-8">
        <h3
          className={`font-semibold text-white mb-2 sm:mb-3 group-hover:text-primary/90 transition-colors duration-300 ${
            isCompact
              ? "text-base sm:text-lg lg:text-xl"
              : "text-lg sm:text-xl lg:text-2xl"
          }`}
        >
          {feature.title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
});

// ============================================================
// Main Component
// ============================================================
export default function Features() {
  return (
    <section
      id="features"
      className="relative py-20 sm:py-28 lg:py-32 overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center leading-[1.1] mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
            }}
          >
            Why creators choose Thumb-Free
          </h2>

          <p className="text-lg sm:text-xl text-[#FFFFFF80] max-w-2xl mx-auto">
            The world's first completely free, unlimited AI thumbnail generator.
            No tricks. No limits. Just results.
          </p>
        </div>

        {/* Primary Features Grid - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          {PRIMARY_FEATURES.map((feature, index) => (
            <FeatureCardComponent
              key={feature.id}
              feature={feature}
              variant="default"
              index={index}
            />
          ))}
        </div>

        {/* Secondary Features Grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {SECONDARY_FEATURES.map((feature, index) => (
            <FeatureCardComponent
              key={feature.id}
              feature={feature}
              variant="compact"
              index={index + 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
