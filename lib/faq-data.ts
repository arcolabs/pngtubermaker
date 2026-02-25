/**
 * FAQ data shared between the FAQ UI component and JSON-LD structured data.
 * Keep answers as plain strings (no JSX) so they can be used in both contexts.
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    id: "1",
    question: "What is PNGTuberMaker and how does it work?",
    answer:
      "PNGTuberMaker is an AI-powered tool that lets you create custom PNG avatars for streaming. Just describe your character or upload a reference image, and our AI will generate multiple avatar options — complete with expression packs for different emotions. No art skills needed.",
  },
  {
    id: "2",
    question: "Do I need to know how to draw to use PNGTuberMaker?",
    answer:
      'Not at all! PNGTuberMaker is designed for everyone — from complete beginners to experienced creators. You can simply write a short description (e.g. "anime cat girl with blue hair") or upload a reference picture, and the AI handles the rest.',
  },
  {
    id: "3",
    question: "Can I upload my own sketches or reference images?",
    answer:
      "Yes. You can upload sketches, character references, or screenshots. The AI will use them to match your style and keep your character consistent across all expressions.",
  },
  {
    id: "4",
    question: "What file formats do you export?",
    answer:
      "We export transparent PNG files for individual avatars and expressions, plus a ZIP bundle containing your full expression pack. Perfect for OBS, Discord, or Twitch overlays.",
  },
  {
    id: "5",
    question: "Are the avatars I generate unique and safe to use?",
    answer:
      "Yes. All avatars are generated from your own inputs and are unique. Free users can use them for streaming, social media, and personal content. Creator Pass subscribers get full commercial rights including merchandise and paid content.",
  },
  {
    id: "6",
    question: "Can I use the avatars commercially?",
    answer:
      "Free avatars can be used for streaming, YouTube videos, Discord, and social media. For full commercial rights (merchandise, brand deals, paid content), upgrade to the Creator Pass at $7.99/month.",
  },
  {
    id: "7",
    question: "What's included in the free plan?",
    answer:
      "New users get 1,000 welcome credits — enough for a full avatar with an expression pack. Exports are at 512px. You can buy more credits anytime, or subscribe to the Creator Pass for 6,000 credits/month and HD (1080p) export.",
  },
  {
    id: "8",
    question: "How long does it take to generate an avatar?",
    answer:
      "Most avatars are generated in under 1 minute. Expression packs take 1–3 minutes depending on complexity. You can preview, pick your favorite, and refine instantly.",
  },
  {
    id: "9",
    question: "How does the OBS integration work?",
    answer:
      "After creating your avatar and expressions, you get a unique Browser Source URL. Paste it into OBS Studio as a Browser Source — your avatar appears on stream with a transparent background, ready to react to your mic input. No plugins or extra software needed.",
  },
  {
    id: "10",
    question: "Does it sync with my microphone?",
    answer:
      "Yes! The OBS player uses your browser's microphone access to detect when you're speaking. Your avatar's mouth opens and closes in real time, giving your stream a natural, responsive PNGTuber experience — all running directly in the Browser Source.",
  },
  {
    id: "11",
    question: "What's coming next?",
    answer:
      "We're working on Agent Avatars — give your AI agent a virtual face that can appear on stream, in Discord, or anywhere you need a visual presence. Join our Discord to get early access and shape what comes next.",
  },
];

/**
 * Generate FAQPage JSON-LD structured data from FAQ items.
 */
export function generateFAQJsonLd(items: FAQItem[] = faqData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
