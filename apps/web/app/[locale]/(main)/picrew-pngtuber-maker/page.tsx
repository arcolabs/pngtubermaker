import type { Metadata } from "next";
import ComparisonTable from "@/components/landing/ComparisonTable";
import FeatureGrid from "@/components/landing/FeatureGrid";
import FinalCTA from "@/components/landing/FinalCTA";
import HowItWorks from "@/components/landing/HowItWorks";
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
  title:
    "Picrew PNGTuber Maker: Turn a Picrew-Style Avatar Into a Talking PNGTuber",
  description:
    "Loved Picrew but need a talking avatar? Generate a Picrew-style character with a matching expression pack, then add it to OBS with one Browser Source URL. Free to start.",
  keywords: [
    "picrew pngtuber maker",
    "picrew pngtuber",
    "picrew alternative",
    "picrew avatar to pngtuber",
    "talking picrew avatar",
    "picrew style pngtuber",
    "ai pngtuber maker",
    "obs browser source pngtuber",
    "mic reactive pngtuber",
    "pngtuber maker",
  ],
  alternates: { canonical: "/picrew-pngtuber-maker" },
  openGraph: {
    title:
      "Picrew PNGTuber Maker: Turn a Picrew-Style Avatar Into a Talking PNGTuber",
    description:
      "Picrew gives you a static avatar. PNGTuberMaker adds a matching expression pack and one-click OBS Browser Source — mic-reactive in minutes.",
    url: "https://pngtubermaker.com/picrew-pngtuber-maker",
  },
};

