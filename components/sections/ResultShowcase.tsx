"use client";

import { ArrowRight, FileText, Monitor, Palette } from "lucide-react";
import Image from "next/image";

const STEPS = [
  {
    step: 1,
    title: "Describe your character",
    description:
      "Type a short description or upload a reference image. The AI generates 4 unique options to choose from.",
    icon: FileText,
    media: { type: "image" as const, src: "/images/AITools/input_1.jpg" },
  },
  {
    step: 2,
    title: "Get expressions automatically",
    description:
      "One click generates a full expression pack — happy, angry, sad, surprised — all in your character's style.",
    icon: Palette,
    media: { type: "image" as const, src: "/images/AITools/input_2.png" },
  },
  {
    step: 3,
    title: "Go live on stream",
    description:
      "Paste a single Browser Source link into OBS. Your avatar lip-syncs to your mic in real time.",
    icon: Monitor,
    media: { type: "video" as const, src: "/images/AITools/input_3.webm" },
  },
];

export default function ResultShowcase() {
  return (
    <section className="py-20 md:py-24" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <p className="text-xs md:text-sm font-semibold uppercase text-primary mb-2">
              How It Works
            </p>
            <h2 className="text-base-content font-sans text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">
              From Idea to Live Stream in 3 Steps
            </h2>
            <p className="text-base-content/70 text-base md:text-lg max-w-2xl mx-auto">
              No commissions. No waiting. Just describe, generate, and stream.
            </p>
          </div>

          {/* 3-Step Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  {/* Arrow connector (desktop only) */}
                  {idx < STEPS.length - 1 && (
                    <div className="hidden md:flex absolute -right-4 top-1/3 z-10 text-primary/40">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}

                  <div className="rounded-xl border border-base-300 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                    {/* Media */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 to-base-200">
                      {step.media.type === "video" ? (
                        <video
                          src={step.media.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={step.media.src}
                          alt={step.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold shrink-0">
                          {step.step}
                        </div>
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-base-content mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-base-content/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
