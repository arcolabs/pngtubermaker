"use client";

import Image from "next/image";

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

const defaultTestimonials: Testimonial[] = [
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

export default function Testimonials({
  title = "What Creators Are Saying",
  description = "Join thousands of creators who trust Thumb-Free for their thumbnail needs.",
  testimonials = defaultTestimonials,
}: TestimonialsProps) {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          <h2
            className="font-semibold text-3xl lg:text-4xl text-center leading-[1.1] bg-clip-text text-transparent mb-4"
            style={{
              backgroundImage:
                "radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
            }}
          >
            {title}
          </h2>
          <p className="text-base sm:text-lg text-[#FFFFFF80]">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-[#1A1A1A] rounded-xl border border-border p-6 lg:p-8 hover:border-[#FF5555]/50 transition-all duration-300 opacity-0 animate-fade-in-up flex flex-col"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: "forwards",
              }}
            >
              {/* Content */}
              <div className="flex-1 mb-6">
                <p className="text-[#FFFFFF80] leading-relaxed text-sm lg:text-base">
                  "{testimonial.content}"
                </p>
              </div>

              {/* Author - Fixed at bottom */}
              <div className="flex items-center gap-4 mt-auto">
                {testimonial.avatar ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-background border border-border flex-shrink-0">
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
                  <div className="w-12 h-12 rounded-full bg-[#FF0000]/20 border border-[#FF0000]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm lg:text-base truncate">
                    {testimonial.name}
                  </h4>
                  <p className="text-[#FFFFFF80] text-xs lg:text-sm truncate">
                    {testimonial.role}
                    {testimonial.company && ` • ${testimonial.company}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
