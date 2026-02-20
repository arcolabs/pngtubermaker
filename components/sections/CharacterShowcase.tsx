"use client";

import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const exampleImages = [
  { id: "1", src: "/images/showcase/1.WEBP", alt: "Character example 1" },
  { id: "2", src: "/images/showcase/2.WEBP", alt: "Character example 2" },
  { id: "3", src: "/images/showcase/3.WEBP", alt: "Character example 3" },
  { id: "4", src: "/images/showcase/4.WEBP", alt: "Character example 4" },
  { id: "5", src: "/images/showcase/5.WEBP", alt: "Character example 5" },
  { id: "6", src: "/images/showcase/6.WEBP", alt: "Character example 6" },
  { id: "7", src: "/images/showcase/7.WEBP", alt: "Character example 7" },
  { id: "8", src: "/images/showcase/8.WEBP", alt: "Character example 8" },
];

export default function CharacterShowcase() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handleCreate = () => {
    const url = inputValue.trim()
      ? `/create?prompt=${encodeURIComponent(inputValue.trim())}`
      : "/create";
    router.push(url);
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Statistics - Changed to slogan */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Create your unique <span className="text-primary">PNGTuber</span>{" "}
            avatar in minutes
          </h2>
        </div>

        {/* Character Design Input and Action */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-5xl">
            <div className="relative flex items-center w-full h-14 md:h-16 pl-4 md:pl-6 pr-2 py-0 shadow-[0_4px_30px_rgba(6,182,212,0.25)] bg-white/70 backdrop-blur-xl backdrop-saturate-150 hover:bg-white/80 focus-within:bg-white/80 cursor-text rounded-full border-2 border-primary focus-within:border-primary transition-all duration-300 hover:shadow-[0_8px_40px_rgba(6,182,212,0.35)]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
                placeholder="Design your character (e.g., magical girl with green hair and elf ears)"
                className="w-full bg-transparent text-sm md:text-base font-normal text-gray-900 placeholder:text-gray-500/70 outline-none pr-4"
                aria-label="Design your character"
              />

              {/* Mobile Button */}
              <button
                type="button"
                onClick={handleCreate}
                className="flex sm:hidden items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors shadow-md flex-shrink-0"
              >
                <Wand2 className="w-4 h-4" />
              </button>

              {/* Desktop Button */}
              <button
                type="button"
                onClick={handleCreate}
                className="hidden sm:flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors shadow-lg text-sm md:text-base font-medium whitespace-nowrap flex-shrink-0"
              >
                <Wand2 className="w-4 h-4 flex-shrink-0" />
                <span>Create Character</span>
              </button>
            </div>
          </div>
        </div>

        {/* Character Examples Gallery - Masonry Layout */}
        <div className="relative mt-8">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 w-full max-w-6xl mx-auto">
            {exampleImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 break-inside-avoid animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto rounded-xl transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-xl" />
                {/* Subtle Border */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 group-hover:ring-black/10 transition-all duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
