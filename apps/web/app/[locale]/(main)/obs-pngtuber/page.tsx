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
  title: "OBS PNGTuber: Set Up a Mic-Reactive Avatar (Free, 2026)",
  description:
    "Set up an OBS PNGTuber in minutes: add your mic-reactive avatar as a Browser Source, no plugins or rigging. Free to start — generate your PNGTuber and go live.",
  keywords: [
    "obs pngtuber",
    "pngtuber obs",
    "pngtuber obs setup",
    "obs pngtuber setup",
    "obs browser source pngtuber",
    "mic reactive pngtuber",
    "pngtuber microphone setup",
    "how to add pngtuber to obs",
    "pngtuber talking animation",
    "obs pngtuber tutorial",
    "pngtuber browser source url",
    "pngtuber obs settings",
  ],
  alternates: { canonical: "/obs-pngtuber" },
  openGraph: {
    title: "OBS PNGTuber: Set Up a Mic-Reactive Avatar (Free, 2026)",
    description:
      "Add a mic-reactive PNGTuber to OBS Studio with one Browser Source URL. No plugins, no rigging, free to start.",
    url: "https://pngtubermaker.com/obs-pngtuber",
  },
};

const page: LandingPageData = {
  slug: "obs-pngtuber",
  metadata: {
    title: "OBS PNGTuber: Set Up a Mic-Reactive Avatar (Free, 2026)",
    description:
      "Set up an OBS PNGTuber in minutes: add your mic-reactive avatar as a Browser Source, no plugins or rigging. Free to start — generate your PNGTuber and go live.",
    keywords: [
      "obs pngtuber",
      "pngtuber obs",
      "pngtuber obs setup",
      "obs pngtuber setup",
      "obs browser source pngtuber",
      "mic reactive pngtuber",
      "pngtuber microphone setup",
      "how to add pngtuber to obs",
      "pngtuber talking animation",
      "obs pngtuber tutorial",
      "pngtuber browser source url",
      "pngtuber obs settings",
    ],
    canonical: "/obs-pngtuber",
  },
  hero: {
    badge: "OBS Browser Source Setup Guide",
    title: "OBS PNGTuber: Go Mic-Reactive in Under 5 Minutes",
    subtitle:
      "Add a talking PNGTuber to OBS Studio with no plugins and no rigging. Paste one Browser Source URL and your avatar lip-syncs to your microphone in real time.",
    ctaText: "Generate My PNGTuber Free",
    ctaHref: "/create",
  },
  steps: {
    title: "How to Add a PNGTuber to OBS: 6 Simple Steps",
    items: [
      {
        title: "Generate Your PNGTuber and Expression Pack",
        description:
          "Open PNGTuberMaker and describe your character — hair, eyes, outfit, accessories, and art style. The AI generates several base designs in under a minute. Pick a favorite, then generate a matching expression pack. At minimum you want an idle pose and a talking pose, since those are what OBS swaps between when you speak. New users get 1 free generation with no credit card required.",
      },
      {
        title: "Copy Your Browser Source URL",
        description:
          "Every finished model gets its own unique Browser Source URL. Copy it from your dashboard — this single link is everything OBS needs. There is no PNG download, file import, or plugin to configure.",
      },
      {
        title: "Add a Browser Source in OBS Studio",
        description:
          "In OBS Studio, open the Sources panel and click the plus button, then choose Browser. Name the source something like PNGTuber Avatar, paste your URL into the URL field, and click OK. Your avatar appears immediately as a transparent overlay, reacting to your microphone.",
      },
      {
        title: "Size and Position Your Avatar",
        description:
          "Set the Browser Source width and height to 800 x 800 for crisp results, then use Edit Transform to scale and place the avatar where you want it on the canvas. Leave some padding from the edge so it never gets cropped on different platforms. Lock the source once you are happy so you cannot nudge it mid-stream.",
      },
      {
        title: "Dial In Your Microphone Reactivity",
        description:
          "The avatar switches expressions based on your mic level, so audio settings matter. Pick your microphone in OBS under Settings then Audio, then adjust gain and add a noise gate or noise suppression filter if the avatar triggers on background noise. Test your normal speaking volume — the talking pose should appear when you speak and return to idle when you stop.",
      },
      {
        title: "Test and Go Live",
        description:
          "Record a short test clip or use OBS Studio Mode to preview your layout. Confirm the avatar animates with your voice, sits where you want it, and looks right over gameplay or your camera. When it checks out, start streaming to Twitch, YouTube, or Kick — the same Browser Source works on all of them.",
      },
    ],
  },
  features: {
    title: "Why Streamers Use a Browser Source PNGTuber in OBS",
    items: [
      {
        icon: "Wand2",
        title: "No Plugins or Downloads",
        description:
          "A Browser Source is built into OBS Studio. You do not install a PNGTuber extension, run a separate app, or import a folder of PNG files. Paste a URL and you are done.",
      },
      {
        icon: "Mic",
        title: "Real-Time Mic Lip-Sync",
        description:
          "Your avatar switches between idle and talking expressions as you speak. No face tracking, no webcam, and no green screen — just your microphone audio driving the animation.",
      },
      {
        icon: "Monitor",
        title: "Clean Transparent Overlay",
        description:
          "The Browser Source renders with a transparent background, so your avatar sits naturally over gameplay, a starting soon screen, or a full-background scene without visible edges.",
      },
      {
        icon: "Zap",
        title: "Set Up in Minutes",
        description:
          "There is no rigging, keyframing, or animation software to learn. Most creators go from character idea to a live, talking avatar in a single sitting.",
      },
    ],
  },
  comparison: {
    title: "OBS Browser Source vs Other PNGTuber Setups",
    description:
      "How a hosted Browser Source compares with the older ways of getting a talking avatar into OBS.",
    columns: [
      { label: "Feature" },
      { label: "PNGTuberMaker (Browser Source)", highlight: true },
      { label: "PNGTuber App / Plugin" },
      { label: "Manual PNG Switching" },
    ],
    rows: [
      {
        feature: "Setup time",
        values: ["Under 5 minutes", "10–30 minutes", "1–2 hours"],
      },
      { feature: "Extra software to install", values: [false, true, true] },
      { feature: "Mic-reactive lip-sync", values: [true, "Varies", true] },
      { feature: "Transparent overlay in OBS", values: [true, true, true] },
      {
        feature: "How it is added",
        values: [
          "Paste a Browser Source URL",
          "Install and configure an app or plugin",
          "Import PNGs and set hotkeys",
        ],
      },
      {
        feature: "Works on Windows, Mac, Linux",
        values: [true, "Varies", true],
      },
      {
        feature: "Free to start",
        values: [true, "Varies", true],
      },
    ],
  },
  prose: {
    title: "OBS PNGTuber Setup, Explained",
    blocks: [
      {
        subtitle: "What Is an OBS PNGTuber?",
        text: "An OBS PNGTuber is a 2D avatar that runs inside OBS Studio as a Browser Source and swaps expressions based on your microphone input. Instead of a webcam or a rigged Live2D model, it uses a small set of transparent PNG images — usually an idle pose and a talking pose, plus extra expressions for reactions. When your mic level rises, OBS shows the talking image; when you go quiet, it returns to idle. Viewers see a lively, lip-synced character without you ever appearing on camera.",
      },
      {
        subtitle: "Why Use a Browser Source Instead of a Plugin?",
        text: "OBS Studio ships with a Browser Source built in, which means there is nothing extra to install and nothing to keep updated. The avatar is hosted for you and delivered through a single URL. That has real advantages: no compatibility issues when OBS updates, no separate app eating CPU in the background, and no folder of image files to manage. It also means your setup is portable — copy the URL into a second scene collection or another computer and your avatar comes with you.",
      },
      {
        subtitle: "How Mic-Reactive Lip-Sync Works",
        text: "The Browser Source listens to your microphone audio level and switches between your uploaded expressions. Loud, sustained speech triggers the talking pose; silence returns to idle. Because it responds to volume rather than recognizing words, it works with any language and any microphone. If your avatar feels too twitchy, lower the mic gain or add a noise gate so room noise does not register as speech. If it barely reacts, raise the gain or move the microphone closer.",
      },
      {
        subtitle: "Best OBS Settings for a Smooth Talking Animation",
        text: "Start with a Browser Source size of 800 x 800 and scale down with Edit Transform, which keeps the artwork sharp. Under Settings then Audio, select the correct microphone; under Filters, add Noise Suppression and a Noise Gate to stop fans and keyboard clatter from animating the avatar. Give the talking and idle expressions a brief transition so the swap looks natural rather than jarring. Finally, put the avatar in a scene of its own so you can reuse it across your starting soon, gameplay, and just chatting scenes.",
      },
      {
        subtitle: "Troubleshooting: PNGTuber Not Reacting in OBS",
        text: "If your avatar appears but never talks, check three things in order. First, confirm the correct microphone is selected in OBS audio settings and that the level meter moves when you speak. Second, open the Browser Source properties and use Refresh cache of current page — a stale cache is the most common cause of a frozen avatar. Third, check any audio filters: an overly aggressive noise gate can mute the signal that drives the animation. If the background is black instead of transparent, re-copy the full URL, since a truncated link can break the transparent render.",
      },
      {
        subtitle: "OBS vs Streamlabs and Other Streaming Apps",
        text: "The same Browser Source approach works in OBS Studio, Streamlabs Desktop, Twitch Studio, and most other broadcast tools, because they all support browser-based sources. The exact menu labels differ, but the workflow is identical: add a browser source, paste the URL, set the size, and position it. If you switch streaming software later, your PNGTuber keeps working — the avatar lives at its URL, not inside one particular app.",
      },
    ],
  },
  faqs: [
    {
      id: "obs-1",
      question: "How do I add a PNGTuber to OBS?",
      answer:
        "Generate your avatar and expression pack, then copy your unique Browser Source URL. In OBS Studio, click the plus button in the Sources panel, choose Browser, paste the URL, set the size to 800 x 800, and click OK. Your PNGTuber appears as a transparent overlay and reacts to your microphone. No plugin or download is required.",
    },
    {
      id: "obs-2",
      question: "What is an OBS PNGTuber?",
      answer:
        "An OBS PNGTuber is a static 2D avatar that runs as a Browser Source inside OBS Studio. It swaps between transparent PNG expressions, such as idle and talking, based on your microphone level. It gives you an animated on-stream character without a webcam or Live2D rigging.",
    },
    {
      id: "obs-3",
      question: "Do I need a plugin for a mic-reactive PNGTuber in OBS?",
      answer:
        "No. OBS Studio includes a Browser Source natively, so you can add a mic-reactive PNGTuber by pasting a single URL. That avoids installing third-party plugins, keeping your setup simpler and less likely to break when OBS updates.",
    },
    {
      id: "obs-4",
      question: "How do I make my PNGTuber react to my microphone in OBS?",
      answer:
        "Select your microphone under Settings then Audio, and make sure its level meter responds when you speak. The Browser Source uses that audio level to switch between idle and talking expressions. If reactions are too sensitive or too weak, adjust mic gain and add a Noise Gate or Noise Suppression filter.",
    },
    {
      id: "obs-5",
      question: "Why is my PNGTuber not moving in OBS?",
      answer:
        "The most common fixes are: confirm the right microphone is selected and showing levels, refresh the Browser Source cache from its properties, and check that a Noise Gate filter is not cutting off your voice. Also make sure you generated a talking expression — without one, the avatar has nothing to switch to.",
    },
    {
      id: "obs-6",
      question: "What size should a PNGTuber Browser Source be in OBS?",
      answer:
        "Set the Browser Source to 800 x 800 and scale it down using Edit Transform. Rendering at a higher base size keeps the avatar sharp, and scaling in OBS is smooth and reversible. You can also lock the source once positioned so it cannot be moved by accident.",
    },
    {
      id: "obs-7",
      question: "Does an OBS PNGTuber work on Twitch, YouTube, and Kick?",
      answer:
        "Yes. OBS handles the avatar, and OBS can stream to Twitch, YouTube, Kick, and other platforms. The same Browser Source appears in your stream no matter which platform you broadcast to, so you do not need a separate setup for each.",
    },
    {
      id: "obs-8",
      question: "Can I use a PNGTuber with Streamlabs Desktop?",
      answer:
        "Yes. Streamlabs Desktop, Twitch Studio, and other broadcast apps support browser-based sources, so the same Browser Source URL works there too. The menus look different from OBS, but the steps are the same: add a browser source, paste the URL, size it, and position it.",
    },
    {
      id: "obs-9",
      question: "Is a mic-reactive PNGTuber in OBS free?",
      answer:
        "You can start for free: PNGTuberMaker gives new users 1 free avatar generation with no credit card, and OBS Studio is free and open source. Optional credits and the Creator Pass unlock more generations, expression packs, and HD exports if you want them.",
    },
  ],
  cta: {
    title: "Your OBS PNGTuber Is One URL Away",
    subtitle:
      "Generate a custom, mic-reactive avatar and paste it into OBS in minutes. Start with 1 free generation — no credit card, no plugins, no rigging.",
    ctaText: "Generate My PNGTuber Free",
    ctaHref: "/create",
  },
  relatedPages: [
    {
      title: "How to Make a PNGTuber",
      description: "The full beginner guide from character idea to going live.",
      href: "/guides/how-to-make-a-pngtuber",
    },
    {
      title: "Free PNGTuber Maker",
      description: "Start with 1 free generation — no credit card required.",
      href: "/free-pngtuber-maker",
    },
    {
      title: "PNGTuber Models",
      description: "Find or generate the right model for your stream.",
      href: "/pngtuber-models",
    },
    {
      title: "PNGTuber for Twitch",
      description: "Set up your avatar and alerts for Twitch streaming.",
      href: "/for/twitch",
    },
    {
      title: "PNGTuber for YouTube",
      description: "Go live on YouTube with a custom talking avatar.",
      href: "/for/youtube",
    },
    {
      title: "VTuber Maker",
      description: "Generate a full VTuber-style avatar with AI.",
      href: "/vtuber-maker",
    },
  ],
  breadcrumbs: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "OBS PNGTuber",
    },
  ],
};

export default function OBSPNGTuberPage() {
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
