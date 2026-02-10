"use client";

import Image from "next/image";
import { memo, useMemo } from "react";

// ============================================================
// Types & Interfaces
// ============================================================
interface ThumbnailItem {
  id: string;
  src: string;
}

interface ShowcaseProps {
  videoSrc?: string;
  videoPoster?: string;
}

// ============================================================
// Constants
// ============================================================
const SHOWCASE_IMAGES = [
  "/images/showcase/image.JPEG",
  "/images/showcase/image(1).JPEG",
  "/images/showcase/image(2).JPEG",
  "/images/showcase/image(3).JPEG",
  "/images/showcase/image(4).JPEG",
  "/images/showcase/image(5).JPEG",
  "/images/showcase/image(6).JPEG",
  "/images/showcase/image(7).JPEG",
  "/images/showcase/image(8).JPEG",
  "/images/showcase/image(9).JPEG",
  "/images/showcase/image(10).JPEG",
  "/images/showcase/image(11).JPEG",
  "/images/showcase/image(12).JPEG",
  "/images/showcase/image(13).JPEG",
  "/images/showcase/image(14).JPEG",
  "/images/showcase/image(15).JPEG",
  "/images/showcase/image(16).JPEG",
  "/images/showcase/image(17).JPEG",
] as const;

const FREE_BENEFITS = [
  { icon: "🎁", label: "100% Free" },
  { icon: "⚡", label: "Powered by Nano Banana" },
  { icon: "🔓", label: "No Login Required" },
  { icon: "∞", label: "Unlimited Generations" },
] as const;

// ============================================================
// Utility Functions
// ============================================================
const generateThumbnails = (count: number): ThumbnailItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `thumb-${i}-${Math.random().toString(36).slice(2, 8)}`,
    src: SHOWCASE_IMAGES[i % SHOWCASE_IMAGES.length],
  }));
};

// ============================================================
// Sub-components
// ============================================================

/**
 * Individual thumbnail card with optimized image loading
 */
const ThumbnailCard = memo(function ThumbnailCard({
  item,
  index,
}: {
  item: ThumbnailItem;
  index: number;
}) {
  return (
    <div
      className="relative aspect-video w-40 h-32 sm:w-48 sm:h-36 md:w-56 md:h-40 lg:w-64 lg:h-44 
                 rounded-xl flex-shrink-0 border border-white/10 shadow-xl overflow-hidden
                 bg-zinc-900 group"
    >
      <Image
        src={item.src}
        alt={`Thumbnail showcase ${index + 1}`}
        fill
        sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
        className="object-cover transition-all duration-500 
                   group-hover:scale-105 group-hover:brightness-110"
        loading={index < 8 ? "eager" : "lazy"}
        quality={85}
        unoptimized // Remove if using Next.js Image optimization
      />
      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 
                   pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
});

/**
 * Scrolling row of thumbnails
 */
const ThumbnailRow = memo(function ThumbnailRow({
  items,
  direction,
  rowId,
}: {
  items: ThumbnailItem[];
  direction: "left" | "right";
  rowId: string;
}) {
  // Double the items for seamless infinite scroll
  const duplicatedItems = useMemo(() => [...items, ...items], [items]);
  const animationClass =
    direction === "left" ? "animate-scroll-left" : "animate-scroll-right";

  return (
    <div className="flex mb-4 whitespace-nowrap overflow-hidden">
      <div
        className={`flex gap-4 flex-shrink-0 ${animationClass}`}
        style={{ willChange: "transform" }}
      >
        {duplicatedItems.map((item, index) => (
          <ThumbnailCard
            key={`${rowId}-${item.id}-${index}`}
            item={item}
            index={index % items.length}
          />
        ))}
      </div>
    </div>
  );
});

/**
 * Video player with optimized loading
 */
const VideoPlayer = memo(function VideoPlayer({
  videoSrc,
  videoPoster,
}: {
  videoSrc?: string;
  videoPoster?: string;
}) {
  const sources = useMemo(() => {
    if (videoSrc) {
      return [{ src: videoSrc, type: "video/mp4" }];
    }
    return [{ src: "/videos/Thumbfree.mp4", type: "video/mp4" }];
  }, [videoSrc]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={videoPoster || "/video-poster.jpg"}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
        <p className="text-white text-center p-4">
          Your browser does not support the video tag.
        </p>
      </video>

      {/* Subtle border glow */}
      <div
        className="absolute inset-0 rounded-2xl ring-1 ring-white/20 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
});

/**
 * Benefit badge component
 */
const BenefitBadge = memo(function BenefitBadge({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full 
                 text-sm font-medium text-white/90 
                 bg-white/5 backdrop-blur-sm border border-white/10
                 hover:bg-white/10 hover:border-white/20 
                 transition-all duration-300 whitespace-nowrap"
    >
      <span className="text-lg" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </span>
  );
});

// ============================================================
// Main Component
// ============================================================
export default function Showcase({
  videoSrc,
  videoPoster,
}: ShowcaseProps = {}) {
  // Memoize thumbnail generation to prevent re-renders
  const thumbnailsRow1 = useMemo(() => generateThumbnails(12), []);
  const thumbnailsRow2 = useMemo(() => generateThumbnails(12), []);

  return (
    <section
      className="relative bg-background overflow-hidden"
      aria-label="Product showcase"
    >
      {/* Background gradient for depth */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none"
        aria-hidden="true"
      />

      {/* Thumbnail rows - positioned as background */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 py-4">
        <div className="space-y-4 opacity-60">
          <ThumbnailRow items={thumbnailsRow1} direction="left" rowId="row1" />
          <ThumbnailRow items={thumbnailsRow2} direction="right" rowId="row2" />
        </div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-8 sm:pb-10 lg:pb-12">
        {/* Video showcase */}
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-2xl p-1 bg-gradient-to-br from-white/20 via-white/10 to-transparent
                       shadow-2xl shadow-black/50"
          >
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-1">
              <VideoPlayer videoSrc={videoSrc} videoPoster={videoPoster} />
            </div>
          </div>
        </div>

        {/* Benefits section */}
        <div className="mt-4 sm:mt-5">
          <ul
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            aria-label="Product benefits"
          >
            {FREE_BENEFITS.map((benefit) => (
              <li key={benefit.label}>
                <BenefitBadge icon={benefit.icon} label={benefit.label} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
