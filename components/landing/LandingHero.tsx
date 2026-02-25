import Link from "next/link";
import type { LandingPageHero } from "@/lib/landing-pages";

export default function LandingHero({ hero }: { hero: LandingPageHero }) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wide text-primary bg-primary/10 rounded-full mb-6">
          {hero.badge}
        </span>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {hero.title}
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          {hero.subtitle}
        </p>

        <Link
          href={hero.ctaHref}
          className="btn btn-primary btn-lg text-base px-8"
        >
          {hero.ctaText}
        </Link>
      </div>
    </section>
  );
}
