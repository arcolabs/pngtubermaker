"use client";

import Link from "next/link";
import { memo } from "react";

// ============================================================
// Types
// ============================================================
interface CTAProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

// ============================================================
// Sub-components
// ============================================================
const CTAButton = memo(function CTAButton({
  buttonText,
  buttonHref,
  onButtonClick,
}: {
  buttonText: string;
  buttonHref: string;
  onButtonClick?: () => void;
}) {
  const buttonContent = (
    <>
      {/* Animated background shine */}
      <div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                    bg-gradient-to-r from-transparent via-white/20 to-transparent 
                    transition-transform duration-1000 ease-in-out"
      />

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-[#FF0033]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      <span className="relative font-bold text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
        {buttonText}
        <svg
          className="w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Arrow</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </span>
    </>
  );

  const buttonClassName = `group relative inline-flex items-center justify-center gap-2 
    rounded-full px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto
    bg-gradient-to-r from-[#FF0033] via-[#FF2244] to-[#FF3355]
    border border-white/30
    shadow-lg shadow-[#FF0033]/25
    transition-all duration-300 ease-out
    hover:scale-[1.03] hover:shadow-xl hover:shadow-[#FF0033]/40
    hover:border-white/50
    active:scale-[0.98] active:duration-100
    overflow-hidden`;

  if (onButtonClick) {
    return (
      <button
        type="button"
        onClick={onButtonClick}
        className={buttonClassName}
        aria-label={buttonText}
      >
        {buttonContent}
      </button>
    );
  }

  return (
    <Link href={buttonHref} className={buttonClassName} aria-label={buttonText}>
      {buttonContent}
    </Link>
  );
});

// ============================================================
// Main Component
// ============================================================
export default function CTA({
  title = "Say Goodbye to 10 of 10s",
  subtitle = "Try Thumb-Free for Free.",
  description = "Shortcut your way to millions of views.",
  buttonText = "Try for Free",
  buttonHref = "/auth/start",
  onButtonClick,
}: CTAProps) {
  return (
    <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/3 to-transparent"
            aria-hidden="true"
          />

          {/* Glow effect */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 0, 0, 0.15), transparent)",
            }}
            aria-hidden="true"
          />

          {/* Border */}
          <div
            className="absolute inset-0 rounded-3xl border border-white/10"
            aria-hidden="true"
          />

          {/* Gradient border on hover */}
          <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Content */}
          <div className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-8 lg:px-16 text-center">
            {/* Tag */}
            <span
              className="inline-block px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium
                           bg-[#FF0033]/10 text-[#FF0033] border border-[#FF0033]/20
                           mb-4 sm:mb-6"
            >
              Get Started Today
            </span>

            {/* Heading */}
            <h2
              className="text-2xl sm:text-3xl lg:text-5xl font-semibold text-center leading-[1.1] mb-4 sm:mb-6 bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
              }}
            >
              {title}
              <br className="hidden sm:block" />
              <span className="mt-1 sm:mt-2 inline-block">{subtitle}</span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-[#FFFFFF80] max-w-2xl mx-auto mb-8 sm:mb-10">
              {description}
            </p>

            {/* CTA Button */}
            <CTAButton
              buttonText={buttonText}
              buttonHref={buttonHref}
              onButtonClick={onButtonClick}
            />

            {/* Trust badges */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/50">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Check</title>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                No credit card required
              </span>
              <span className="hidden sm:inline text-white/20">•</span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Check</title>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Unlimited generations
              </span>
              <span className="hidden sm:inline text-white/20">•</span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Check</title>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                100% Free
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
