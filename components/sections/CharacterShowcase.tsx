"use client";

import { Wand2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const exampleImages = [
  {
    src: "/images/showcase/1.WEBP",
    alt: "Character example 1",
  },
  {
    src: "/images/showcase/2.WEBP",
    alt: "Character example 2",
  },
  {
    src: "/images/showcase/3.WEBP",
    alt: "Character example 3",
  },
  {
    src: "/images/showcase/4.WEBP",
    alt: "Character example 4",
  },
  {
    src: "/images/showcase/5.WEBP",
    alt: "Character example 5",
  },
  {
    src: "/images/showcase/6.WEBP",
    alt: "Character example 6",
  },
  {
    src: "/images/showcase/7.WEBP",
    alt: "Character example 7",
  },
  {
    src: "/images/showcase/8.WEBP",
    alt: "Character example 8",
  },
];

export default function CharacterShowcase() {
  const [inputValue, setInputValue] = useState("");

  // Split images into 4 columns (2 images per column)
  const columns = [
    [exampleImages[0], exampleImages[1]],
    [exampleImages[2], exampleImages[3]],
    [exampleImages[4], exampleImages[5]],
    [exampleImages[6], exampleImages[7]],
  ];

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
                placeholder="Design your character (e.g., magical girl with green hair and elf ears)"
                className="w-full bg-transparent text-sm md:text-base font-normal text-gray-900 placeholder:text-gray-500/70 outline-none pr-4"
                aria-label="Design your character"
              />

              {/* Mobile Button */}
              <button
                type="button"
                className="flex sm:hidden items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors shadow-md flex-shrink-0"
              >
                <Wand2 className="w-4 h-4" />
              </button>

              {/* Desktop Button - Added whitespace-nowrap */}
              <button
                type="button"
                className="hidden sm:flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors shadow-lg text-sm md:text-base font-medium whitespace-nowrap flex-shrink-0"
              >
                <Wand2 className="w-4 h-4 flex-shrink-0" />
                <span>Create Character</span>
              </button>
            </div>
          </div>
        </div>

        {/* Character Examples Gallery */}
        <div className="relative mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mx-auto">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-4">
                {column.map((image, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-white aspect-square">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
