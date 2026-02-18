"use client";

import Image from "next/image";
import { memo } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  platform?: string;
  content: string;
  avatar: string;
}

interface TestimonialsProps {
  title?: string;
  description?: string;
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Kira Stream",
    role: "VTuber",
    platform: "Twitch",
    content:
      "Finally found the perfect tool to create my PNGTuber avatar! The expressions are so smooth and my viewers love the new look. Set up took less than 10 minutes.",
    avatar: "/avatar/avatar_003.jpg",
  },
  {
    id: "2",
    name: "PixelGamer",
    role: "Content Creator",
    platform: "YouTube",
    content:
      "As someone who can't draw, this is a game-changer. My avatar looks professional and the auto-generated expressions match my voice perfectly. Highly recommend!",
    avatar: "/avatar/avatar_004.jpg",
  },
  {
    id: "3",
    name: "LunaLive",
    role: "Indie Streamer",
    platform: "Kick",
    content:
      "Switched from a complex Live2D setup to this and never looked back. It's lightweight, looks great, and saves me so much time. Best decision for my channel!",
    avatar: "/avatar/avatar_005.jpg",
  },
];

const TestimonialCard = memo(function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <div className="card border border-base-content/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg bg-white">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="text-primary/30">
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
          <span className="text-xs font-mono text-base-content/20">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <p className="text-base-content/70 leading-relaxed text-sm lg:text-base flex-1 mt-4">
          "{testimonial.content}"
        </p>

        <div className="flex items-center gap-4 mt-6">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 relative">
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base-content font-semibold text-sm lg:text-base truncate">
              {testimonial.name}
            </h4>
            <p className="text-base-content/50 text-xs lg:text-sm truncate">
              {testimonial.role}
              {testimonial.platform && ` · ${testimonial.platform}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Testimonials({
  title = "Loved by Streamers Worldwide",
  description = "Join thousands of content creators who transformed their streaming presence with PNGTuber avatars.",
  testimonials = DEFAULT_TESTIMONIALS,
}: TestimonialsProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] text-base-content mb-6">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-base-content/50 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
