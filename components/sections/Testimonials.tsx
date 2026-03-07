"use client";

import { Monitor, Tv, Video } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
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

const PLATFORM_ICONS: Record<string, typeof Tv> = {
  Twitch: Tv,
  YouTube: Video,
  Discord: Monitor,
};

const TESTIMONIAL_AVATARS = [
  "/avatar/avatar1.jpg",
  "/avatar/avatar2.jpg",
  "/avatar/avatar3.jpg",
];

function PlatformBadge({
  role,
  platform,
}: {
  role: string;
  platform?: string;
}) {
  const PlatformIcon = platform ? PLATFORM_ICONS[platform] : undefined;
  return (
    <p className="text-base-content/50 text-xs lg:text-sm truncate flex items-center gap-1">
      {role}
      {platform && (
        <>
          {" · "}
          {PlatformIcon ? (
            <span className="inline-flex items-center gap-1">
              <PlatformIcon className="w-3 h-3" />
              {platform}
            </span>
          ) : (
            platform
          )}
        </>
      )}
    </p>
  );
}

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
            <PlatformBadge
              role={testimonial.role}
              platform={testimonial.platform}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Testimonials({
  title,
  description,
  testimonials,
}: TestimonialsProps) {
  const t = useTranslations("testimonials");

  const resolvedTitle = title ?? t("title");
  const resolvedDescription = description ?? t("subtitle");
  const resolvedTestimonials =
    testimonials ??
    TESTIMONIAL_AVATARS.map((avatar, i) => ({
      id: String(i + 1),
      name: t(`items.${i}.name`),
      role: t(`items.${i}.role`),
      platform: t.has(`items.${i}.platform`)
        ? t(`items.${i}.platform`)
        : undefined,
      content: t(`items.${i}.content`),
      avatar,
    }));
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] text-base-content mb-6">
            {resolvedTitle}
          </h2>
          <p className="text-lg sm:text-xl text-base-content/50 max-w-2xl mx-auto">
            {resolvedDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resolvedTestimonials.map((testimonial, index) => (
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
