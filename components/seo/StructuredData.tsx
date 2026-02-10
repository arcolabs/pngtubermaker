import Script from "next/script";

interface StructuredDataProps {
  type?: "organization" | "website" | "software";
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thumb-free.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Thumb-Free",
  url: baseUrl,
  logo: `${baseUrl}/logo.svg`,
  description:
    "Free AI-powered YouTube thumbnail generator. Create professional thumbnails in seconds.",
  sameAs: [
    // Add social media URLs when available:
    // "https://twitter.com/thumbfree",
    // "https://github.com/thumbfree",
    // "https://youtube.com/@thumbfree",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@thumb-free.com",
    availableLanguage: ["English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Thumb-Free",
  url: baseUrl,
  description:
    "Free AI YouTube Thumbnail Generator - Create professional thumbnails in seconds",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Thumb-Free",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
  },
  featureList: [
    "AI-powered thumbnail generation",
    "Multiple thumbnail variations",
    "YouTube thumbnail downloader",
    "Free unlimited generations",
    "No credit card required",
  ],
};

export default function StructuredData({
  type = "organization",
}: StructuredDataProps) {
  const schema: Record<string, unknown> =
    type === "organization"
      ? organizationSchema
      : type === "website"
        ? websiteSchema
        : type === "software"
          ? softwareSchema
          : organizationSchema;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Reusable components for different page types
export function OrganizationStructuredData() {
  return <StructuredData type="organization" />;
}

export function WebsiteStructuredData() {
  return <StructuredData type="website" />;
}

export function SoftwareStructuredData() {
  return <StructuredData type="software" />;
}
