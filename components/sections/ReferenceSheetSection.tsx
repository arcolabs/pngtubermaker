"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function ReferenceSheetSection() {
  const t = useTranslations("referenceSheet");

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            {t("title.leading")}{" "}
            <span className="text-primary">{t("title.emphasis")}</span>{" "}
            {t("title.trailing")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-[0_8px_40px_rgba(6,182,212,0.15)]">
            <Image
              src="/images/reference-sheet/showcase.png"
              alt={t("imageAlt")}
              width={1024}
              height={1024}
              className="w-full h-auto"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
