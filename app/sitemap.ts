import type { MetadataRoute } from "next";
import { defaultLocale, type Locale, locales } from "@/lib/i18n/config";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pngtubermaker.com";

interface SitemapRoute {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  lastModified?: Date;
}

const staticRoutes: SitemapRoute[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/create", priority: 0.8, changeFrequency: "weekly" },
  { path: "/showcase", priority: 0.7, changeFrequency: "daily" },
  { path: "/partners", priority: 0.4, changeFrequency: "monthly" },
  { path: "/legal/terms", priority: 0.3, changeFrequency: "monthly" },
  { path: "/legal/privacy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/vtuber-maker", priority: 0.8, changeFrequency: "weekly" },
  { path: "/style/anime", priority: 0.7, changeFrequency: "weekly" },
  {
    path: "/guides/how-to-make-a-pngtuber",
    priority: 0.7,
    changeFrequency: "weekly",
  },
  { path: "/free-pngtuber-maker", priority: 0.8, changeFrequency: "weekly" },
  { path: "/for/discord", priority: 0.6, changeFrequency: "monthly" },
  { path: "/for/twitch", priority: 0.6, changeFrequency: "monthly" },
  { path: "/for/youtube", priority: 0.6, changeFrequency: "monthly" },
];

function getLocalizedUrl(path: string, locale: Locale): string {
  if (locale === defaultLocale) return `${baseUrl}${path}`;
  return `${baseUrl}/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const locale of locales) {
      const alternates: Record<string, string> = {};
      for (const altLocale of locales) {
        alternates[altLocale] = getLocalizedUrl(route.path, altLocale);
      }
      alternates["x-default"] = getLocalizedUrl(route.path, defaultLocale);

      entries.push({
        url: getLocalizedUrl(route.path, locale),
        lastModified: route.lastModified || new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
