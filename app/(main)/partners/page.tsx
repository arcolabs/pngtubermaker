import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { listActivePartners } from "@/lib/services/partners";

export const metadata: Metadata = {
  title: "Partners | PNGTuberMaker",
  description: "Our amazing partners and friends in the creator ecosystem.",
};

export default async function PartnersPage() {
  const partners = await listActivePartners();

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Our Partners
          </h1>
          <p className="text-gray-500 mt-3">
            Tools, platforms, and communities we love and recommend.
          </p>
        </div>

        {partners.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No partners listed yet. Check back soon!
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-6 bg-white rounded-2xl p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.15)] hover:border-primary/20 transition-all duration-300"
              >
                {/* Left: Logo */}
                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  {partner.badgeHtml ? (
                    <div
                      className="w-full h-full flex items-center justify-center p-2"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Admin-only input
                      dangerouslySetInnerHTML={{ __html: partner.badgeHtml }}
                    />
                  ) : partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={`${partner.name} logo`}
                      width={112}
                      height={112}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-gray-300">
                      {partner.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {partner.name}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary transition-all duration-300 flex-shrink-0 mt-1" />
                  </div>

                  {partner.description && (
                    <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed">
                      {partner.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 group-hover:text-primary/70 transition-colors">
                    <span className="truncate">
                      {(() => {
                        try {
                          return new URL(partner.url).hostname;
                        } catch {
                          return partner.url;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
