"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

interface FAQProps {
  title?: string;
  description?: string;
  supportText?: string;
  supportLinkText?: string;
  faqData?: FAQItem[];
}

const defaultFaqData: FAQItem[] = [
  {
    id: "1",
    question: "What is PNGTuberMaker and how does it work?",
    answer:
      "PNGTuberMaker is an AI-powered tool that lets you create custom PNG avatars for streaming. Just describe your character or upload a reference image, and our AI will generate multiple avatar options — complete with expressions and optional animations. No art skills needed.",
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
      "Yes. You can upload sketches, character references, or screenshots. The AI will use them to match your style and keep your character consistent across expressions and animations.",
  },
  {
    id: "4",
    question: "What file formats do you export?",
    answer:
      "We support transparent PNG for static avatars and GIF / MP4 / WebM for animations. Perfect for OBS, Discord, or Twitch overlays.",
  },
  {
    id: "5",
    question: "Are the avatars I generate unique and safe to use?",
    answer:
      "Yes. All avatars are generated from your own inputs and are unique. You get a full license to use them for streaming, content creation, and commercial use.",
  },
  {
    id: "6",
    question: "Can I use the avatars commercially?",
    answer:
      "Absolutely. The Pro plan comes with a full commercial license. You can use your avatars in streams, videos, thumbnails, merchandise, or even resell to clients.",
  },
  {
    id: "7",
    question: "What's included in the free plan?",
    answer:
      "The free plan gives you 500 welcome credits to try PNGTuberMaker — enough to generate a full avatar with expressions. Upgrade to Start or Pro for monthly credits, HD/4K export, and more expression packs.",
  },
  {
    id: "8",
    question: "How long does it take to generate an avatar?",
    answer:
      "Most avatars are generated in under 1 minute. Expression packs and short animations take 1–3 minutes depending on complexity. You can preview, pick your favorite, and refine instantly.",
  },
];

export default function FAQ({
  title = "Frequently Asked Questions",
  supportText = "Have more questions?",
  supportLinkText = "Contact us",
  faqData = defaultFaqData,
}: Omit<FAQProps, "description">) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-white" aria-labelledby="faq-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="faq-heading"
          className="text-center text-3xl font-bold text-gray-900 mb-16"
        >
          {title}
        </h2>

        <div className="space-y-4">
          {faqData.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg bg-white shadow-sm transition-all duration-200 ${
                openId === item.id
                  ? "border-gray-400"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(item.id)}
                className="w-full text-left p-6 flex items-center justify-between text-gray-800 hover:text-gray-900 transition-colors outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0"
                aria-expanded={openId === item.id}
              >
                <span className="text-lg font-medium pr-8">
                  {item.question}
                </span>
                <span className="flex-shrink-0">
                  {openId === item.id ? (
                    <Minus className="w-6 h-6" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openId === item.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-gray-200 p-6 text-gray-700 leading-relaxed">
                    {typeof item.answer === "string" ? (
                      <p>{item.answer}</p>
                    ) : (
                      item.answer
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          {supportText}{" "}
          <a
            href="https://discord.gg/zysPAnvP8f"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {supportLinkText}
          </a>
        </div>
      </div>
    </section>
  );
}
