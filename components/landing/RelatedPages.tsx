import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { RelatedPage } from "@/lib/landing-pages";

export default function RelatedPages({ pages }: { pages: RelatedPage[] }) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10 sm:mb-12">
          You Might Also Like
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group p-6 rounded-xl border border-base-300 bg-white hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {page.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{page.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn more
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
