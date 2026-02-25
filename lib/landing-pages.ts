import type { FAQItem } from "./faq-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  images: { src: string; alt: string }[];
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

// ---------------------------------------------------------------------------
// Helper — generates BreadcrumbList + FAQPage + WebPage JSON-LD
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page Data
// ---------------------------------------------------------------------------

export const landingPages: Record<string, LandingPageData> = {
  // =========================================================================
  // 1. VTuber Maker — /vtuber-maker (6,800 combined volume)
  // =========================================================================
  "vtuber-maker": {
    slug: "vtuber-maker",
    metadata: {
      title: "VTuber Maker — Create Your VTuber Avatar with AI",
      description:
        "Create a custom VTuber avatar in minutes with AI. Generate unique characters, expression packs, and animations for streaming on Twitch, YouTube, and Discord.",
      keywords: [
        "vtuber maker",
        "vtuber model maker",
        "ai vtuber maker",
        "vtuber avatar maker",
        "vtuber avatar generator",
        "vtuber model",
      ],
      canonical: "/vtuber-maker",
    },
    hero: {
      badge: "AI-Powered VTuber Creator",
      title: "Create Your VTuber Avatar with AI",
      subtitle:
        "Design a unique VTuber model in minutes — no art skills required. Generate custom characters with expression packs and go live on any streaming platform.",
      ctaText: "Create Your VTuber",
      ctaHref: "/create",
    },
    features: {
      title: "Everything You Need to Go Live as a VTuber",
      items: [
        {
          icon: "Wand2",
          title: "AI-Powered Generation",
          description:
            "Describe your character or upload a reference image. Our AI generates multiple unique VTuber designs for you to choose from.",
        },
        {
          icon: "Layers",
          title: "Expression Packs",
          description:
            "Generate a complete set of expressions — happy, angry, sad, surprised — all consistent with your character's style.",
        },
        {
          icon: "Monitor",
          title: "Stream-Ready in Minutes",
          description:
            "Get a Browser Source URL for OBS Studio. Your VTuber avatar appears on stream with transparent background, reacting to your voice in real time.",
        },
        {
          icon: "Shield",
          title: "Commercial License Included",
          description:
            "Every avatar you create is yours. Use it on Twitch, YouTube, Discord, social media, and merchandise — full commercial rights.",
        },
      ],
    },
    comparison: {
      title: "PNGTuber vs Traditional VTuber",
      description:
        "See why thousands of streamers choose PNGTubers over full VTuber rigs.",
      columns: [
        { label: "Feature" },
        { label: "PNGTuberMaker", highlight: true },
        { label: "Traditional VTuber" },
      ],
      rows: [
        { feature: "Cost", values: ["Free – $7.99/mo", "$200 – $2,000+"] },
        {
          feature: "Setup time",
          values: ["Under 5 minutes", "2–8 weeks"],
        },
        {
          feature: "Face tracking",
          values: ["Not needed", "Webcam + software required"],
        },
        {
          feature: "Hardware",
          values: ["Microphone only", "Webcam + GPU"],
        },
        {
          feature: "OBS setup",
          values: ["Paste one URL", "Complex NDI/capture config"],
        },
        { feature: "AI generation", values: [true, false] },
        {
          feature: "Expression pack",
          values: ["AI-generated", "Each expression costs extra"],
        },
      ],
    },
    showcase: {
      title: "VTuber Avatars Created with AI",
      description:
        "Every avatar below was generated in seconds — no art skills required.",
      images: [
        {
          src: "/images/showcase/1.WEBP",
          alt: "AI-generated VTuber avatar — fantasy character",
        },
        {
          src: "/images/showcase/3.WEBP",
          alt: "AI-generated VTuber avatar — anime style",
        },
        {
          src: "/images/showcase/5.WEBP",
          alt: "AI-generated VTuber avatar — cute character",
        },
        {
          src: "/images/showcase/7.WEBP",
          alt: "AI-generated VTuber avatar — colorful design",
        },
        {
          src: "/images/showcase/9.WEBP",
          alt: "AI-generated VTuber avatar — modern look",
        },
        {
          src: "/images/showcase/10.WEBP",
          alt: "AI-generated VTuber avatar — unique style",
        },
      ],
    },
    faqs: [
      {
        id: "vm-1",
        question: "What is a VTuber maker?",
        answer:
          "A VTuber maker is a tool that helps you create a virtual avatar for streaming. PNGTuberMaker uses AI to generate custom VTuber characters from text descriptions or reference images, complete with expression packs for live streaming.",
      },
      {
        id: "vm-2",
        question: "Is PNGTubing better than VTubing?",
        answer:
          "PNGTubers are simpler and lighter than full VTuber rigs. They don't require face tracking, a webcam, or expensive software — just a browser source in OBS. PNGTuberMaker gives you a professional look with zero setup overhead.",
      },
      {
        id: "vm-3",
        question: "Do I need a webcam or face tracking?",
        answer:
          "No. PNGTuber avatars react to your microphone input, not face tracking. When you speak, your avatar animates automatically. No webcam, no plugins, no extra hardware.",
      },
      {
        id: "vm-4",
        question: "Can I use my VTuber avatar on Twitch and YouTube?",
        answer:
          "Yes. Your avatar works on any platform that supports OBS Browser Sources — including Twitch, YouTube, Kick, and more. You get a unique URL that you paste into OBS as a Browser Source.",
      },
      {
        id: "vm-5",
        question: "How much does it cost to create a VTuber avatar?",
        answer:
          "New users get free credits to create their first avatar and expression pack. Traditional VTuber commissions cost $200-$2,000+ and take weeks — PNGTuberMaker delivers in minutes for a fraction of the cost.",
      },
    ],
    cta: {
      title: "Ready to Become a VTuber?",
      subtitle:
        "Create your avatar in minutes. No art skills, no expensive commissions.",
      ctaText: "Start Creating Free",
      ctaHref: "/create",
    },
    relatedPages: [
      {
        title: "Anime Avatar Maker",
        description: "Create anime-style VTuber avatars with AI.",
        href: "/style/anime",
      },
      {
        title: "Free PNGTuber Maker",
        description: "Get started with free avatar generation credits.",
        href: "/free-pngtuber-maker",
      },
      {
        title: "How to Make a PNGTuber",
        description: "Step-by-step guide to creating your first avatar.",
        href: "/guides/how-to-make-a-pngtuber",
      },
    ],
    breadcrumbs: [{ label: "Home", href: "/" }, { label: "VTuber Maker" }],
  },

  // =========================================================================
  // 2. Anime Avatar Maker — /style/anime (4,200 combined volume)
  // =========================================================================
  "style-anime": {
    slug: "style/anime",
    metadata: {
      title: "Anime Avatar Maker — Create Anime Characters with AI",
      description:
        "Create stunning anime avatars and characters with AI. Design custom anime-style PNGTubers for streaming, Discord, and social media. No drawing skills needed.",
      keywords: [
        "anime avatar maker",
        "anime character creator",
        "anime avatar generator",
        "anime pngtuber",
        "anime vtuber maker",
        "custom anime avatar",
      ],
      canonical: "/style/anime",
    },
    hero: {
      badge: "Anime Style Generator",
      title: "Create Anime Avatars with AI",
      subtitle:
        "Design stunning anime characters in minutes. Describe your character — hair color, outfit, personality — and AI generates a professional anime avatar with matching expressions.",
      ctaText: "Create Anime Avatar",
      ctaHref: "/create",
    },
    features: {
      title: "Professional Anime Avatars in Minutes",
      items: [
        {
          icon: "Palette",
          title: "Authentic Anime Styles",
          description:
            "Generate avatars in classic anime art styles — from soft shojo to sharp shonen aesthetics. Each design captures the look and feel of professional anime character art.",
        },
        {
          icon: "Sparkles",
          title: "AI Character Design",
          description:
            "Describe your ideal anime character in plain English. The AI understands anime tropes, hairstyles, outfits, and accessories to bring your vision to life.",
        },
        {
          icon: "Layers",
          title: "Matching Expression Pack",
          description:
            "Get a full set of anime expressions — tsundere blush, battle-ready glare, cheerful smile — all consistent with your character's design and color palette.",
        },
        {
          icon: "Download",
          title: "High-Res Transparent PNG",
          description:
            "Export your anime avatar as transparent PNG files up to 4K resolution. Perfect for OBS overlays, Discord profiles, YouTube thumbnails, and social media.",
        },
      ],
    },
    showcase: {
      title: "AI-Generated Anime Avatars",
      description:
        "Browse anime characters created by our AI — from chibi to detailed illustration styles.",
      images: [
        {
          src: "/images/showcase/1.WEBP",
          alt: "AI-generated anime avatar — fantasy character",
        },
        {
          src: "/images/showcase/3.WEBP",
          alt: "AI-generated anime avatar — colorful design",
        },
        {
          src: "/images/showcase/5.WEBP",
          alt: "AI-generated anime avatar — cute character",
        },
        {
          src: "/images/showcase/7.WEBP",
          alt: "AI-generated anime avatar — detailed style",
        },
        {
          src: "/images/showcase/9.WEBP",
          alt: "AI-generated anime avatar — expressive character",
        },
        {
          src: "/images/showcase/10.WEBP",
          alt: "AI-generated anime avatar — unique design",
        },
      ],
    },
    faqs: [
      {
        id: "aa-1",
        question: "Can I create any anime style?",
        answer:
          "Yes. PNGTuberMaker's AI can generate a wide range of anime styles — from cute chibi characters to detailed realistic anime art. Just describe the style you want in your prompt, or upload a reference image.",
      },
      {
        id: "aa-2",
        question: "How do I make my anime avatar look like a specific style?",
        answer:
          'Be specific in your description. Include details like "pastel colors, soft shading, large expressive eyes" for a shojo style, or "sharp lines, bold colors, dynamic pose" for a shonen look. You can also upload reference art.',
      },
      {
        id: "aa-3",
        question: "Can I use my anime avatar as a Discord profile picture?",
        answer:
          "Absolutely. Export your anime avatar as a transparent PNG and use it anywhere — Discord, Twitch, YouTube, Twitter, or any platform that accepts image uploads.",
      },
      {
        id: "aa-4",
        question: "Are the anime avatars unique?",
        answer:
          "Yes. Every avatar is generated uniquely based on your description. No two characters are alike, and you get full commercial rights to use your creation.",
      },
      {
        id: "aa-5",
        question: "Can I create anime characters without drawing skills?",
        answer:
          "That's exactly what PNGTuberMaker is built for. Just type a description of your character and the AI handles all the art. No drawing tablet, no software skills — just your imagination.",
      },
    ],
    cta: {
      title: "Design Your Anime Character Now",
      subtitle:
        "From description to professional anime avatar in under a minute.",
      ctaText: "Start Creating Free",
      ctaHref: "/create",
    },
    relatedPages: [
      {
        title: "VTuber Maker",
        description: "Create any style of VTuber avatar with AI.",
        href: "/vtuber-maker",
      },
      {
        title: "Discord Avatar Maker",
        description: "Design anime avatars optimized for Discord.",
        href: "/for/discord",
      },
      {
        title: "Free PNGTuber Maker",
        description: "Get started with free anime avatar generation.",
        href: "/free-pngtuber-maker",
      },
    ],
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Anime Avatar Maker" },
    ],
  },

  // =========================================================================
  // 3. How to Make a PNGTuber — /guides/how-to-make-a-pngtuber (890 volume)
  // =========================================================================
  "guides-how-to-make-a-pngtuber": {
    slug: "guides/how-to-make-a-pngtuber",
    metadata: {
      title: "How to Make a PNGTuber — Step-by-Step Guide (2026)",
      description:
        "Learn how to make a PNGTuber in 5 minutes. Step-by-step guide covering avatar design, expression packs, OBS setup, and going live on Twitch and YouTube.",
      keywords: [
        "how to make a pngtuber",
        "how to be a pngtuber",
        "how to become a pngtuber",
        "pngtuber tutorial",
        "pngtuber guide",
        "create pngtuber",
      ],
      canonical: "/guides/how-to-make-a-pngtuber",
    },
    hero: {
      badge: "Step-by-Step Guide",
      title: "How to Make a PNGTuber in 5 Minutes",
      subtitle:
        "Everything you need to go from zero to streaming with your own PNGTuber avatar. No art skills, no expensive software — just follow these four simple steps.",
      ctaText: "Start Making Your PNGTuber",
      ctaHref: "/create",
    },
    steps: {
      title: "4 Steps to Your First PNGTuber",
      items: [
        {
          title: "Describe Your Character",
          description:
            'Open PNGTuberMaker and type a description of your ideal avatar. Be as detailed as you like — "anime cat girl with blue hair and a hoodie" or "pixel art robot with glowing eyes." You can also upload a sketch or reference image.',
        },
        {
          title: "Pick Your Favorite Design",
          description:
            "The AI generates multiple unique designs based on your prompt. Browse the options, compare styles, and select the one that fits your streaming personality. You can regenerate or refine until it's perfect.",
        },
        {
          title: "Generate Expression Pack",
          description:
            "Once you've chosen your base avatar, generate a matching expression pack — happy, angry, sad, surprised, and more. All expressions stay consistent with your character's art style and colors.",
        },
        {
          title: "Add to OBS and Go Live",
          description:
            "Copy your unique Browser Source URL and paste it into OBS Studio. Your PNGTuber appears on stream with a transparent background and reacts to your microphone automatically. No plugins needed — just go live.",
        },
      ],
    },
    prose: {
      title: "What You Need to Get Started",
      blocks: [
        {
          subtitle: "What Is a PNGTuber?",
          text: "A PNGTuber is a static or semi-animated avatar that reacts to your microphone input while you stream. Unlike full VTubers that require face-tracking software, a webcam, and expensive Live2D or 3D models, PNGTubers use simple PNG images that swap based on whether you're speaking or silent. This makes them the perfect entry point for streamers who want a character on screen without the technical overhead. All you need is a microphone and OBS Studio.",
        },
        {
          subtitle: "Software You'll Need",
          text: "You only need two things: PNGTuberMaker (runs entirely in your browser — no download required) and OBS Studio (free, open-source streaming software). PNGTuberMaker handles avatar creation, expression packs, and provides a Browser Source URL that you paste into OBS. That's it — no plugins, no additional apps, no complex configuration.",
        },
        {
          subtitle: "Tips for Great Results",
          text: "Be specific in your character description — include hair color, outfit details, and personality traits. Upload a reference image if you have one; the AI will match the style closely. When generating expressions, start with the core four (happy, sad, angry, surprised) before adding extras. For the best stream look, position your avatar in a corner with a slight padding from the edge.",
        },
      ],
    },
    comparison: {
      title: "PNGTuber Tools Compared",
      description:
        "How PNGTuberMaker stacks up against other popular PNGTuber tools.",
      columns: [
        { label: "Feature" },
        { label: "PNGTuberMaker", highlight: true },
        { label: "PNGTuber Plus" },
        { label: "veadotube" },
      ],
      rows: [
        {
          feature: "Type",
          values: ["AI Web App", "Desktop App", "Desktop App"],
        },
        {
          feature: "Price",
          values: ["Free to start", "Free", "Free"],
        },
        { feature: "AI generation", values: [true, false, false] },
        {
          feature: "Expression packs",
          values: ["AI-generated", "Manual upload", "Manual upload"],
        },
        {
          feature: "Platform",
          values: ["Any device (web)", "Windows/Mac/Linux", "Windows/Mac"],
        },
        {
          feature: "OBS integration",
          values: [
            "Browser Source URL",
            "Window Capture",
            "NDI/Window Capture",
          ],
        },
        {
          feature: "Learning curve",
          values: ["Beginner-friendly", "Moderate", "Moderate"],
        },
      ],
    },
    faqs: [
      {
        id: "htmp-1",
        question: "Can I make my own PNGTuber?",
        answer:
          "Yes! PNGTuberMaker lets anyone create a custom PNGTuber avatar with AI. Just describe your character, pick a design, generate expressions, and you're ready to stream. No art skills or expensive commissions required.",
      },
      {
        id: "htmp-2",
        question: "Is PNGTuber maker free?",
        answer:
          "Yes. PNGTuberMaker offers free credits for new users — enough to create your first avatar with an expression pack. Free exports are at 512px. Upgrade for HD/4K exports and more generations.",
      },
      {
        id: "htmp-3",
        question: "Can you make a PNGTuber on mobile?",
        answer:
          "PNGTuberMaker works in any modern web browser, including mobile. You can design your avatar on your phone, but OBS streaming setup is best done on desktop.",
      },
      {
        id: "htmp-4",
        question: "What software do I need to be a PNGTuber?",
        answer:
          "Just two things: PNGTuberMaker (to create your avatar) and OBS Studio (to stream). PNGTuberMaker runs in your browser — no downloads. OBS is free and open source.",
      },
      {
        id: "htmp-5",
        question: "How long does it take to set up a PNGTuber?",
        answer:
          "Most users go from zero to streaming-ready in under 5 minutes. Avatar generation takes about 30 seconds, expression packs take 1-2 minutes, and OBS setup is just pasting a URL.",
      },
    ],
    cta: {
      title: "Ready to Make Your PNGTuber?",
      subtitle: "Follow the steps above and go live in minutes.",
      ctaText: "Create Your PNGTuber Now",
      ctaHref: "/create",
    },
    relatedPages: [
      {
        title: "Free PNGTuber Maker",
        description: "Start creating with free generation credits.",
        href: "/free-pngtuber-maker",
      },
      {
        title: "VTuber Maker",
        description: "Explore all VTuber avatar styles and options.",
        href: "/vtuber-maker",
      },
      {
        title: "Twitch Avatar Maker",
        description: "Create avatars optimized for Twitch streaming.",
        href: "/for/twitch",
      },
    ],
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "How to Make a PNGTuber" },
    ],
  },

  // =========================================================================
  // 4. Free PNGTuber Maker — /free-pngtuber-maker (820 combined volume)
  // =========================================================================
  "free-pngtuber-maker": {
    slug: "free-pngtuber-maker",
    metadata: {
      title: "Free PNGTuber Maker — Create Avatars at No Cost",
      description:
        "Create your PNGTuber avatar for free with AI. Get free generation credits, design custom characters and expressions, and start streaming today. No credit card required.",
      keywords: [
        "free pngtuber maker",
        "free pngtuber",
        "pngtuber maker free",
        "pngtuber free",
        "pngtuber software free",
        "free avatar maker",
      ],
      canonical: "/free-pngtuber-maker",
    },
    hero: {
      badge: "100% Free to Start",
      title: "Free PNGTuber Maker",
      subtitle:
        "Create your first PNGTuber avatar completely free. Get welcome credits on signup — enough for a full avatar with expression pack. No credit card, no trial, no catch.",
      ctaText: "Start Free — No Card Required",
      ctaHref: "/create",
    },
    features: {
      title: "What You Get for Free",
      items: [
        {
          icon: "Gift",
          title: "Free Welcome Credits",
          description:
            "Every new account gets free generation credits. That's enough to create a complete avatar with an expression pack — no purchase required.",
        },
        {
          icon: "Wand2",
          title: "Full AI Avatar Generation",
          description:
            "Free users get the same AI generation quality as paid plans. Describe your character, get multiple designs, and pick your favorite.",
        },
        {
          icon: "Layers",
          title: "Expression Pack Included",
          description:
            "Generate a matching expression pack with your free credits — happy, sad, angry, surprised. Everything you need to start streaming.",
        },
        {
          icon: "Monitor",
          title: "OBS Integration",
          description:
            "Get your Browser Source URL and start streaming immediately. Free plan includes full OBS integration with mic-reactive animations.",
        },
      ],
    },
    comparison: {
      title: "Free vs Creator Pass",
      description:
        "Everything you get for free — and what unlocks with the Creator Pass.",
      columns: [
        { label: "Feature" },
        { label: "Free Plan" },
        { label: "Creator Pass ($7.99/mo)", highlight: true },
      ],
      rows: [
        { feature: "Welcome credits", values: [true, true] },
        {
          feature: "Monthly credits",
          values: ["—", "6,000/month"],
        },
        {
          feature: "Export resolution",
          values: ["512px", "1080p HD"],
        },
        { feature: "All expressions", values: [false, true] },
        { feature: "Priority queue", values: [false, true] },
        {
          feature: "Commercial license",
          values: ["Limited", "Full"],
        },
      ],
    },
    faqs: [
      {
        id: "fp-1",
        question: "Is PNGTuber Maker really free?",
        answer:
          "Yes. You get free welcome credits when you sign up — no credit card required. Free credits are enough to create a full avatar with an expression pack. You only pay if you want more generations or higher resolution exports.",
      },
      {
        id: "fp-2",
        question: "What's the difference between free and paid plans?",
        answer:
          "Free users get welcome credits and 512px exports. Paid plans offer more generation credits, HD (1080p) and 4K exports, all expressions and animations, priority queue, and commercial licensing.",
      },
      {
        id: "fp-3",
        question: "Do free avatars have watermarks?",
        answer:
          "No. All PNGTuberMaker avatars are watermark-free, including those created on the free plan. The only limitation is export resolution (512px on free vs 1080p/4K on paid plans).",
      },
      {
        id: "fp-4",
        question: "Can I use free avatars for streaming?",
        answer:
          "Yes! Free avatars work perfectly for streaming. You get the same OBS Browser Source integration, mic-reactive animations, and transparent backgrounds as paid users.",
      },
      {
        id: "fp-5",
        question: "How do I get more credits after using the free ones?",
        answer:
          "You can purchase credit packs starting at $2.99, or subscribe to the Creator Pass for monthly credits at $7.99/month. Both options unlock HD exports and additional features.",
      },
    ],
    cta: {
      title: "Start Creating for Free",
      subtitle:
        "No credit card. No trial period. Just sign up and start making your PNGTuber.",
      ctaText: "Create Free PNGTuber",
      ctaHref: "/create",
    },
    relatedPages: [
      {
        title: "How to Make a PNGTuber",
        description: "Complete beginner's guide to creating PNGTubers.",
        href: "/guides/how-to-make-a-pngtuber",
      },
      {
        title: "VTuber Maker",
        description: "Explore all avatar styles beyond PNGTubers.",
        href: "/vtuber-maker",
      },
      {
        title: "Anime Avatar Maker",
        description: "Create anime-style characters with AI.",
        href: "/style/anime",
      },
    ],
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Free PNGTuber Maker" },
    ],
  },

  // =========================================================================
  // 5. Discord Avatar Maker — /for/discord (480 volume)
  // =========================================================================
  "for-discord": {
    slug: "for/discord",
    metadata: {
      title: "Discord Avatar Maker — Create Custom Discord PFP with AI",
      description:
        "Create a unique Discord avatar with AI. Design custom profile pictures, server icons, and PNGTuber characters for Discord. Free to start, no art skills needed.",
      keywords: [
        "discord avatar maker",
        "discord profile picture maker",
        "discord pfp maker",
        "custom discord avatar",
        "discord avatar generator",
        "discord pngtuber",
      ],
      canonical: "/for/discord",
    },
    hero: {
      badge: "Made for Discord",
      title: "Create Custom Discord Avatars with AI",
      subtitle:
        "Stand out in every server with a unique AI-generated avatar. Design custom Discord profile pictures and PNGTuber characters that match your personality.",
      ctaText: "Create Discord Avatar",
      ctaHref: "/create",
    },
    features: {
      title: "Perfect Avatars for Discord",
      items: [
        {
          icon: "User",
          title: "Unique Profile Pictures",
          description:
            "Generate a one-of-a-kind avatar that stands out in any Discord server. No more generic profile pictures — get something that represents you.",
        },
        {
          icon: "Sparkles",
          title: "AI-Powered Design",
          description:
            "Describe your ideal avatar in plain English and let AI handle the art. Works great for anime, pixel art, realistic, and fantasy styles.",
        },
        {
          icon: "Download",
          title: "Discord-Optimized Export",
          description:
            "Export transparent PNGs optimized for Discord's circular crop. Your avatar looks crisp at any size — from server list to expanded profile view.",
        },
        {
          icon: "Layers",
          title: "Expression Packs for Bots",
          description:
            "Create matching expression sets for Discord bots, reaction images, or server emotes. All expressions stay consistent with your character's style.",
        },
      ],
    },
    platformSpecs: {
      title: "Discord Image Specifications",
      items: [
        {
          label: "Profile Picture",
          value: "128×128 min, recommended 1024×1024",
        },
        { label: "Server Icon", value: "512×512 pixels" },
        { label: "Custom Emoji", value: "128×128 pixels, under 256 KB" },
        { label: "Sticker", value: "320×320 pixels" },
      ],
    },
    steps: {
      title: "How to Set Up Your Discord Avatar",
      items: [
        {
          title: "Create Your Character",
          description:
            "Open PNGTuberMaker and describe your ideal Discord avatar. The AI generates multiple unique designs for you to choose from.",
        },
        {
          title: "Export as PNG",
          description:
            "Choose your favorite design and export it as a transparent PNG. The file is optimized for Discord's circular crop.",
        },
        {
          title: "Open Discord Settings",
          description:
            "Go to Discord → Settings → Profiles → Change Avatar. Select the PNG file you just downloaded.",
        },
        {
          title: "Upload Your Avatar",
          description:
            "Upload your transparent PNG avatar. It works for profile pictures, server icons, and custom emotes.",
        },
      ],
    },
    faqs: [
      {
        id: "dc-1",
        question: "What size should a Discord avatar be?",
        answer:
          "Discord recommends at least 128x128 pixels, but displays avatars at various sizes up to 1024x1024. PNGTuberMaker exports high-resolution PNGs that look crisp at any Discord size.",
      },
      {
        id: "dc-2",
        question: "Can I make animated Discord avatars?",
        answer:
          "PNGTuberMaker creates static PNG avatars and expression packs. For animated Discord avatars (GIF), you'll need Discord Nitro. Our expression packs give you multiple poses to use as reaction images or emotes.",
      },
      {
        id: "dc-3",
        question: "Can I use my avatar as a Discord server icon?",
        answer:
          "Yes. Transparent PNG exports work perfectly as Discord server icons. The AI-generated designs are centered and clean, making them ideal for server branding.",
      },
      {
        id: "dc-4",
        question: "Do I need to know how to draw?",
        answer:
          "Not at all. Just type a description of the avatar you want — the AI generates professional-quality artwork. You can also upload a reference image to guide the style.",
      },
    ],
    cta: {
      title: "Level Up Your Discord Presence",
      subtitle: "Create a unique avatar that stands out in every server.",
      ctaText: "Make Your Discord Avatar",
      ctaHref: "/create",
    },
    relatedPages: [
      {
        title: "Twitch Avatar Maker",
        description: "Create avatars for Twitch streaming.",
        href: "/for/twitch",
      },
      {
        title: "YouTube Avatar Maker",
        description: "Design avatars for your YouTube channel.",
        href: "/for/youtube",
      },
      {
        title: "Anime Avatar Maker",
        description: "Create anime-style avatars for any platform.",
        href: "/style/anime",
      },
    ],
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Platforms" },
      { label: "Discord Avatar Maker" },
    ],
  },

  // =========================================================================
  // 6. Twitch Avatar Maker — /for/twitch (300 volume)
  // =========================================================================
  "for-twitch": {
    slug: "for/twitch",
    metadata: {
      title: "Twitch Avatar Maker — Create Twitch PNGTuber Avatars",
      description:
        "Create a custom Twitch avatar and PNGTuber with AI. Design stream-ready characters with expression packs and OBS integration. Go live in minutes.",
      keywords: [
        "twitch avatar maker",
        "twitch avatar",
        "twitch profile picture maker",
        "twitch pngtuber",
        "twitch streaming avatar",
        "twitch emote maker",
      ],
      canonical: "/for/twitch",
    },
    hero: {
      badge: "Built for Twitch Streamers",
      title: "Create Your Twitch PNGTuber Avatar",
      subtitle:
        "Design a professional streaming avatar with AI and go live on Twitch in minutes. Get a mic-reactive PNGTuber with expression packs — no commission wait times.",
      ctaText: "Create Twitch Avatar",
      ctaHref: "/create",
    },
    features: {
      title: "Stream-Ready Avatars for Twitch",
      items: [
        {
          icon: "Monitor",
          title: "OBS Browser Source Ready",
          description:
            "Get a unique Browser Source URL. Paste it into OBS Studio and your avatar appears on stream with transparent background — zero plugins required.",
        },
        {
          icon: "Mic",
          title: "Mic-Reactive Animation",
          description:
            "Your avatar reacts to your voice in real time. Mouth opens when you speak, closes when you're quiet — all powered by your browser's microphone.",
        },
        {
          icon: "Layers",
          title: "Twitch Expression Pack",
          description:
            "Generate expressions that match Twitch culture — hype face, salty reaction, pog moment, chill vibes. Keep your stream personality consistent.",
        },
        {
          icon: "Zap",
          title: "Lightweight on Your PC",
          description:
            "Unlike Live2D or VTuber rigs, PNGTubers run as a simple browser source. No CPU overhead, no GPU drain, no stream quality impact.",
        },
      ],
    },
    steps: {
      title: "Go Live on Twitch in 5 Steps",
      items: [
        {
          title: "Create Your Avatar",
          description:
            "Open PNGTuberMaker and describe your streaming character. Generate multiple designs and pick your favorite.",
        },
        {
          title: "Generate Expressions",
          description:
            "Create a full expression pack — happy, angry, sad, surprised — all consistent with your character's style.",
        },
        {
          title: "Copy Browser Source URL",
          description:
            "After selecting your avatar and expressions, copy the unique Browser Source URL provided by PNGTuberMaker.",
        },
        {
          title: "Add to OBS Studio",
          description:
            "In OBS, click Sources → Add → Browser Source. Paste the URL and set width/height to 300×300.",
        },
        {
          title: "Position and Go Live",
          description:
            "Drag your avatar overlay to your preferred position on the stream layout. Hit Start Streaming — your PNGTuber reacts to your mic automatically.",
        },
      ],
    },
    comparison: {
      title: "PNGTuberMaker vs Commission",
      description: "Why create with AI instead of hiring an artist on Fiverr?",
      columns: [
        { label: "Feature" },
        { label: "PNGTuberMaker", highlight: true },
        { label: "Fiverr / Commission" },
      ],
      rows: [
        { feature: "Cost", values: ["Free – $7.99/mo", "$50 – $200+"] },
        {
          feature: "Delivery",
          values: ["Under 5 minutes", "1–3 weeks"],
        },
        {
          feature: "Revisions",
          values: ["Unlimited regeneration", "Usually 1–2 included"],
        },
        {
          feature: "Expression pack",
          values: ["Full set, AI-generated", "Each costs extra"],
        },
        {
          feature: "Consistency",
          values: ["AI-guaranteed", "Depends on artist"],
        },
      ],
    },
    faqs: [
      {
        id: "tw-1",
        question: "How do I add a PNGTuber to my Twitch stream?",
        answer:
          "After creating your avatar on PNGTuberMaker, you get a unique Browser Source URL. In OBS Studio, add a new Browser Source, paste the URL, and your PNGTuber appears on stream. It reacts to your mic automatically.",
      },
      {
        id: "tw-2",
        question: "Do I need face tracking for a Twitch PNGTuber?",
        answer:
          "No. PNGTubers use microphone input, not face tracking. Your avatar's mouth reacts when you speak. No webcam needed — perfect for camera-shy streamers.",
      },
      {
        id: "tw-3",
        question: "Will a PNGTuber slow down my stream?",
        answer:
          "Not at all. PNGTubers run as a lightweight browser source in OBS. Unlike VTuber software that needs GPU rendering, PNGTubers use minimal system resources.",
      },
      {
        id: "tw-4",
        question: "Can I use my PNGTuber on Twitch and YouTube?",
        answer:
          "Yes. Your PNGTuber works anywhere that supports OBS Browser Sources. Stream on Twitch, YouTube, Kick, or any other platform — same avatar, same URL.",
      },
      {
        id: "tw-5",
        question: "How much does a Twitch avatar commission cost?",
        answer:
          "Traditional avatar commissions cost $200-$2,000+ and take 2-8 weeks. With PNGTuberMaker, you can create a professional Twitch avatar with expressions in minutes, starting for free.",
      },
    ],
    cta: {
      title: "Go Live on Twitch Today",
      subtitle: "Create your streaming avatar and start your PNGTuber journey.",
      ctaText: "Create Twitch Avatar Free",
      ctaHref: "/create",
    },
    relatedPages: [
      {
        title: "Discord Avatar Maker",
        description: "Create matching avatars for your Discord server.",
        href: "/for/discord",
      },
      {
        title: "YouTube Avatar Maker",
        description: "Design avatars for YouTube streaming and content.",
        href: "/for/youtube",
      },
      {
        title: "VTuber Maker",
        description: "Explore all VTuber avatar styles.",
        href: "/vtuber-maker",
      },
    ],
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Platforms" },
      { label: "Twitch Avatar Maker" },
    ],
  },

  // =========================================================================
  // 7. YouTube Avatar Maker — /for/youtube (140 volume)
  // =========================================================================
  "for-youtube": {
    slug: "for/youtube",
    metadata: {
      title: "YouTube Avatar Maker — Create YouTube Channel Avatars",
      description:
        "Create a custom YouTube avatar and PNGTuber with AI. Design unique channel art, profile pictures, and streaming characters. Perfect for YouTube content creators.",
      keywords: [
        "youtube avatar maker",
        "youtube avatar",
        "youtube profile picture maker",
        "youtube pngtuber",
        "youtube channel avatar",
        "youtube streaming avatar",
      ],
      canonical: "/for/youtube",
    },
    hero: {
      badge: "Made for YouTube Creators",
      title: "Create Your YouTube Avatar with AI",
      subtitle:
        "Design a professional avatar for your YouTube channel, thumbnails, and live streams. Generate unique characters with expression packs — perfect for PNGTuber content.",
      ctaText: "Create YouTube Avatar",
      ctaHref: "/create",
    },
    features: {
      title: "Avatars Built for YouTube Creators",
      items: [
        {
          icon: "Image",
          title: "Channel Art Ready",
          description:
            "Create high-resolution avatars that look great as YouTube profile pictures, video thumbnails, end screens, and channel banners.",
        },
        {
          icon: "Video",
          title: "YouTube Live PNGTuber",
          description:
            "Stream on YouTube with a mic-reactive PNGTuber avatar. Works with OBS Studio as a Browser Source — transparent background, automatic lip sync.",
        },
        {
          icon: "Layers",
          title: "Thumbnail Expression Pack",
          description:
            "Generate matching expressions for clickable thumbnails — shocked face, happy reaction, angry rant. Consistent character across all your content.",
        },
        {
          icon: "Download",
          title: "4K Export for YouTube",
          description:
            "Export at up to 4K resolution — perfect for YouTube's high-quality displays. Transparent PNGs work seamlessly in thumbnail editors and video software.",
        },
      ],
    },
    platformSpecs: {
      title: "YouTube Image Specifications",
      items: [
        { label: "Channel Profile Picture", value: "800×800 pixels" },
        { label: "Video Thumbnail", value: "1280×720 pixels" },
        { label: "Channel Banner", value: "2560×1440 pixels" },
        { label: "Live Stream Overlay", value: "Transparent PNG, any size" },
      ],
    },
    steps: {
      title: "How to Use Your Avatar on YouTube",
      items: [
        {
          title: "Create Your Avatar",
          description:
            "Open PNGTuberMaker and design your YouTube character with a matching expression pack.",
        },
        {
          title: "Set as Channel Profile Picture",
          description:
            "Export your avatar and upload it as your YouTube channel profile picture for brand consistency.",
        },
        {
          title: "Use in Thumbnails",
          description:
            "Drop expression variants into your thumbnail editor. Reaction faces drive clicks — use shocked, happy, and angry expressions.",
        },
        {
          title: "Stream Live with OBS",
          description:
            "Add the Browser Source URL in OBS Studio for YouTube Live streaming. Your avatar reacts to your microphone automatically.",
        },
      ],
    },
    faqs: [
      {
        id: "yt-1",
        question: "What size should a YouTube avatar be?",
        answer:
          "YouTube recommends 800x800 pixels for channel profile pictures. PNGTuberMaker exports at up to 4K (2160px), so your avatar looks crisp on any device — from mobile to desktop to TV screens.",
      },
      {
        id: "yt-2",
        question: "Can I use my avatar in YouTube thumbnails?",
        answer:
          "Yes. Export transparent PNG avatars and drop them into your thumbnail editor. The expression packs are perfect for reaction-style thumbnails that drive clicks.",
      },
      {
        id: "yt-3",
        question: "How do I stream on YouTube with a PNGTuber?",
        answer:
          "Set up OBS Studio for YouTube streaming, then add your PNGTuberMaker Browser Source URL. Your avatar appears on stream with transparent background, reacting to your microphone in real time.",
      },
      {
        id: "yt-4",
        question: "Can I use the same avatar on YouTube and Twitch?",
        answer:
          "Absolutely. Your PNGTuber avatar works on any platform. Use the same character for YouTube videos, Twitch streams, Discord servers, and social media profiles.",
      },
    ],
    cta: {
      title: "Start Your YouTube Avatar Channel",
      subtitle:
        "Create a professional avatar that makes your content instantly recognizable.",
      ctaText: "Create YouTube Avatar Free",
      ctaHref: "/create",
    },
    relatedPages: [
      {
        title: "Twitch Avatar Maker",
        description: "Create matching avatars for Twitch streaming.",
        href: "/for/twitch",
      },
      {
        title: "Discord Avatar Maker",
        description: "Design avatars for your Discord community.",
        href: "/for/discord",
      },
      {
        title: "VTuber Maker",
        description: "Explore all VTuber and PNGTuber avatar styles.",
        href: "/vtuber-maker",
      },
    ],
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Platforms" },
      { label: "YouTube Avatar Maker" },
    ],
  },
};
