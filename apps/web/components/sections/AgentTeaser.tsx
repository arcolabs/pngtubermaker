import { ArrowRight, Bot } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AgentTeaser() {
  const t = await getTranslations("agentTeaser");
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-base-100 to-primary/10 p-8 md:p-12 text-center">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20 mb-6">
              <Bot className="w-3.5 h-3.5" />
              {t("badge")}
            </span>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content mb-4">
              {t("title")}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-base-content/60 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t("subtitle")}
            </p>

            {/* CTA */}
            <Link
              href="https://discord.gg/zysPAnvP8f"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm md:text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-200"
            >
              {t("cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
