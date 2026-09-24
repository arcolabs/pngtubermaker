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
  /**
   * Whether this route has per-locale translated content. Defaults to true.
   *
   * Set `false` for pages that are English-only by construction: their copy is
   * hardcoded in the route file rather than loaded from `messages/<locale>/`,
   * so `/ja/<path>` serves the identical English body and canonicalises back to
   * the EN URL. Emitting 12 locale entries for such a page would add 12
   * unlisted-content URLs per route to the sitemap, growing the fake locale
   * fleet that `docs/context/seo-audit-2026-09-15.md` already flags as an open
   * policy question. One EN entry is the honest listing; the locale variants
   * stay reachable and still canonicalise correctly, they are just not
   * advertised. Flip to translated (or drop the flag) once the page gets real
   * per-locale content.
   */
  localized?: boolean;
}

const staticRoutes: SitemapRoute[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  // /create removed: it is auth-gated and 307s anonymous visitors (all
  // crawlers) to /login — a permanent redirect trap in the sitemap.
  { path: "/showcase", priority: 0.7, changeFrequency: "daily" },
  { path: "/partners", priority: 0.4, changeFrequency: "monthly" },
  { path: "/legal/terms", priority: 0.3, changeFrequency: "monthly" },
  { path: "/legal/privacy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/legal/refund", priority: 0.3, changeFrequency: "monthly" },
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
  // Shipped by the organic Work loop (PRs #5/#6/#7) but never registered here,
  // so they served 200 with real content that nothing reachable linked to and
  // the sitemap stayed at 14 x 12 = 168. A discoverability bug, not a broken
  // page; the footer links landed in the same change. Full record and the CI
  // ratchet that keeps it shut: docs/context/seo-audit-2026-09-24.md.
  //
  // Listed EN-only because their copy is hardcoded in the route file rather than
  // loaded via getLandingPage()/messages/<locale>/landing-*.json like the seven
  // registered landing pages, only shared sections localise, and each canonical
  // already points at the EN URL. See `localized` above.
  {
    path: "/pngtuber-models",
    priority: 0.7,
    changeFrequency: "weekly",
    localized: false,
  },
  {
    path: "/obs-pngtuber",
    priority: 0.7,
    changeFrequency: "weekly",
    localized: false,
  },
  {
    path: "/picrew-pngtuber-maker",
    priority: 0.7,
    changeFrequency: "weekly",
    localized: false,
  },
];

function getLocalizedUrl(path: string, locale: Locale): string {
  // Collapse "/" route paths so locale roots do not become ".../ja/" —
  // Next 308-redirects the trailing-slash form, making every locale-root
  // sitemap entry a redirect (a crawl trap).
  const clean = path === "/" ? "" : path;
  if (locale === defaultLocale) return `${baseUrl}${clean}`;
  return `${baseUrl}/${locale}${clean}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    // An EN-only route gets one entry and no language alternates. Advertising
    // hreflang for locales whose content does not exist is a false claim to the
    // crawler, and the page already canonicalises to the EN URL.
    if (route.localized === false) {
      entries.push({
        url: getLocalizedUrl(route.path, defaultLocale),
        ...(route.lastModified ? { lastModified: route.lastModified } : {}),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            "x-default": getLocalizedUrl(route.path, defaultLocale),
          },
        },
      });
      continue;
    }

    for (const locale of locales) {
      const alternates: Record<string, string> = {};
      for (const altLocale of locales) {
        alternates[altLocale] = getLocalizedUrl(route.path, altLocale);
      }
      alternates["x-default"] = getLocalizedUrl(route.path, defaultLocale);

      entries.push({
        url: getLocalizedUrl(route.path, locale),
        // Only emit lastmod when the route declares one. The old fallback
        // was a generation-time new Date(): on live (2026-09-15 probe) all
        // 180 entries shared one build instant (2026-09-11T22:53:19.8xx),
        // which devalues the freshness signal site-wide.
        ...(route.lastModified ? { lastModified: route.lastModified } : {}),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
