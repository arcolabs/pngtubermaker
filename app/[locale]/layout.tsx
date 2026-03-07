import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  // biome-ignore lint/suspicious/noExplicitAny: next-intl locale validation
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale as Locale);

  return (
    <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
