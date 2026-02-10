"use client";

import { useState } from "react";

// Real image sources from public/images/showcase
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
];

function generateThumbnails(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `thumb-${i}`,
    src: SHOWCASE_IMAGES[i % SHOWCASE_IMAGES.length],
  }));
}

const freeBenefits = [
  "100% Free",
  "Powered by Nano Banana",
  "No Login Required",
  "Unlimited Generations",
];

interface ShowcaseProps {
  videoSrc?: string;
  videoPoster?: string;
}

export default function Showcase({
  videoSrc,
  videoPoster,
}: ShowcaseProps = {}) {
  // Create two sets of thumbnails for seamless scrolling
  const thumbnailsRow1 = generateThumbnails(16);
  const thumbnailsRow2 = generateThumbnails(16);

  return (
    <section className="relative bg-background py-8">
      {/* Thumbnail rows background - positioned behind video */}
      <div className="absolute top-[35%] -translate-y-1/2 w-full -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
        {/* First row: Left to Right */}
        <div className="flex mb-4 whitespace-nowrap">
          <div
            className="flex gap-4 flex-shrink-0 animate-scroll-left"
            style={{
              willChange: "transform",
            }}
          >
            {[...thumbnailsRow1, ...thumbnailsRow1].map((item, index) => (
              <div
                key={`row1-${item.id}-${index}`}
                className="relative aspect-video w-40 h-32 sm:w-48 sm:h-40 md:w-56 md:h-44 rounded-lg flex-shrink-0 border border-border/50 shadow-lg overflow-hidden bg-muted"
              >
                <img
                  src={item.src}
                  alt=""
                  className="w-full h-full object-cover brightness-105 saturate-110 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" aria-hidden />
              </div>
            ))}
          </div>
        </div>

        {/* Second row: Right to Left */}
        <div className="flex whitespace-nowrap">
          <div
            className="flex gap-4 flex-shrink-0 animate-scroll-right"
            style={{
              willChange: "transform",
            }}
          >
            {[...thumbnailsRow2, ...thumbnailsRow2].map((item, index) => (
              <div
                key={`row2-${item.id}-${index}`}
                className="relative aspect-video w-40 h-32 sm:w-48 sm:h-40 md:w-56 md:h-44 rounded-lg flex-shrink-0 border border-border/50 shadow-lg overflow-hidden bg-muted"
              >
                <img
                  src={item.src}
                  alt=""
                  className="w-full h-full object-cover brightness-105 saturate-110 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video container - relative positioning with z-index */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl max-w-4xl w-full mx-4">
          {/* 16:9 Video Container */}
          <div className="aspect-video w-full relative">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster={videoPoster || "/video-poster.jpg"}
            >
              {videoSrc ? (
                <source src={videoSrc} type="video/mp4" />
              ) : (
                <>
                  <source src="/demo-video.mp4" type="video/mp4" />
                  <source src="/demo-video.webm" type="video/webm" />
                </>
              )}
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      {/* Free benefits & feature badges - Below video */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {freeBenefits.map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-4 py-2.5 rounded-md text-sm font-medium text-white bg-black border border-[#2A2A2A] whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