const page: LandingPageData = {
  slug: "picrew-pngtuber-maker",
  metadata: {
    title:
      "Picrew PNGTuber Maker: Turn a Picrew-Style Avatar Into a Talking PNGTuber",
    description:
      "Loved Picrew but need a talking avatar? Generate a Picrew-style character with a matching expression pack, then add it to OBS with one Browser Source URL. Free to start.",
    keywords: [
      "picrew pngtuber maker",
      "picrew pngtuber",
      "picrew alternative",
      "picrew avatar to pngtuber",
      "talking picrew avatar",
      "picrew style pngtuber",
      "ai pngtuber maker",
      "obs browser source pngtuber",
      "mic reactive pngtuber",
      "pngtuber maker",
    ],
    canonical: "/picrew-pngtuber-maker",
  },
  hero: {
    badge: "Picrew Alternative for Streamers",
    title:
      "Picrew PNGTuber Maker: From Static Avatar to Talking Stream Character",
    subtitle:
      "Picrew is perfect for designing a look — but a static sheet cannot talk, blink, or lip-sync in OBS. Describe your character, get an AI Picrew-style avatar with a matching expression pack, and paste one Browser Source URL to go live.",
    ctaText: "Generate My PNGTuber Free",
    ctaHref: "/create",
  },
  steps: {
    title: "How to Make a Picrew-Style PNGTuber That Talks: 6 Steps",
    items: [
      {
        title: "Describe Your Picrew-Style Character",
        description:
          "Open PNGTuberMaker and describe the avatar you would normally build in Picrew — hair color and style, eyes, outfit, accessories, and art style. Add references like 'soft anime portrait' or 'pastel chibi' to steer the look. The AI generates several base designs in under a minute, so you can pick the one that matches the character in your head. New users get 1 free generation with no credit card.",
      },
      {
        title: "Generate a Matching Expression Pack",
        description:
          "A Picrew sheet gives you one static pose. PNGTuberMaker generates a consistent expression pack from the same character, including at minimum an idle pose and a talking pose — the two states OBS swaps between. Add extra reactions such as happy, surprised, or angry to give your streams more personality.",
      },
      {
        title: "Copy Your Browser Source URL",
        description:
          "Every finished model gets a unique Browser Source URL. Copy it from your dashboard. This single link is all OBS needs — there is no PNG folder to export, no file import, and no plugin to install.",
      },
      {
        title: "Add the Avatar to OBS Studio",
        description:
          "In OBS Studio, click the plus button in the Sources panel, choose Browser, name the source, and paste your URL. Your avatar appears immediately as a transparent overlay and reacts to your microphone in real time.",
      },
      {
        title: "Dial In Microphone Reactivity",
        description:
          "Select the correct microphone under Settings then Audio, then adjust gain and add a Noise Gate or Noise Suppression filter so background noise does not trigger the talking pose. Speak at your normal volume and confirm the avatar switches to talking while you talk and back to idle when you stop.",
      },
      {
        title: "Test and Go Live",
        description:
          "Use OBS Studio Mode or record a short test clip to confirm the avatar animates, sits where you want it, and looks right over gameplay or a camera. When it checks out, start streaming to Twitch, YouTube, or Kick — the same Browser Source works everywhere.",
      },
    ],
  },
  features: {
    title: "Why Use PNGTuberMaker Instead of a Static Picrew Avatar",
    items: [
      {
        icon: "Wand2",
        title: "AI Picrew-Style Characters",
        description:
          "Skip browsing hundreds of makers and parts. Describe the anime or chibi look you want and the AI generates a custom character in seconds — no drawing, no part-hunting, and no maker restrictions to work around.",
      },
      {
        icon: "Smile",
        title: "Built-In Expression Pack",
        description:
          "Instead of a single flat image, you get a set of matching expressions generated from the same character. Idle and talking poses are the core; extra reactions make your streams feel alive.",
      },
      {
        icon: "Monitor",
        title: "One-Click OBS Browser Source",
        description:
          "Your avatar is hosted for you behind a single URL. Paste it into an OBS Browser Source and you are done — no PNG import, no image sequencing, and no animation software.",
      },
      {
        icon: "Mic",
        title: "Real-Time Mic Lip-Sync",
        description:
          "The avatar switches between idle and talking as you speak. A static Picrew image cannot do this; PNGTuberMaker uses your microphone level to drive the animation, with no face tracking or webcam.",
      },
      {
        icon: "Palette",
        title: "Your Style, Not a Fixed Template",
        description:
          "Picrew limits you to the parts each creator drew. With a text prompt you can combine any hair, outfit, color palette, and art direction, and regenerate until the character feels right.",
      },
      {
        icon: "Zap",
        title: "Minutes, Not Hours",
        description:
          "There is no rigging, keyframing, or manual transparency cleanup. Go from character idea to a live, talking avatar in a single sitting — then reuse the same URL across scenes and computers.",
      },
    ],
  },
  comparison: {
    title:
      "Picrew vs PNGTuberMaker: Static Avatar or Talking Stream Character?",
    description:
      "Picrew is a character design tool; a PNGTuber is a live, mic-reactive stream asset. Here is how the two compare once you want to go live.",
    columns: [
      { label: "Feature" },
      { label: "PNGTuberMaker", highlight: true },
      { label: "Picrew" },
      { label: "Picrew + Manual OBS Setup" },
    ],
    rows: [
      {
        feature: "Avatar creation",
        values: [
          "AI-generated from a text prompt",
          "Combine parts from a creator's maker",
          "Combine parts from a creator's maker",
        ],
      },
      {
        feature: "Idle + talking expressions",
        values: [true, false, "You draw or edit them yourself"],
      },
      {
        feature: "Mic-reactive in OBS",
        values: [true, false, "Manual hotkeys, if configured"],
      },
      {
        feature: "OBS setup",
        values: [
          "Paste one Browser Source URL",
          "Not a streaming tool",
          "Import PNGs and configure hotkeys",
        ],
      },
      {
        feature: "Output format",
        values: [
          "Hosted, transparent, animated",
          "Static PNG image",
          "Static PNGs you animate yourself",
        ],
      },
      {
        feature: "Style range",
        values: [
          "Any prompt and art direction",
          "Fixed set of parts per maker",
          "Fixed set of parts per maker",
        ],
      },
      {
        feature: "Setup time",
        values: [
          "Under 5 minutes",
          "Minutes to design",
          "1–2 hours of manual work",
        ],
      },
      {
        feature: "Free to start",
        values: [true, true, true],
      },
    ],
  },
  prose: {
    title: "Picrew PNGTuber Maker, Explained",
    blocks: [
      {
        subtitle: "What Is a Picrew PNGTuber Maker?",
        text: "Picrew is a popular Japanese site where artists publish character makers — little part-pickers that let you assemble an avatar by choosing hair, eyes, clothing, and accessories. It is wonderful for designing a static look. A PNGTuber maker goes a step further: it produces the set of expressions and the delivery mechanism you need to show that character on stream as a talking, mic-reactive avatar. This page explains how to get the Picrew-style result you want and then make it move in OBS.",
      },
      {
        subtitle: "Can You Turn a Picrew Avatar Into a PNGTuber?",
        text: "A Picrew export is a single static image. To make it talk you would normally need a matching idle pose, a talking pose (usually with an open mouth), and a tool to switch between them as you speak — which means drawing or editing additional artwork yourself. That is the gap a Picrew PNGTuber maker fills: instead of starting from a flat image, you generate a character together with a consistent expression pack, so the idle and talking states already match and are ready to run.",
      },
      {
        subtitle: "Why a Static Avatar Sheet Cannot Lip-Sync",
        text: "PNGTuber animation is simple at heart: when your microphone level rises, the talking image is shown; when you go quiet, the idle image returns. That requires at least two coordinated images and a host that listens to your mic. A Picrew output has neither — it is one picture with no audio input and no browser-based runtime. The result is expressive during setup but frozen on stream, which is why streamers look for an alternative once they want their avatar to react.",
      },
      {
        subtitle: "How the AI Picrew-Style Generator Works",
        text: "Describe your character in plain language — hair, eyes, outfit, accessories, and mood — and the AI renders several base designs. Pick a favorite, then generate an expression pack from that same character so the idle, talking, and reaction poses stay visually consistent. Because each character is generated rather than assembled from a fixed part library, you can match almost any anime, chibi, or stylized direction you have in mind.",
      },
      {
        subtitle: "Browser Source vs Importing Picrew Images",
        text: "If you tried to use a Picrew image in OBS, you would add it as an Image Source, then create a separate image for the talking state and set up a hotkey or a plugin to switch between them. Every new expression means another file and more scene wiring. A hosted Browser Source replaces all of that with one URL: the avatar, its expressions, and its mic reactivity live behind a single link you can copy into any scene or machine.",
      },
      {
        subtitle: "A Note on Picrew Usage Terms",
        text: "Picrew makers are created by individual artists, and each one sets its own rules about personal and commercial use — some welcome streaming, others restrict it. Those terms apply to avatars made with that creator's parts. PNGTuberMaker generates a new character from your own description, so you are working with a character created for you rather than a third-party maker's artwork. If you plan to monetize, always review the terms that apply to whatever avatar you use.",
      },
    ],
  },
  faqs: [
    {
      id: "picrew-1",
      question: "What is a Picrew PNGTuber maker?",
      answer:
        "A Picrew PNGTuber maker is a tool that helps you get a Picrew-style character onto a livestream as a talking avatar. Picrew itself creates static character designs; a PNGTuber maker adds a matching expression pack and an OBS-ready Browser Source so the avatar can swap between idle and talking poses based on your microphone.",
    },
    {
      id: "picrew-2",
      question: "Can I turn my Picrew avatar into a talking PNGTuber?",
      answer:
        "Not directly. A Picrew export is a single static PNG, and mic-reactive animation needs at least an idle and a talking image plus a host that listens to your mic. You can redraw the extra poses yourself, or generate a character with a built-in expression pack — which is what PNGTuberMaker does — and skip the manual artwork.",
    },
    {
      id: "picrew-3",
      question: "Is PNGTuberMaker a good Picrew alternative?",
      answer:
        "Yes, if your goal is a live stream avatar rather than a static picture. Picrew is great for designing a look; PNGTuberMaker is built for what happens next. It generates a Picrew-style character, produces a consistent expression pack, and hosts it behind one OBS Browser Source URL with real-time mic lip-sync.",
    },
    {
      id: "picrew-4",
      question: "Does PNGTuberMaker make Picrew-style anime and chibi avatars?",
      answer:
        "You can steer the art direction with your prompt. Describe anime, chibi, pastel, or any other style and include hair, eyes, outfit, and accessory details. The AI renders several options so you can pick the look closest to what you would have built in a Picrew maker.",
    },
    {
      id: "picrew-5",
      question: "How do I add my PNGTuber to OBS?",
      answer:
        "Copy your unique Browser Source URL from the dashboard. In OBS Studio, click the plus button in the Sources panel, choose Browser, paste the URL, set the size to 800 x 800, and position the avatar with Edit Transform. It appears as a transparent overlay and reacts to your microphone — no plugin or file import needed.",
    },
    {
      id: "picrew-6",
      question: "Do I need to draw or rig anything?",
      answer:
        "No. You describe the character in text and the AI generates the base design and the matching expressions. There is no drawing, no layered-file rigging, and no keyframing. A static Picrew avatar would require you to create additional poses by hand before it could talk.",
    },
    {
      id: "picrew-7",
      question: "Can I stream with a Picrew-style AI avatar?",
      answer:
        "You are responsible for the terms that apply to any avatar you stream with. Picrew makers are published by individual artists and many set their own rules on commercial use, so check those terms if you use a Picrew-made image. PNGTuberMaker generates a new character from your description, and you should review the product's terms before monetizing.",
    },
    {
      id: "picrew-8",
      question: "Does it work with Streamlabs, Twitch, YouTube, and Kick?",
      answer:
        "Yes. The avatar runs in any broadcast app that supports a browser-based source, including OBS Studio, Streamlabs Desktop, and Twitch Studio. The same Browser Source URL appears in your stream whether you broadcast to Twitch, YouTube, or Kick.",
    },
    {
      id: "picrew-9",
      question: "Is the Picrew PNGTuber maker free to start?",
      answer:
        "You can start for free. New users get 1 free avatar generation with no credit card, and OBS Studio is free and open source. Optional credits and the Creator Pass unlock more generations, expression packs, and HD exports if you want them.",
    },
  ],
  cta: {
    title: "Make Your Picrew-Style Avatar Talk",
    subtitle:
      "Generate a custom character with a matching expression pack, then paste one Browser Source URL into OBS. Start with 1 free generation — no credit card, no rigging.",
    ctaText: "Generate My PNGTuber Free",
    ctaHref: "/create",
  },
  relatedPages: [
    {
      title: "Free PNGTuber Maker",
      description: "Start with 1 free generation — no credit card required.",
      href: "/free-pngtuber-maker",
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
    {
      title: "PNGTuber Models",
      description: "Find or generate the right model for your stream.",
      href: "/pngtuber-models",
    },
    {
      title: "VTuber Maker",
      description: "Generate a full VTuber-style avatar with AI.",
      href: "/vtuber-maker",
    },
    {
      title: "PNGTuber for Discord",
      description: "Use your talking avatar in Discord calls and servers.",
      href: "/for/discord",
    },
  ],
  breadcrumbs: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Picrew PNGTuber Maker",
    },
  ],
};

export default function PicrewPNGTuberMakerPage() {
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
