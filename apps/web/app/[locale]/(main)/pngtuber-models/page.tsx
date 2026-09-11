import type { Metadata } from "next";
import ComparisonTable from "@/components/landing/ComparisonTable";
import FeatureGrid from "@/components/landing/FeatureGrid";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingHero from "@/components/landing/LandingHero";
import ProseSection from "@/components/landing/ProseSection";
import RelatedPages from "@/components/landing/RelatedPages";
import DiscordCTA from "@/components/sections/DiscordCTA";
import FAQ from "@/components/sections/FAQ";
import Testimonials from "@/components/sections/Testimonials";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  generateLandingJsonLd,
  type LandingPageData,
} from "@/lib/landing-pages";

export const metadata: Metadata = {
  title: "PNGTuber Models — Find or Generate Yours Free (2026)",
  description:
    "Looking for PNGTuber models? Compare commissions, marketplaces and free packs — then generate a custom PNGTuber model with AI in minutes. Free to start.",
  keywords: [
    "pngtuber models",
    "pngtuber model",
    "free pngtuber models",
    "custom pngtuber model",
    "where to find pngtuber models",
    "pngtuber model maker",
    "ai pngtuber model generator",
    "pngtuber model commission",
    "buy pngtuber model",
    "pngtuber avatar model",
  ],
  alternates: { canonical: "/pngtuber-models" },
  openGraph: {
    title: "PNGTuber Models — Find or Generate Yours Free (2026)",
    description:
      "Compare commissions, marketplaces and free packs — then generate a custom PNGTuber model with AI in minutes. Free to start, no credit card required.",
    url: "https://pngtubermaker.com/pngtuber-models",
  },
};

