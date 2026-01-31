"use client";

import { useState } from "react";

// Generate placeholder thumbnail data
const generateThumbnails = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    gradient: `from-primary/${20 + (i % 3) * 10} to-secondary/${20 + (i % 3) * 10}`,
  }));
};

// Thumbnail feature buttons data
const thumbnailFeatures = [
  {
    id: "generate",
    label: "AI Generate",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AI Generate icon"
      >
        <path
          d="M10 2L12 7H17L13 10L15 15L10 12L5 15L7 10L3 7H8L10 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "optimize",
    label: "AI Optimize",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AI Optimize icon"
      >
        <path
          d="M10 3V17M3 10H17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="10"
          cy="10"
          r="6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "style",
    label: "AI Style",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AI Style icon"
      >
        <rect
          x="4"
          y="4"
          width="6"
          height="6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <rect
          x="10"
          y="10"
          width="6"
          height="6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M7 7L13 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "face",
    label: "AI Face",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AI Face icon"
      >
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="7" cy="8" r="1" fill="currentColor" />
        <circle cx="13" cy="8" r="1" fill="currentColor" />
        <path
          d="M7 13C7 13 8.5 15 10 15C11.5 15 13 13 13 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "text",
    label: "AI Text",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AI Text icon"
      >
        <path
          d="M5 4H15M5 8H15M5 12H12M5 16H10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "background",
    label: "AI Background",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AI Background icon"
      >
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M3 7L10 12L17 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

interface ShowcaseProps {
  videoSrc?: string;
  videoPoster?: string;
}

export default function Showcase({
  videoSrc,
  videoPoster,
}: ShowcaseProps = {}) {
  const [selectedFeature, setSelectedFeature] = useState("generate");

  // Create two sets of thumbnails for seamless scrolling
  const thumbnailsRow1 = generateThumbnails(16);
  const thumbnailsRow2 = generateThumbnails(16);

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative w-full -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="overflow-hidden w-full">
          {/* First row: Left to Right */}
          <div className="flex mb-4 whitespace-nowrap">
            <div
              className="flex gap-4 flex-shrink-0 animate-scroll-left"
              style={{
                willChange: "transform",
              }}
            >
              {/* First set of thumbnails */}
              {[...thumbnailsRow1, ...thumbnailsRow1].map((item, index) => (
                <div
                  key={`row1-${item.id}`}
                  className="aspect-video w-40 h-24 sm:w-48 sm:h-28 md:w-56 md:h-32 rounded-lg bg-gradient-to-br flex-shrink-0 border border-border/50 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, rgba(255, 0, 0, ${0.2 + (index % 3) * 0.1}), rgba(42, 42, 42, ${0.2 + (index % 3) * 0.1}))`,
                  }}
                >
                  {/* Optional: Add a subtle pattern overlay */}
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-white/5 to-transparent" />
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
              {/* Second set of thumbnails */}
              {[...thumbnailsRow2, ...thumbnailsRow2].map((item, index) => (
                <div
                  key={`row2-${item.id}`}
                  className="aspect-video w-40 h-24 sm:w-48 sm:h-28 md:w-56 md:h-32 rounded-lg bg-gradient-to-br flex-shrink-0 border border-border/50 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, rgba(255, 0, 0, ${0.15 + (index % 3) * 0.1}), rgba(42, 42, 42, ${0.25 + (index % 3) * 0.1}))`,
                  }}
                >
                  {/* Optional: Add a subtle pattern overlay */}
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-white/5 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video overlay with glass effect */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl max-w-4xl w-full mx-4">
            {/* 16:9 Video Container - Auto-playing loop animation */}
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
      </div>

      {/* Feature Buttons Row - Below video */}
      <div className="max-w-screen-xl mx-auto px-4 pt-24 sm:pt-32 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {thumbnailFeatures.map((feature) => (
            <button
              type="button"
              key={feature.id}
              onClick={() => setSelectedFeature(feature.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white
                transition-all duration-200 whitespace-nowrap
                ${
                  selectedFeature === feature.id
                    ? "bg-black border border-[#2A2A2A]"
                    : "bg-black border border-[#2A2A2A] hover:border-[#3A3A3A]"
                }
              `}
            >
              <span className="flex-shrink-0">{feature.icon}</span>
              <span>{feature.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
