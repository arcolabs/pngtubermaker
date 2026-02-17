"use client";

import { memo } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
}

interface TestimonialsProps {
  title?: string;
  description?: string;
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Alex Thompson",
    role: "Full Stack Developer",
    company: "Tech Startup",
    content:
      "This template saved me hours of setup time. Everything is configured and ready to go. I was able to ship my MVP in a fraction of the time.",
  },
  {
    id: "2",
    name: "Jordan Lee",
    role: "Indie Hacker",
    company: "Solo Founder",
    content:
      "The authentication and database setup was seamless. Finally, a starter template that actually works out of the box.",
  },
  {
    id: "3",
    name: "Sam Rivera",
    role: "Engineering Lead",
    company: "Digital Agency",
    content:
      "We use this template for all our client projects. The code quality is excellent and it's easy to customize. Highly recommended.",
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
    <div className="card border border-base-content/10 hover:border-base-content/20 transition-colors">
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

        <p className="text-base-content/70 leading-relaxed text-sm lg:text-base flex-1">
          "{testimonial.content}"
        </p>

        <div className="flex items-center gap-4 mt-4">
          <div className="avatar placeholder">
            <div className="bg-primary/10 text-primary border border-primary/20 w-12 rounded-full">
              <span className="text-lg">
                {testimonial.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base-content font-semibold text-sm lg:text-base truncate">
              {testimonial.name}
            </h4>
            <p className="text-base-content/50 text-xs lg:text-sm truncate">
              {testimonial.role}
              {testimonial.company && ` \u00B7 ${testimonial.company}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Testimonials({
  title = "What Developers Are Saying",
  description = "Join thousands of developers who use this template for their projects.",
  testimonials = DEFAULT_TESTIMONIALS,
}: TestimonialsProps) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] text-base-content mb-6">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-base-content/50 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
