import type { Metadata } from "next";
import ComparisonTable from "@/components/landing/ComparisonTable";
import FinalCTA from "@/components/landing/FinalCTA";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingHero from "@/components/landing/LandingHero";
import ProseSection from "@/components/landing/ProseSection";
import DiscordCTA from "@/components/sections/DiscordCTA";
import FAQ from "@/components/sections/FAQ";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { generateLandingJsonLd, getLandingPage } from "@/lib/landing-pages";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = getLandingPage(locale, "guides-how-to-make-a-pngtuber");
  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    alternates: { canonical: page.metadata.canonical },
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      url: `https://pngtubermaker.com${page.metadata.canonical}`,
    },
  };
}

export default async function HowToMakeAPNGTuberPage({ params }: Props) {
  const { locale } = await params;
  const page = getLandingPage(locale, "guides-how-to-make-a-pngtuber");
  const jsonLd = generateLandingJsonLd(page);

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data for SEO
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd.breadcrumbLd),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data for SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.faqLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data for SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.webPageLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <Breadcrumb items={page.breadcrumbs} />
      </div>
      <LandingHero hero={page.hero} />
      {page.steps && (
        <HowItWorks title={page.steps.title} items={page.steps.items} />
      )}
      {page.prose && <ProseSection prose={page.prose} />}
      {page.comparison && <ComparisonTable comparison={page.comparison} />}
      <FAQ faqData={page.faqs} />
      <FinalCTA cta={page.cta} />
      <DiscordCTA />
    </>
  );
}
