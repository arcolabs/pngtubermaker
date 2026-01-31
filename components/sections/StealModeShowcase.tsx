"use client";

import Image from "next/image";

interface ThumbnailPair {
  id: string;
  from: string;
  to: string;
  fromAlt: string;
  toAlt: string;
}

const thumbnailPairs: ThumbnailPair[] = [
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

export default function StealModeShowcase() {
  return (
    <section className="relative overflow-hidden bg-background py-20 text-white lg:py-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-[#FF0000]/20 px-4 py-2 text-sm font-medium text-[#FF5555] border border-[#FF0000]/30">
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
              className="lucide lucide-infinity"
              aria-hidden="true"
            >
              <path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8"></path>
            </svg>
            Infinite Steal Mode
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl mb-6">
            We solve AI originality: <span className="text-[#FF5555]">steal it</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-[#FFFFFF80] leading-relaxed">
            Upload any thumbnail as inspiration. Our AI captures the style,
            composition, and vibe — then recreates it with your face and message.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative mt-16 overflow-hidden w-full">
        {/* Left gradient fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32"></div>
        {/* Right gradient fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32"></div>

        {/* Marquee - Scrolls from right to left (infinite loop) */}
        <div className="flex whitespace-nowrap">
          <div
            className="flex gap-6 flex-shrink-0 animate-scroll-left"
            style={{
              willChange: "transform",
            }}
          >
            {/* Duplicate items for seamless loop - need at least 2 sets for infinite scroll */}
            {[...thumbnailPairs, ...thumbnailPairs].map((pair, index) => (
            <div
              key={`${pair.id}-${index}`}
              className="group shrink-0 rounded-2xl border border-border bg-[#1A1A1A]/50 p-4 backdrop-blur-sm hover:border-[#FF0000]/30 transition-all duration-300"
            >
              {/* Original thumbnail */}
              <div className="relative aspect-video w-[200px] overflow-hidden rounded-lg sm:w-[240px] md:w-[280px]">
                <Image
                  src={pair.from}
                  alt={pair.fromAlt}
                  fill
                  className="object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                  sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
                />
              </div>

              {/* Arrow separator */}
              <div className="my-4 flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-border"></div>
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
                  className="text-[#FF5555]"
                  aria-hidden="true"
                >
                  <path d="M12 5v14"></path>
                  <path d="m19 12-7 7-7-7"></path>
                </svg>
                <div className="h-px flex-1 bg-border"></div>
              </div>

              {/* AI generated thumbnail */}
              <div className="relative aspect-video w-[200px] overflow-hidden rounded-lg ring-2 ring-[#FF5555] ring-offset-2 ring-offset-background sm:w-[240px] md:w-[280px] transition-all duration-300 group-hover:ring-[#FF0000]">
                <Image
                  src={pair.to}
                  alt={pair.toAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
                />
              </div>
            </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-12 flex items-center justify-center gap-2">
        <p className="leading-7 text-[#FFFFFF80]">
          Same style. Your face. <span className="font-semibold text-white">Every time.</span>
        </p>
      </div>
    </section>
  );
}
