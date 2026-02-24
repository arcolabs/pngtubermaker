"use client";

import Link from "next/link";
import { useEffect } from "react";
import { UserCountBadge } from "@/components/ui/UserCountBadge";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function Hero() {
  const { user, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-8">
        <div className="text-center max-w-6xl mx-auto">
          <UserCountBadge />

          {/* Main Heading */}
          <h1 className="mb-3 sm:mb-4 text-gray-900 font-bold text-3xl sm:text-5xl lg:text-7xl leading-tight px-2 sm:px-0">
            From <span className="text-primary">Idea</span> to{" "}
            <span className="text-primary">Live Stream</span> in Minutes.
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-5xl mx-auto px-4 sm:px-0 mb-6">
            Create your PNGTuber avatar, generate expressions, and go live with
            real-time mic lip sync in OBS — all without drawing a single line.
          </p>

          {/* Auth-aware CTA buttons */}
          {isHydrated && (
            <div className="flex items-center justify-center gap-3 mb-8">
              {user ? (
                <>
                  <Link href="/create" className="btn btn-primary">
                    Create PNGTuber
                  </Link>
                  <Link href="/dashboard" className="btn btn-outline">
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-primary">
                    Get Started Free
                  </Link>
                  <Link href="/pricing" className="btn btn-outline">
                    See Pricing
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Product Showcase Video */}
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xl">
            <div className="aspect-video">
              <iframe
                src="/showcase"
                className="w-full h-full"
                title="PNGTuberMaker Showcase"
              />
            </div>
          </div>

          <p className="text-center mt-4 text-sm text-gray-500">
            <a
              href="/showcase"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline"
            >
              View fullscreen demo →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
