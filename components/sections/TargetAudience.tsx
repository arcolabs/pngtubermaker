"use client";

import { memo } from "react";

// ============================================================
// Types
// ============================================================
interface AudienceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ============================================================
// Icons
// ============================================================
const IconYouTube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
    <title>YouTube</title>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const IconAgency = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden
  >
    <title>Agency</title>
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9v.01" />
    <path d="M9 12v.01" />
    <path d="M9 15v.01" />
    <path d="M9 18v.01" />
  </svg>
);

const IconBrand = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden
  >
    <title>Brand</title>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <path d="M7 7h.01" />
  </svg>
);

const IconShortForm = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden
  >
    <title>Short Form</title>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
);

const IconContentCreator = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden
  >
    <title>Content Creator</title>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconTeams = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden
  >
    <title>Teams</title>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ============================================================
// Data
// ============================================================
const AUDIENCE_CARDS: AudienceCard[] = [
  {
    id: "youtubers",
    title: "YouTubers",
    description:
      "Create multiple thumbnails at once. Get more clicks without spending hours designing.",
    icon: <IconYouTube />,
  },
  {
    id: "agencies",
    title: "Agencies",
    description:
      "Produce 100+ thumbnails weekly with a consistent, premium look.",
    icon: <IconAgency />,
  },
  {
    id: "brands",
    title: "Brands",
    description:
      "Keep your visual identity sharp without hiring an in-house designer for every video.",
    icon: <IconBrand />,
  },
  {
    id: "short-form",
    title: "Short-form Creators",
    description:
      "Produce scroll-stopping thumbnails for Shorts, TikTok, and Reels instantly.",
    icon: <IconShortForm />,
  },
  {
    id: "content-creators",
    title: "Content Creators",
    description:
      "Create pro-level thumbnails without touching Photoshop or hiring designers.",
    icon: <IconContentCreator />,
  },
  {
    id: "teams",
    title: "Teams",
    description:
      "Move faster, publish more, and keep every thumbnail on-brand across channels.",
    icon: <IconTeams />,
  },
];

// ============================================================
// Sub-components
// ============================================================
const AudienceCardComponent = memo(function AudienceCardComponent({
  card,
  index,
}: {
  card: AudienceCard;
  index: number;
}) {
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

      <div className="relative p-6 sm:p-8">
        {/* Number badge */}
        <div className="absolute top-4 right-4 text-xs font-mono text-white/20 group-hover:text-primary/40 transition-colors duration-300">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl 
                     border border-white/10 bg-white/10 
                     group-hover:border-primary/30 group-hover:bg-primary/15
                     transition-all duration-300 mb-5"
          aria-hidden
        >
          <div className="text-white/70 group-hover:text-primary transition-colors duration-300">
            {card.icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="mb-3 font-semibold text-white text-lg sm:text-xl group-hover:text-primary/90 transition-colors duration-300">
          {card.title}
        </h3>
        <p className="text-white/60 leading-relaxed text-sm sm:text-base">
          {card.description}
        </p>
      </div>
    </div>
  );
});

// ============================================================
// Main Component
// ============================================================
export default function TargetAudience() {
  return (
    <section
      id="target-audience"
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
            Made for real creators who need real results
          </h2>
          <p className="text-lg sm:text-xl text-[#FFFFFF80] max-w-2xl mx-auto">
            Built for anyone who wants faster production and higher CTR.
          </p>
        </div>

        {/* Cards Grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {AUDIENCE_CARDS.map((card, index) => (
            <AudienceCardComponent key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
