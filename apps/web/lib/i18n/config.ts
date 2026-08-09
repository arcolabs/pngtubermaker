export const locales = [
  "en",
  "zh-CN",
  "ja",
  "ko",
  "es",
  "fr",
  "de",
  "pt-BR",
  "it",
  "ru",
  "ar",
  "hi",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  "zh-CN": "\u4e2d\u6587",
  ja: "\u65e5\u672c\u8a9e",
  ko: "\ud55c\uad6d\uc5b4",
  es: "Espa\u00f1ol",
  fr: "Fran\u00e7ais",
  de: "Deutsch",
  "pt-BR": "Portugu\u00eas",
  it: "Italiano",
  ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
  ar: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
  hi: "\u0939\u093f\u0928\u094d\u0926\u0940",
};

export const rtlLocales: Locale[] = ["ar"];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

/** Map locale to OpenGraph locale format */
export function getOgLocale(locale: Locale): string {
  const map: Record<string, string> = {
    en: "en_US",
    "zh-CN": "zh_CN",
    ja: "ja_JP",
    ko: "ko_KR",
    es: "es_ES",
    fr: "fr_FR",
    de: "de_DE",
    "pt-BR": "pt_BR",
    it: "it_IT",
    ru: "ru_RU",
    ar: "ar_SA",
    hi: "hi_IN",
  };
  return map[locale] ?? "en_US";
}
