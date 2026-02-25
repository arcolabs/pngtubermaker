"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { faqData as defaultFaqData, type FAQItem } from "@/lib/faq-data";

interface FAQProps {
  title?: string;
  description?: string;
  supportText?: string;
  supportLinkText?: string;
  faqData?: FAQItem[];
}

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
