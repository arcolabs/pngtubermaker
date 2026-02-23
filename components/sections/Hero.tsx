"use client";

import { UserCountBadge } from "@/components/ui/UserCountBadge";

export default function Hero() {
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
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-5xl mx-auto px-4 sm:px-0 mb-8">
            Create your PNGTuber avatar, generate expressions, and go live with
            real-time mic lip sync in OBS — all without drawing a single line.
          </p>

          {/* Video Player - 16:9 aspect ratio, auto loop, no controls */}
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <div className="aspect-video">
              <video
                className="w-full h-full object-cover opacity-0 animate-video-fade-in"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              >
                <source src="/videos/Thumbfree.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
