"use client";

import { memo } from "react";

// ============================================================
// Sub-components
// ============================================================

const PhilosophyCard = memo(function PhilosophyCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden
                 border border-white/10 
                 shadow-[inset_0_0_16px_rgba(240,247,245,0.05)]
                 hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                 hover:border-white/20
                 hover:bg-white/5
                 transition-all duration-300 ease-in-out
                 p-6 sm:p-8 backdrop-blur-sm"
    >
      {/* Gradient border overlay */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#FF0033]/10 border border-[#FF0033]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/60 leading-relaxed">{description}</p>
      </div>
    </div>
  );
});

const StepCard = memo(function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Step number */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#FF0033] flex items-center justify-center text-xs font-bold text-white shadow-lg z-10">
        {step}
      </div>

      {/* Icon container */}
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        {icon}
      </div>

      {/* Content */}
      <h4 className="text-base font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-white/50 max-w-[200px]">{description}</p>
    </div>
  );
});

// ============================================================
// Main Component
// ============================================================
export default function StealPhilosophy() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28 lg:py-32 overflow-hidden scroll-mt-16"
    >
      {/* Background subtle gradient - smooth top transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF0033]/[0.03] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Style Learning Mode
          </div>

          {/* Main headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center leading-[1.1] mb-6">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
              }}
            >
              Learn from the best.
            </span>
            <br />
            <span className="text-[#FF5555]">Create your masterpiece.</span>
          </h2>

          {/* Subheadline */}
          <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-[#FFFFFF80] leading-relaxed">
            Upload any YouTube thumbnail as inspiration. Our AI analyzes the
            style, composition, and visual language — then helps you recreate it
            with your own face, message, and brand.
          </p>
        </div>

        {/* Philosophy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          <PhilosophyCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#FF5555]"
              >
                <title>Learning icon</title>
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
            title="Not Copying. Learning."
            description="Every great artist studies masters. Picasso learned from African art. YouTube creators can learn from viral thumbnails. We make it instant."
          />

          <PhilosophyCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#FF5555]"
              >
                <title>Analysis icon</title>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            }
            title="AI Decodes Design"
            description="Our AI identifies what makes a thumbnail click-worthy: color psychology, text placement, facial expressions, contrast, and composition."
          />

          <PhilosophyCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#FF5555]"
              >
                <title>Transformation icon</title>
                <path d="M12 3v18" />
                <path d="m17 8-5-5-5 5" />
                <path d="m17 16-5 5-5-5" />
              </svg>
            }
            title="Your Unique Version"
            description="Same proven formula, completely different content. Your face, your message, your brand. Stand on the shoulders of giants."
          />
        </div>

        {/* How it Works Steps */}
        <div className="relative mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
              How It Works
            </h3>
            <p className="text-white/50">
              Three simple steps to thumbnail mastery
            </p>
          </div>

          {/* Steps with connector line */}
          <div className="relative">
            {/* Connector line - hidden on mobile */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
              <StepCard
                step={1}
                title="Upload Inspiration"
                description="Paste a YouTube URL or upload any thumbnail image that catches your eye"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/60"
                  >
                    <title>Upload icon</title>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                }
              />

              <StepCard
                step={2}
                title="AI Analyzes Style"
                description="Our AI breaks down the visual DNA: colors, fonts, layout, expressions, lighting"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/60"
                  >
                    <title>Analyze icon</title>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                    <path d="M11 8v6" />
                    <path d="M8 11h6" />
                  </svg>
                }
              />

              <StepCard
                step={3}
                title="Generate Yours"
                description="Add your photo and message. Get multiple variations following the same winning formula"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/60"
                  >
                    <title>Generate icon</title>
                    <path d="M12 3v18" />
                    <path d="M3 12h18" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF0033] to-[#FF5555] border-2 border-black flex items-center justify-center text-xs font-bold text-white">
                1
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5555] to-[#FF7777] border-2 border-black flex items-center justify-center text-xs font-bold text-white">
                2
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7777] to-white border-2 border-black flex items-center justify-center text-xs font-bold text-[#FF0033]">
                3
              </div>
            </div>
            <p className="text-white/80 text-sm sm:text-base">
              <span className="font-semibold text-white">Steal smart.</span>{" "}
              Upload a viral thumbnail and see the magic.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
