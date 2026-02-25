import Link from "next/link";
import type { LandingCTA } from "@/lib/landing-pages";

export default function FinalCTA({ cta }: { cta: LandingCTA }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-base-200 p-8 sm:p-12 lg:p-16 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {cta.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            {cta.subtitle}
          </p>
          <Link
            href={cta.ctaHref}
            className="btn btn-primary btn-lg text-base px-8"
          >
            {cta.ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
