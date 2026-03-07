import type { FAQItem } from "../faq-data";

export interface LandingPageHero {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

export interface LandingFeature {
  icon: string; // lucide-react icon name mapped in FeatureGrid
  title: string;
  description: string;
}

export interface LandingStep {
  title: string;
  description: string;
}

export interface LandingCTA {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

export interface RelatedPage {
  title: string;
  description: string;
  href: string;
}

export interface LandingBreadcrumb {
  label: string;
  href?: string;
}

export interface LandingComparison {
  title: string;
  description?: string;
  columns: { label: string; highlight?: boolean }[];
  rows: { feature: string; values: (string | boolean)[] }[];
}

export interface LandingShowcase {
  title: string;
  description?: string;
  images: { src: string; alt: string; prompt: string }[];
}

export interface LandingPlatformSpecs {
  title: string;
  items: { label: string; value: string }[];
}

export interface LandingProse {
  title: string;
  blocks: { subtitle?: string; text: string }[];
}

export interface LandingPageData {
  slug: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    canonical: string;
  };
  hero: LandingPageHero;
  features?: {
    title: string;
    items: LandingFeature[];
  };
  steps?: {
    title: string;
    items: LandingStep[];
  };
  comparison?: LandingComparison;
  showcase?: LandingShowcase;
  platformSpecs?: LandingPlatformSpecs;
  prose?: LandingProse;
  faqs: FAQItem[];
  cta: LandingCTA;
  relatedPages: RelatedPage[];
  breadcrumbs: LandingBreadcrumb[];
}

const BASE_URL = "https://pngtubermaker.com";

export function generateLandingJsonLd(page: LandingPageData) {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumbs.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
    })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const webPageLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": page.steps ? "HowTo" : "WebPage",
    name: page.metadata.title,
    description: page.metadata.description,
    url: `${BASE_URL}${page.metadata.canonical}`,
    ...(page.steps
      ? {
          step: page.steps.items.map((s, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: s.title,
            text: s.description,
          })),
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "PNGTuberMaker",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.svg`,
      },
    },
  };

  return { breadcrumbLd, faqLd, webPageLd };
}
