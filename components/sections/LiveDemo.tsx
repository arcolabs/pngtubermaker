"use client";

import { Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DemoAvatar {
  src: string;
  alt: string;
  prompt: string;
  style: string;
}

const DEMO_AVATARS: DemoAvatar[] = [
  {
    src: "/images/showcase/fox_pngtuber.png",
    alt: "AI-generated fox PNGTuber avatar in chibi style",
    prompt:
      "orange fox ears, long wavy blue hair with star hairpins, glowing amber eyes, navy blue dress with constellations, holding a floating crystal ball",
    style: "Chibi",
  },
  {
    src: "/images/showcase/pinkbunny_pngtuber.png",
    alt: "AI-generated pink bunny PNGTuber avatar in anime style",
    prompt:
      "pink bunny ears, floral hair band, soft peach bob hair, emerald green eyes, oversized cream hoodie, holding a basket of strawberries",
    style: "Anime",
  },
  {
    src: "/images/showcase/sunflower_pngtuber.png",
    alt: "AI-generated sunflower PNGTuber avatar in cartoon style",
    prompt:
      "giant sunflower crown, mint green curly hair, bright yellow eyes, white sundress, holding a watering can, tiny yellow wings",
    style: "Cartoon",
  },
  {
    src: "/images/showcase/round1_idle.png",
    alt: "AI-generated magical girl PNGTuber avatar in anime style",
    prompt:
      "A classic magical girl with long, flowing golden twin-tails tied with large red silk bows. She has bright blue, expressive eyes and a heart-shaped face.",
    style: "Anime",
  },
  {
    src: "/images/showcase/round2_sad.png",
    alt: "AI-generated witch PNGTuber avatar in chibi style",
    prompt:
      "small witch, huge wizard hat, starry hair, galaxy eyes, navy blue dress, magical girl",
    style: "Chibi",
  },
  {
    src: "/images/showcase/round3_angry.png",
    alt: "AI-generated gothic PNGTuber avatar in pixel art style",
    prompt:
      "A young woman with voluminous, wavy dark brown hair and large brown eyes. She wears round glasses with silver sun-shaped pendants hanging from the frames.",
    style: "Pixel Art",
  },
];

const STYLE_TABS = ["All", "Chibi", "Anime", "Cartoon", "Pixel Art"] as const;

export default function LiveDemo() {
  const [activeStyle, setActiveStyle] = useState<string>("All");

  const filtered =
    activeStyle === "All"
      ? DEMO_AVATARS
      : DEMO_AVATARS.filter((a) => a.style === activeStyle);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">
          PNGTuber Avatars Created with AI
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
          Every avatar below was generated in seconds — no art skills required.
          Pick a style to explore.
        </p>

        {/* Style Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {STYLE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveStyle(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeStyle === tab
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((avatar) => (
            <div
              key={avatar.src}
              className="group relative aspect-square rounded-xl overflow-hidden border border-base-300 bg-base-200 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <Image
                src={avatar.src}
                alt={avatar.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
                <p className="text-white text-xs sm:text-sm leading-snug line-clamp-3 mb-2">
                  <span className="text-primary font-medium">"</span>
                  {avatar.prompt}
                  <span className="text-primary font-medium">"</span>
                </p>
                <Link
                  href={`/create?prompt=${encodeURIComponent(avatar.prompt)}`}
                  className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/80 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  Try this prompt
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/login"
            className="btn btn-primary border-0 text-white bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)]"
          >
            Create Yours Free
          </Link>
        </div>
      </div>
    </section>
  );
}
