import Link from "next/link";
import { UserCountBadge } from "@/components/ui/UserCountBadge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
        <div className="text-center max-w-6xl mx-auto">
          <UserCountBadge />

          {/* Main Heading */}
          <h1 className="mb-4 text-white font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Free Your Thumbnails. Grow Your Channel.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#FFFFFF80] max-w-5xl mx-auto mb-6">
            Enter your video title, upload your photo, and let Thumb-Free handle
            the rest. Pro-level branding for creators who value their time.
          </p>

          {/* CTA Button */}
          <Link
            href="/auth/start"
            className="group relative inline-flex items-center gap-3 rounded-2xl 
                       bg-gradient-to-r from-[#FF0033] via-[#FF2244] to-[#FF3355]
                       px-8 sm:px-10 py-4 sm:py-5
                       transition-all duration-300 ease-out
                       hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#FF0033]/30
                       active:scale-[0.98] active:duration-100
                       border border-white/20 hover:border-white/30
                       overflow-hidden"
          >
            {/* Animated background shine */}
            <div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                          bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          transition-transform duration-1000 ease-in-out"
            />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-[#FF0033]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            {/* Sparkle icon */}
            <svg
              className="relative w-5 h-5 text-white/90 group-hover:text-white group-hover:rotate-12 transition-all duration-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <title>Sparkle</title>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>

            <span className="relative font-bold text-lg sm:text-xl text-white tracking-wide">
              Generate Thumbnails
            </span>

            <span className="relative rounded-full bg-white/25 backdrop-blur-sm px-3 py-1.5 text-sm font-bold text-white border border-white/40 group-hover:bg-white/30 transition-colors">
              Free
            </span>

            {/* Arrow icon */}
            <svg
              className="relative w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
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
          </Link>
        </div>
      </div>
    </section>
  );
}
