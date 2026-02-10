"use client";

import Image from "next/image";
import { memo } from "react";

// ============================================================
// Types
// ============================================================
interface ThumbnailPair {
  id: string;
  from: string;
  to: string;
  fromAlt: string;
  toAlt: string;
}

// ============================================================
// Data
// ============================================================
const THUMBNAIL_PAIRS: ThumbnailPair[] = [
  {
    id: "1",
    from: "/images/showcase/image.JPEG",
    to: "/images/showcase/image(1).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
  {
    id: "2",
    from: "/images/showcase/image(2).JPEG",
    to: "/images/showcase/image(3).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
  {
    id: "3",
    from: "/images/showcase/image(4).JPEG",
    to: "/images/showcase/image(5).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
  {
    id: "4",
    from: "/images/showcase/image(6).JPEG",
    to: "/images/showcase/image(7).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
  {
    id: "5",
    from: "/images/showcase/image(8).JPEG",
    to: "/images/showcase/image(9).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
  {
    id: "6",
    from: "/images/showcase/image(10).JPEG",
    to: "/images/showcase/image(11).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
  {
    id: "7",
    from: "/images/showcase/image(12).JPEG",
    to: "/images/showcase/image(13).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
  {
    id: "8",
    from: "/images/showcase/image(14).JPEG",
    to: "/images/showcase/image(15).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
  {
    id: "9",
    from: "/images/showcase/image(16).JPEG",
    to: "/images/showcase/image(17).JPEG",
    fromAlt: "Original inspiration thumbnail",
    toAlt: "AI generated thumbnail",
  },
];

// ============================================================
// Sub-components
// ============================================================
const ThumbnailPairCard = memo(function ThumbnailPairCard({
  pair,
  index,
}: {
  pair: ThumbnailPair;
  index: number;
}) {
  return (
    <div
      className="group relative shrink-0 rounded-2xl overflow-hidden
                 border border-white/10 
                 shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                 hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.2)]
                 hover:border-white/20
                 hover:bg-white/10
                 transition-all duration-300 ease-in-out
                 p-4 backdrop-blur-sm"
    >
      {/* Number badge */}
      <div className="absolute top-3 right-3 text-[10px] font-mono text-white/30 group-hover:text-primary/40 transition-colors duration-300 z-10">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Original thumbnail */}
      <div className="relative aspect-video w-[200px] overflow-hidden rounded-lg sm:w-[240px] md:w-[280px]">
        <Image
          src={pair.from}
          alt={pair.fromAlt}
          fill
          className="object-cover opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
          sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
        />
      </div>

      {/* Arrow separator */}
      <div className="my-4 flex items-center justify-center gap-4">
        <div className="h-px flex-1 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#FF5555] group-hover:translate-y-1 transition-transform duration-300"
          aria-hidden="true"
        >
          <path d="M12 5v14"></path>
          <path d="m19 12-7 7-7-7"></path>
        </svg>
        <div className="h-px flex-1 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
      </div>

      {/* AI generated thumbnail */}
      <div className="relative aspect-video w-[200px] overflow-hidden rounded-lg ring-2 ring-[#FF5555] ring-offset-2 ring-offset-background sm:w-[240px] md:w-[280px] transition-all duration-300 group-hover:ring-[#FF0033]">
        <Image
          src={pair.to}
          alt={pair.toAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
        />
      </div>
    </div>
  );
});

// ============================================================
// Main Component
// ============================================================
export default function StealModeShowcase() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Badge */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-[#FF0033]/10 px-4 py-2 text-sm font-medium text-[#FF5555] border border-[#FF0033]/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8"></path>
            </svg>
            Infinite Steal Mode
          </div>

          {/* Heading */}
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center leading-[1.1] mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
            }}
          >
            We solve AI originality:{" "}
            <span className="text-[#FF5555]">steal it</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-[#FFFFFF80] leading-relaxed">
            Upload any thumbnail as inspiration. Our AI captures the style,
            composition, and vibe — then recreates it with your face and
            message.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative mt-8 overflow-hidden w-full">
        {/* Left gradient fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32"></div>
        {/* Right gradient fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32"></div>

        {/* Marquee - Scrolls from right to left */}
        <div className="flex whitespace-nowrap">
          <div
            className="flex gap-4 flex-shrink-0 animate-scroll-left"
            style={{
              willChange: "transform",
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...THUMBNAIL_PAIRS, ...THUMBNAIL_PAIRS].map((pair, index) => (
              <ThumbnailPairCard
                key={`${pair.id}-${index}`}
                pair={pair}
                index={index % THUMBNAIL_PAIRS.length}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-12 flex items-center justify-center gap-2">
        <p className="text-lg text-[#FFFFFF80]">
          Same style. Your face.{" "}
          <span className="font-semibold text-white">Every time.</span>
        </p>
      </div>
    </section>
  );
}