const page: LandingPageData = {
  slug: "pngtuber-models",
  metadata: {
    title: "PNGTuber Models — Find or Generate Yours Free (2026)",
    description:
      "Looking for PNGTuber models? Compare commissions, marketplaces and free packs — then generate a custom PNGTuber model with AI in minutes. Free to start.",
    keywords: [
      "pngtuber models",
      "pngtuber model",
      "free pngtuber models",
      "custom pngtuber model",
      "where to find pngtuber models",
      "pngtuber model maker",
      "ai pngtuber model generator",
      "pngtuber model commission",
      "buy pngtuber model",
      "pngtuber avatar model",
    ],
    canonical: "/pngtuber-models",
  },
  hero: {
    badge: "Custom PNGTuber Models with AI",
    title: "PNGTuber Models: Find the Perfect One or Generate It Free",
    subtitle:
      "Shopping for PNGTuber models from commissions, marketplaces, or free packs? Compare your options — then generate a custom, stream-ready model in minutes.",
    ctaText: "Generate My PNGTuber Model Free",
    ctaHref: "/create",
  },
  features: {
    title: "Where to Get PNGTuber Models — and Why Generation Wins",
    items: [
      {
        icon: "Wand2",
        title: "Generate Instead of Hunting",
        description:
          "Marketplaces and commission queues are full of models, but none are built around your exact character. Describe yours and get multiple unique designs in under a minute.",
      },
      {
        icon: "Palette",
        title: "Exactly Your Character",
        description:
          "Hair, eyes, outfit, accessories, and art style — specify every detail instead of compromising on the nearest match in a seller's catalogue.",
      },
      {
        icon: "Layers",
        title: "Matching Expression Packs",
        description:
          "Generate idle, talking, happy, sad, angry, and surprised expressions that stay consistent with your base model's style and color palette.",
      },
      {
        icon: "Monitor",
        title: "Stream-Ready in Minutes",
        description:
          "Export transparent PNGs and get an OBS Browser Source URL. Your model reacts to your microphone in real time — no rigging or plugins needed.",
      },
    ],
  },
  comparison: {
    title: "PNGTuber Models: AI Generation vs Buying a Model",
    description:
      "How sourcing a model from an artist or a marketplace compares with generating one.",
    columns: [
      { label: "Feature" },
      { label: "PNGTuberMaker (AI)", highlight: true },
      { label: "Custom Commission" },
      { label: "Marketplace / Free Pack" },
    ],
    rows: [
      {
        feature: "Cost",
        values: [
          "Free to start – $7.99/mo",
          "$50–$200+ per model",
          "Free – $50+",
        ],
      },
      {
        feature: "Time to get your model",
        values: ["Under 5 minutes", "1–4 weeks", "Instant download"],
      },
      {
        feature: "Unique to your character",
        values: [true, true, false],
      },
      {
        feature: "Matches your exact idea",
        values: [
          "Describe any character",
          "Depends on artist's style",
          "Only what's listed",
        ],
      },
      {
        feature: "Expression pack",
        values: [
          "AI-generated",
          "$10–$50 per expression",
          "Often sold separately",
        ],
      },
      {
        feature: "Art skills needed",
        values: ["None", "None (you brief the artist)", "None"],
      },
      {
        feature: "Regenerate or tweak freely",
        values: [true, false, false],
      },
      {
        feature: "OBS setup included",
        values: ["Browser Source URL", "Manual import", "Manual import"],
      },
    ],
  },
  prose: {
    title: "PNGTuber Models, Explained",
    blocks: [
      {
        subtitle: "What Is a PNGTuber Model?",
        text: "A PNGTuber model is the set of 2D images that represents your character on stream: a base avatar plus expressions such as idle, talking, happy, sad, angry, and surprised. Unlike a VTuber model built for Live2D or 3D rigging, a PNGTuber model is made of transparent PNG images that swap based on your microphone input. It runs as a browser source overlaid on your stream, which is why it works on almost any computer.",
      },
      {
        subtitle: "Where People Usually Find PNGTuber Models",
        text: "There are three common routes. First, commissioning an artist for a custom model, usually through social platforms or art marketplaces — the most customized option, but it commonly costs $50–$200 or more and can take 1–4 weeks. Second, buying pre-made packs from marketplaces and asset stores, which is fast but means other streamers may use the same art. Third, downloading free packs shared in community forums and social boards, where quality, licensing, and expression coverage vary widely. Each route trades off cost, speed, uniqueness, and usage rights.",
      },
      {
        subtitle: "The AI Alternative: Generate Your Own Model",
        text: "Instead of sourcing a model that already exists, you can generate one that matches your idea exactly. Describe your character — hair color, eyes, outfit, accessories, personality — and the AI produces multiple design candidates. Pick a favorite, then generate a matching expression pack. If you want changes, regenerate; there is no waiting on revisions or negotiating with a seller. New users get 1 free generation with no credit card, so you can test the workflow before deciding whether to buy credits or a Creator Pass.",
      },
      {
        subtitle: "What to Look For in a PNGTuber Model",
        text: "Whether you generate or buy, check that the character reads clearly at small stream sizes, that the face is expressive and unobstructed, and that all expressions share the same palette and line style. Look for transparent-background PNGs at a usable resolution, plus enough expressions to cover talking and idle at minimum. Finally, confirm the usage rights: free models and free generations typically cover streaming and social media, while full commercial use such as merchandise or paid content may require an upgrade or a specific license.",
      },
      {
        subtitle: "PNGTuber Model vs VTuber Model",
        text: "A PNGTuber model is image-based: expressions swap when you speak, with no face tracking or rigging. A VTuber model uses Live2D or 3D rigging and motion capture, which looks smoother but demands a webcam, more powerful hardware, and often a model costing hundreds to thousands of dollars. If you are starting out or streaming casually, a PNGTuber model puts a polished character on screen in minutes for a fraction of the cost.",
      },
      {
        subtitle: "How to Use Your Model in OBS",
        text: "Generate your base avatar, create an expression pack, then copy your unique Browser Source URL. In OBS Studio, add a Browser source, paste the URL, and your model appears with a transparent background, reacting to your microphone. That is the entire setup — no plugins, no additional software, and it works with Twitch, YouTube, Kick, and other platforms.",
      },
    ],
  },
  faqs: [
    {
      id: "pm-1",
      question: "Where can I find PNGTuber models?",
      answer:
        "Most people find them in three places: custom commissions from artists, pre-made packs sold on marketplaces and asset stores, or free packs shared in community forums and social boards. Each option differs in cost, wait time, exclusivity, and licensing. A newer alternative is generating a custom model with AI, which creates a model based on your own description in minutes.",
    },
    {
      id: "pm-2",
      question: "Are there free PNGTuber models?",
      answer:
        "Yes. Free pre-made packs circulate in community forums and on social platforms, and they can be a fine starting point. The trade-offs are that the art is not exclusive to you, licensing terms vary, and expression coverage may be incomplete. If you want a free model that is unique to your character, PNGTuberMaker gives new users 1 free avatar generation with no credit card required.",
    },
    {
      id: "pm-3",
      question: "How much does a custom PNGTuber model cost?",
      answer:
        "A commissioned custom model commonly costs $50–$200 or more, with each additional expression often priced separately at $10–$50. Pre-made packs range from free to around $50. With PNGTuberMaker you can start free — 1 generation, no credit card — then purchase credits or a Creator Pass at $7.99/month for more generations, expression packs, and HD exports.",
    },
    {
      id: "pm-4",
      question: "Can I generate a PNGTuber model with AI?",
      answer:
        "Yes. PNGTuberMaker uses AI to generate custom PNGTuber models from a text description or a reference image you upload. You get multiple design candidates, then a matching expression pack, all consistent with your character. Most base models generate in under a minute and expression packs in 1–3 minutes.",
    },
    {
      id: "pm-5",
      question: "Do I need art skills to make a PNGTuber model?",
      answer:
        "No. If you generate with AI, you only need to describe your character — hair, eyes, outfit, accessories, and style. If you commission an artist, you brief them instead. The traditional do-it-yourself route is the only one that requires drawing skills and software such as a drawing tablet and an image editor.",
    },
    {
      id: "pm-6",
      question:
        "What is the difference between a PNGTuber model and a VTuber model?",
      answer:
        "A PNGTuber model is a set of 2D PNG images — a base avatar plus expressions — that swap based on microphone input in OBS. A VTuber model uses Live2D or 3D rigging and face tracking for smoother motion, but requires a webcam, stronger hardware, and typically costs hundreds to thousands of dollars. PNGTuber models are simpler, cheaper, and faster to set up.",
    },
    {
      id: "pm-7",
      question:
        "Can I use a PNGTuber model I bought or downloaded on Twitch and YouTube?",
      answer:
        "It depends on the license that comes with the model. Commissioned and purchased models usually specify whether they cover streaming, monetized content, and merchandise, so check the terms before going live. PNGTuberMaker free avatars can be used for streaming, YouTube videos, Discord, and social media; Creator Pass subscribers get full commercial rights including merchandise and paid content.",
    },
    {
      id: "pm-8",
      question: "How long does it take to get a PNGTuber model?",
      answer:
        "A commission typically takes 1–4 weeks from briefing to delivery, and revisions add time. Pre-made packs are available instantly if you find one that fits. AI generation is the fastest route: most models are ready in under a minute, with expression packs taking 1–3 minutes, so you can go from idea to stream-ready in one sitting.",
    },
    {
      id: "pm-9",
      question: "Can I edit a PNGTuber model after I get it?",
      answer:
        "With a commissioned or purchased model, changes usually mean paying for revisions or buying a new pack. With AI generation you can regenerate or refine your prompt anytime, and each generation produces new candidates. Your existing generated avatar also keeps working even if you do not buy more credits.",
    },
  ],
  cta: {
    title: "Stop Hunting. Start Generating.",
    subtitle:
      "Get a custom PNGTuber model in minutes with 1 free generation — no credit card, no marketplace browsing, no waiting on a commission.",
    ctaText: "Generate My Model Free",
    ctaHref: "/create",
  },
  relatedPages: [
    {
      title: "VTuber Maker",
      description: "Generate a full VTuber-style avatar with AI.",
      href: "/vtuber-maker",
    },
    {
      title: "Free PNGTuber Maker",
      description: "Start with 1 free generation — no credit card required.",
      href: "/free-pngtuber-maker",
    },
    {
      title: "How to Make a PNGTuber",
      description: "Step-by-step guide from character idea to OBS setup.",
      href: "/guides/how-to-make-a-pngtuber",
    },
  ],
  breadcrumbs: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "PNGTuber Models",
    },
  ],
};

export default function PNGTuberModelsPage() {
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
      {page.features && (
        <FeatureGrid title={page.features.title} items={page.features.items} />
      )}
      {page.comparison && <ComparisonTable comparison={page.comparison} />}
      {page.prose && <ProseSection prose={page.prose} />}
      <Testimonials />
      <RelatedPages pages={page.relatedPages} />
      <FAQ faqData={page.faqs} />
      <FinalCTA cta={page.cta} />
      <DiscordCTA />
    </>
  );
}
