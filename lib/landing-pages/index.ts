import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defaultLocale } from "@/lib/i18n/config";
import type { LandingPageData } from "./types";

export type {
  LandingBreadcrumb,
  LandingComparison,
  LandingCTA,
  LandingFeature,
  LandingPageData,
  LandingPageHero,
  LandingPlatformSpecs,
  LandingProse,
  LandingShowcase,
  LandingStep,
  RelatedPage,
} from "./types";
export { generateLandingJsonLd } from "./types";

const LANDING_SLUGS = [
  "vtuber-maker",
  "style-anime",
  "guides-how-to-make-a-pngtuber",
  "free-pngtuber-maker",
  "for-discord",
  "for-twitch",
  "for-youtube",
] as const;

export type LandingSlug = (typeof LANDING_SLUGS)[number];

/**
 * Load landing page data for a given locale and slug.
 * Falls back to English if the locale file doesn't exist.
 */
export function getLandingPage(
  locale: string,
  slug: LandingSlug,
): LandingPageData {
  const messagesDir = join(process.cwd(), "messages");
  const filename = `landing-${slug}.json`;

  // Try locale-specific file first, fall back to English
  for (const loc of [locale, defaultLocale]) {
    try {
      const filePath = join(messagesDir, loc, filename);
      return JSON.parse(readFileSync(filePath, "utf-8")) as LandingPageData;
    } catch {}
  }

  throw new Error(`Landing page data not found for slug: ${slug}`);
}

/** Get all available landing page slugs */
export function getLandingSlugs(): readonly LandingSlug[] {
  return LANDING_SLUGS;
}
