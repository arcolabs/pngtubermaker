import Link from "next/link";
import { UserCountBadge } from "@/components/ui/UserCountBadge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-8">
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
            className="group relative inline-flex items-center gap-4 rounded-[16px] bg-gradient-to-r from-[#FF0033] to-[#FF3355] px-10 py-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/20"
          >
            <span className="font-bold text-lg text-white tracking-wide">
              Generate Thumbnails
            </span>

            <span className="rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-white border border-white/30">
              Free
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
