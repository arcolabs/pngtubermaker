"use client";

import Image from "next/image";
import { memo } from "react";

// ============================================================
// Types
// ============================================================
interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
}

interface TestimonialsProps {
  title?: string;
  description?: string;
  testimonials?: Testimonial[];
}

// ============================================================
// Data
// ============================================================
const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Content Creator",
    company: "Tech Reviews",
    content:
      "Thumb-Free has completely transformed my workflow. I can create professional thumbnails in seconds without any design experience. The AI understands exactly what works for YouTube.",
    avatar: "/avatar/avatar_003.jpg",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    role: "YouTube Creator",
    company: "Gaming Channel",
    content:
      "The thumbnail grabber tool is a game-changer. I can quickly analyze what's working for competitors and adapt those styles. My CTR has improved significantly since using Thumb-Free.",
    avatar: "/avatar/avatar_004.jpg",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    company: "E-commerce Brand",
    content:
      "We use Thumb-Free for all our video content. The consistency across our thumbnails has helped build our brand recognition. It's fast, reliable, and the results speak for themselves.",
    avatar: "/avatar/avatar_005.jpg",
  },
];

// ============================================================
// Sub-components
// ============================================================
const TestimonialCard = memo(function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden
                 border border-white/10 
                 shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                 hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.2)]
                 hover:border-white/20
                 hover:bg-white/10
                 transition-all duration-300 ease-in-out
                 flex flex-col"
      style={{
        animationDelay: `${index * 150}ms`,
        animationFillMode: "forwards",
      }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Number badge */}
      <div className="absolute top-4 right-4 text-xs font-mono text-white/20 group-hover:text-primary/40 transition-colors duration-300">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Content */}
      <div className="relative p-6 lg:p-8 flex flex-col flex-1">
        {/* Quote icon */}
        <div className="mb-4 text-primary/30">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        <div className="flex-1 mb-6">
          <p className="text-white/70 leading-relaxed text-sm lg:text-base">
            "{testimonial.content}"
          </p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-4 mt-auto">
          {testimonial.avatar ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-primary/30 transition-colors">
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-lg">
                {testimonial.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm lg:text-base truncate group-hover:text-primary/90 transition-colors">
              {testimonial.name}
            </h4>
            <p className="text-white/50 text-xs lg:text-sm truncate">
              {testimonial.role}
              {testimonial.company && ` • ${testimonial.company}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================
// Main Component
// ============================================================
export default function Testimonials({
  title = "What Creators Are Saying",
  description = "Join thousands of creators who trust Thumb-Free for their thumbnail needs.",
  testimonials = DEFAULT_TESTIMONIALS,
}: TestimonialsProps) {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center leading-[1.1] mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
            }}
          >
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-[#FFFFFF80] max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Cards Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
