"use client";

import {
  ArrowUp,
  Check,
  Copy,
  FileText,
  Image,
  MessageSquare,
  Monitor,
  MousePointer,
  Palette,
  Repeat,
  Sparkles,
  Volume2,
  Wand2,
} from "lucide-react";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

const tools = [
  {
    id: "avatar_generation",
    title: "AI Avatar Generation",
    description:
      "Turn text or sketches into a professional avatar. Upload a description or reference, get 4 unique characters with transparent backgrounds, ready for OBS/Discord.",
    icon: Sparkles,
    image: "/images/AITools/input_1.jpg",
    features: [
      { icon: FileText, text: "Text descriptions" },
      { icon: Image, text: "Reference images" },
      { icon: Copy, text: "4 candidates generated" },
      { icon: Check, text: "Transparent background" },
    ],
    benefit: "No artist needed, minutes to your unique character",
  },
  {
    id: "expression_pack",
    title: "Expression Pack Auto-Creation",
    description:
      "All emotions, one click. Happy, angry, sad, surprised — AI generates consistent expressions for your avatar without hiring an artist.",
    icon: Palette,
    image: "/images/AITools/input_2.png",
    features: [
      { icon: Wand2, text: "Auto-generate emotions" },
      { icon: Copy, text: "Character consistency" },
      { icon: MousePointer, text: "Manual selection" },
      { icon: Repeat, text: "Variation options" },
    ],
    benefit: "Skip commissioning multiple expressions, save time & cost",
  },
  {
    id: "animation_stills",
    title: "Animation from Stills",
    description:
      "Bring your avatar to life. AI adds blinking, mouth movements, and emotional transitions. Export as MP4/GIF/WebM for instant streaming use.",
    icon: Monitor,
    image: "/images/AITools/input_3.webm",
    isVideo: true,
    features: [
      { icon: Sparkles, text: "Blinking animations" },
      { icon: Volume2, text: "Mouth movements" },
      { icon: MessageSquare, text: "Emotion transitions" },
      { icon: ArrowUp, text: "Multiple export formats" },
    ],
    benefit: "Instant broadcast-ready content for Twitch/YouTube",
  },
  {
    id: "smart_upscale",
    title: "Smart Upscale & Variations",
    description:
      "Polish until perfect. Upscale for HD quality, explore endless variations, and refine until you find your unique streaming persona.",
    icon: ArrowUp,
    image: "/images/AITools/input_4.webm",
    isVideo: true,
    features: [
      { icon: ArrowUp, text: "High-resolution upscale" },
      { icon: Check, text: "Quality preservation" },
      { icon: Copy, text: "Generate variations" },
      { icon: Repeat, text: "Iterative refinement" },
    ],
    benefit: "Perfect your unique character through continuous refinement",
  },
];

export default function AITools() {
  const [activeTab, setActiveTab] = useState("avatar_generation");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    tools.forEach((tool) => {
      const el = document.getElementById(tool.id);
      if (el) {
        sectionRefs.current[tool.id] = el;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="py-20 md:py-24" id="ai-tools">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <p className="text-xs md:text-sm font-semibold uppercase text-primary mb-2">
              AI Tools for Streamers
            </p>
            <h2 className="text-base-content font-sans mb-4 md:mb-5 text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              Create Your PNGTuber Avatar in Minutes — Not Weeks
            </h2>
            <p className="text-base-content/70 font-medium mb-6 md:mb-8 text-base md:text-xl leading-relaxed max-w-3xl mx-auto">
              Generate avatars, expressions, and animations instantly with AI.
              No commissions. No waiting. Just stream-ready results.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 md:mb-8">
            <div className="sticky top-0 z-10 backdrop-blur-sm md:border-b border-base-300 mb-8 md:mb-12 bg-base-100/95">
              <div className="px-3 py-3 md:px-4 md:py-4">
                {/* Mobile Tabs */}
                <div className="md:hidden">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {tools.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = activeTab === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => scrollToSection(tool.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                            isActive
                              ? "bg-primary text-white shadow-md"
                              : "bg-base-300 text-base-content/70 hover:bg-base-300/80"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>
                            {tool.id === "avatar_generation" && "Generate"}
                            {tool.id === "expression_pack" && "Expressions"}
                            {tool.id === "animation_stills" && "Animate"}
                            {tool.id === "smart_upscale" && "Upscale"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden md:flex gap-2 justify-center flex-wrap">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTab === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => scrollToSection(tool.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                          isActive
                            ? "bg-primary text-white shadow-lg"
                            : "text-base-content/70 hover:text-base-content hover:bg-base-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tool.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Feature Content Sections */}
            <div className="space-y-8 md:space-y-14">
              {tools.map((tool, index) => {
                const Icon = tool.icon;
                const isReversed = index % 2 === 1;

                return (
                  <section
                    key={tool.id}
                    id={tool.id}
                    className="scroll-mt-32 md:scroll-mt-40"
                  >
                    <div className="block bg-base-100 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-base-300">
                      <div className="block md:grid md:grid-cols-2 md:gap-0">
                        {/* Media */}
                        <div
                          className={`bg-gradient-to-br bg-primary/10 to-base-200 w-full h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 flex items-center justify-center overflow-hidden md:p-6 lg:p-8 relative ${
                            isReversed ? "md:order-2" : ""
                          }`}
                        >
                          {tool.isVideo ? (
                            <video
                              src={tool.image}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full rounded-lg object-cover object-center"
                            />
                          ) : (
                            <NextImage
                              src={tool.image}
                              alt={tool.title}
                              fill
                              className="rounded-lg object-cover object-center"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div
                          className={`p-4 md:p-8 flex flex-col justify-center ${
                            isReversed ? "md:order-1" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                              <Icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold text-base-content leading-tight">
                              {tool.title}
                            </h3>
                          </div>

                          <p className="text-sm md:text-base text-base-content/70 mb-4 md:mb-6 leading-relaxed">
                            {tool.description}
                          </p>

                          {/* Feature Grid */}
                          <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-3 mb-4 md:mb-6">
                            {tool.features.map((feature, idx) => {
                              const FeatureIcon = feature.icon;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-base-200 rounded-lg"
                                >
                                  <div className="text-primary flex-shrink-0">
                                    <FeatureIcon className="w-4 h-4" />
                                  </div>
                                  <span className="text-base-content text-xs md:text-sm font-medium">
                                    {feature.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center text-primary font-medium text-sm md:text-base">
                              <Check className="w-4 h-4 mr-1" />
                              {tool.benefit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
