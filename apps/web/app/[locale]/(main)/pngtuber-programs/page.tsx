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
  title: "PNGTuber Programs: Compare the Best PNGTuber Software (2026)",
  description:
    "Comparing PNGTuber programs and software like veadotube mini, PNGTuber Plus and VTube Studio? See what each one needs — or generate a stream-ready PNGTuber with AI. Free to start.",
  keywords: [
    "pngtuber programs",
    "pngtuber software",
    "best pngtuber program",
    "free pngtuber software",
    "pngtuber program for pc",
    "veadotube mini",
    "pngtuber plus",
    "vtube studio pngtuber",
    "mic reactive pngtuber",
    "ai pngtuber maker",
    "obs pngtuber browser source",
  ],
  alternates: { canonical: "/pngtuber-programs" },
  openGraph: {
    title: "PNGTuber Programs: Compare the Best PNGTuber Software (2026)",
    description:
      "Compare the popular PNGTuber programs and what artwork each one needs — then generate a mic-reactive avatar with AI and add it to OBS in minutes. Free to start.",
    url: "https://pngtubermaker.com/pngtuber-programs",
  },
};

const page: LandingPageData = {
  slug: "pngtuber-programs",
  metadata: {
    title: "PNGTuber Programs: Compare the Best PNGTuber Software (2026)",
    description:
      "Comparing PNGTuber programs and software like veadotube mini, PNGTuber Plus and VTube Studio? See what each one needs — or generate a stream-ready PNGTuber with AI. Free to start.",
    keywords: [
      "pngtuber programs",
      "pngtuber software",
      "best pngtuber program",
      "free pngtuber software",
      "pngtuber program for pc",
      "veadotube mini",
      "pngtuber plus",
      "vtube studio pngtuber",
      "mic reactive pngtuber",
      "ai pngtuber maker",
      "obs pngtuber browser source",
    ],
    canonical: "/pngtuber-programs",
  },
  hero: {
    badge: "PNGTuber Programs & Software, Compared",
    title: "PNGTuber Programs: Pick the Right Software — or Skip It Entirely",
    subtitle:
      "Looking for PNGTuber software? Compare the programs streamers actually use, see what artwork each one needs, and find the fastest route to a mic-reactive avatar that is live in OBS in minutes.",
    ctaText: "Generate My PNGTuber Free",
    ctaHref: "/create",
  },
  features: {
    title: "What to Look For in a PNGTuber Program",
    items: [
      {
        icon: "Wand2",
        title: "Where the Artwork Comes From",
        description:
          "Every PNGTuber program is a player, not an artist. veadotube mini, PNGTuber Plus and VTube Studio all animate PNG images you supply — so the real question is whether you can draw or commission the idle and talking poses they need.",
      },
      {
        icon: "Mic",
        title: "Real Mic Reactivity",
        description:
          "The defining feature of a PNGTuber program is swapping to a talking pose when your microphone level rises, with no webcam or face tracking. Confirm it reacts to your mic directly rather than depending on face detection.",
      },
      {
        icon: "Layers",
        title: "Expression & Hotkey Support",
        description:
          "Good programs let you bind extra expressions — happy, sad, angry, surprised — to hotkeys or audio triggers, so your character reacts beyond simply talking. Check how many images a single setup can cycle between.",
      },
      {
        icon: "Monitor",
        title: "OBS and Streaming Integration",
        description:
          "Your program has to reach your stream. Some run as a browser source, some are captured as a window, and some speak to OBS directly. Whichever route a program uses, it should sit cleanly as a transparent overlay.",
      },
      {
        icon: "Download",
        title: "Platform and Install",
        description:
          "Not every PNGTuber program runs everywhere. Some are Windows-only, others cover macOS and Linux, and a newer class runs entirely in a browser with nothing to install. Pick one that runs on the machine you stream from.",
      },
      {
        icon: "Zap",
        title: "Setup Time and Cost",
        description:
          "Programs range from free and five-minute simple to paid and parameter-heavy, and every one of them adds the artwork step on top. Weigh the program's price together with the cost of getting art that matches what it expects.",
      },
    ],
  },
  comparison: {
    title: "PNGTuber Programs Compared — and the AI Alternative",
    description:
      "How the popular PNGTuber software options compare, from install and platform to where the artwork actually comes from.",
    columns: [
      { label: "Feature" },
      { label: "PNGTuberMaker (AI)", highlight: true },
      { label: "veadotube mini" },
      { label: "PNGTuber Plus" },
      { label: "VTube Studio" },
    ],
    rows: [
      {
        feature: "Cost",
        values: [
          "Free to start – $7.99/mo",
          "Free",
          "Free",
          "Free – paid add-ons",
        ],
      },
      {
        feature: "Artwork needed",
        values: [
          "AI-generated for you",
          "You draw or commission PNGs",
          "You draw or commission PNGs",
          "You draw or buy a Live2D model",
        ],
      },
      {
        feature: "Install required",
        values: [false, true, true, true],
      },
      {
        feature: "Platform",
        values: [
          "Any modern browser",
          "Windows, macOS, Linux",
          "Windows",
          "Windows, macOS",
        ],
      },
      {
        feature: "Mic-reactive lip sync",
        values: [true, true, true, "Webcam face tracking instead"],
      },
      {
        feature: "Expression setup",
        values: [
          "Generated automatically",
          "Hotkey per image",
          "Hotkey per image",
          "Complex rig parameters",
        ],
      },
      {
        feature: "Reaches OBS as",
        values: [
          "One Browser Source URL",
          "Window or browser source",
          "Window capture",
          "Virtual camera or window",
        ],
      },
      {
        feature: "Time to go live",
        values: [
          "Under 5 minutes",
          "10–30 minutes",
          "10–30 minutes",
          "30 minutes – hours",
        ],
      },
      {
        feature: "Regenerate or tweak freely",
        values: [true, false, false, false],
      },
    ],
  },
  prose: {
    title: "PNGTuber Programs and Software, Explained",
    blocks: [
      {
        subtitle: "What Are PNGTuber Programs?",
        text: "A PNGTuber program — also called PNGTuber software — is an application that displays your avatar on stream and swaps between a small set of PNG images based on your microphone. When you speak, the program shows a talking pose; when you go quiet, it returns to an idle pose. The best-known options are veadotube mini, PNGTuber Plus and VTube Studio running in its image-based mode, with some streamers using OBS Studio alone to swap images on a hotkey. The searches 'pngtuber programs' and 'pngtuber software' describe the same category of tool.",
      },
      {
        subtitle: "The Catch: Programs Don't Make the Artwork",
        text: "Every one of these programs does the same job — it plays images you already have. None of them draws your character. To use them you need at least an idle pose and a talking pose of the same character, drawn in a consistent style, with a transparent background. That matching artwork is the expensive and time-consuming part: a commission commonly costs $50–$200 or more and takes one to four weeks, and free packs mean other streamers may share your look. The program is often the easy half of the problem.",
      },
      {
        subtitle: "How to Choose a PNGTuber Program",
        text: "Work through a short checklist. First, platform: does it run on Windows, macOS or Linux, or is it browser-based? Second, mic reactivity: does it react to your microphone directly, without a webcam? Third, expressions: can you bind idle, talking and reaction images to hotkeys or audio triggers? Fourth, integration: how does it reach OBS — browser source, window capture or virtual camera? Fifth, cost: free, one-time or subscription, and does anything sit behind a paywall? Sixth, licensing: can you stream and monetize with what it produces? Match the program to how you actually stream rather than to the longest feature list.",
      },
      {
        subtitle: "veadotube mini, PNGTuber Plus and VTube Studio",
        text: "veadotube mini is the minimalist favourite: free, lightweight, cross-platform, and built around simple mic-reactive image swapping. PNGTuber Plus is a Windows desktop program with hotkey-driven expressions and more configuration, popular for multi-expression setups. VTube Studio is a Live2D application, and while it can display images, its strengths — face tracking and rig parameters — sit outside the PNGTuber style; if you want the classic mic-reactive PNG look, a dedicated PNGTuber program is the simpler fit. All three, however, still begin with artwork you have to provide.",
      },
      {
        subtitle: "The No-Program Route: A Hosted Browser Source",
        text: "There is a route that removes both the artwork problem and the program itself. PNGTuberMaker generates your character and a matching expression pack from a text description or a reference image, then hosts the finished avatar behind a single Browser Source URL. You paste that URL into OBS and the avatar is live — mic-reactive, transparent, and swapping between idle and talking automatically. There is no program to install, no PNG folder to manage and no window capture to configure. If you prefer to keep using veadotube mini, PNGTuber Plus or VTube Studio, you can generate the artwork here and feed it into that program instead.",
      },
      {
        subtitle: "PNGTuber Software vs VTuber Software",
        text: "PNGTuber software is image-based: a few static poses swap as you speak, which is why it runs on almost any computer with no webcam. VTuber software such as VTube Studio or Live2D-driven setups uses a rigged model and face tracking for smoother, more lifelike motion — but it needs a webcam, stronger hardware, and a model that can cost hundreds to thousands of dollars. If you are starting out or streaming casually, PNGTuber software puts a polished, expressive character on screen in minutes for a fraction of the effort.",
      },
      {
        subtitle: "How to Go Live in Minutes",
        text: "Describe your character — hair, eyes, outfit, accessories, art style — and PNGTuberMaker generates several base designs to choose from. Pick one and generate a matching expression pack so idle, talking and reaction poses stay consistent. Copy your unique Browser Source URL from the dashboard, add a Browser source in OBS Studio, and paste it in. Your avatar appears as a transparent overlay and reacts to your microphone in real time. New users get 1 free generation with no credit card, so you can try the whole workflow before choosing credits or a Creator Pass.",
      },
    ],
  },
  faqs: [
    {
      id: "pp-1",
      question: "What are PNGTuber programs?",
      answer:
        "PNGTuber programs — also searched as PNGTuber software — are applications that display a PNGTuber avatar on stream and swap between PNG images based on your microphone. When you talk, the program shows a talking pose; when you stop, it returns to idle. Popular examples include veadotube mini, PNGTuber Plus and VTube Studio in image mode, while some streamers use OBS Studio on its own with hotkeys.",
    },
    {
      id: "pp-2",
      question: "What is the best PNGTuber program?",
      answer:
        "There is no single best one, because each suits a different setup. veadotube mini is the simplest free cross-platform choice, PNGTuber Plus offers more hotkey and expression configuration on Windows, and VTube Studio is better suited to Live2D models than classic PNGTubers. If you do not want to install a program at all, PNGTuberMaker hosts your avatar behind one OBS Browser Source URL instead.",
    },
    {
      id: "pp-3",
      question: "Is there free PNGTuber software?",
      answer:
        "Yes. veadotube mini and PNGTuber Plus are free, and OBS Studio is free and open source. The hidden cost is the artwork: all of them need PNG poses you draw or commission, which commonly runs $50–$200 or more. PNGTuberMaker lets you generate the artwork with AI and start with 1 free generation, no credit card required.",
    },
    {
      id: "pp-4",
      question: "Do PNGTuber programs create the artwork for you?",
      answer:
        "No. A PNGTuber program only plays images you provide — it cannot draw your character. You need at least an idle and a talking pose of the same character, matching in style and with transparent backgrounds. That is why many streamers generate the character and expression pack with AI first, then either use the hosted Browser Source or feed the images into a program like veadotube mini or PNGTuber Plus.",
    },
    {
      id: "pp-5",
      question: "Can I use PNGTuber software without drawing?",
      answer:
        "Yes, if you do not draw the artwork yourself. You can commission an artist, download a free pack, or generate a character with AI. PNGTuberMaker generates the base avatar and its matching expressions from a text description or a reference image, so no art skills are needed — and you can regenerate until the character matches your idea.",
    },
    {
      id: "pp-6",
      question: "Do I need a program at all to be a PNGTuber?",
      answer:
        "Not necessarily. A dedicated program is one way to run a PNGTuber, but PNGTuberMaker hosts your avatar behind a single Browser Source URL, so OBS Studio handles everything with no second application. You get the same mic-reactive idle and talking swapping without installing or configuring separate PNGTuber software.",
    },
    {
      id: "pp-7",
      question: "Does PNGTuber software work with OBS?",
      answer:
        "Yes. veadotube mini and PNGTuber Plus are typically captured as a window or browser source in OBS, VTube Studio can output through a virtual camera or window capture, and PNGTuberMaker provides a Browser Source URL you paste directly into a Browser source. In every case the avatar appears as a transparent overlay above your gameplay or camera.",
    },
    {
      id: "pp-8",
      question: "Which PNGTuber programs work on Mac?",
      answer:
        "veadotube mini supports macOS as well as Windows and Linux, and VTube Studio runs on macOS. PNGTuber Plus is primarily a Windows program, so Mac users often look for an alternative. PNGTuberMaker needs no installation and runs in any modern browser on any operating system, which makes it platform-independent for Mac, Windows and Linux streamers alike.",
    },
    {
      id: "pp-9",
      question: "Can I switch PNGTuber programs later?",
      answer:
        "Yes, and generating your artwork with AI keeps that flexibility. Because PNGTuberMaker produces transparent PNG poses you can export, you can move the same character between programs such as veadotube mini or PNGTuber Plus whenever you like — or keep the hosted Browser Source and skip the program entirely. You are never locked to one tool.",
    },
  ],
  cta: {
    title: "Skip the Software Hunt — Start Streaming",
    subtitle:
      "Generate a custom PNGTuber with a matching expression pack, then paste one Browser Source URL into OBS. Start with 1 free generation — no credit card, no install.",
    ctaText: "Generate My PNGTuber Free",
    ctaHref: "/create",
  },
  relatedPages: [
    {
      title: "PNGTuber Models",
      description: "Find or generate the right model for your stream.",
      href: "/pngtuber-models",
    },
    {
      title: "OBS PNGTuber Setup",
      description:
        "Add a mic-reactive avatar to OBS with one Browser Source URL.",
      href: "/obs-pngtuber",
    },
    {
      title: "How to Make a PNGTuber",
      description: "The full beginner guide from character idea to going live.",
      href: "/guides/how-to-make-a-pngtuber",
    },
  ],
  breadcrumbs: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "PNGTuber Programs",
    },
  ],
};

export default function PNGTuberProgramsPage() {
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
