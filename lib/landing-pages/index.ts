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
const landingPageCache = new Map<string, LandingPageData>();

function readLandingPage(filePath: string): LandingPageData {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as LandingPageData;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      throw err;
    }
    throw new Error(
      `Failed to parse landing page file: ${filePath}. ${(error as Error).message}`,
      { cause: error },
    );
  }
}

/**
 * Load landing page data for a given locale and slug.
 * Falls back to English if the locale file doesn't exist.
 */
export function getLandingPage(
  locale: string,
  slug: LandingSlug,
): LandingPageData {
  const cacheKey = `${locale}:${slug}`;
  const cached = landingPageCache.get(cacheKey);
  if (cached) return cached;

  const messagesDir = join(process.cwd(), "messages");
  const filename = `landing-${slug}.json`;
  const localizedPath = join(messagesDir, locale, filename);
  const defaultPath = join(messagesDir, defaultLocale, filename);

  try {
    const page = readLandingPage(localizedPath);
    landingPageCache.set(cacheKey, page);
    return page;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      throw error;
    }
  }

  try {
    const fallbackPage = readLandingPage(defaultPath);
    landingPageCache.set(cacheKey, fallbackPage);
    return fallbackPage;
  } catch (error) {
    throw new Error(
      `Landing page data not found for locale "${locale}" and slug "${slug}". Checked: ${localizedPath}, ${defaultPath}`,
      { cause: error },
    );
  }
}

/** Get all available landing page slugs */
export function getLandingSlugs(): readonly LandingSlug[] {
  return LANDING_SLUGS;
}
