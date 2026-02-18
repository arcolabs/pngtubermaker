"use client";

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
    id: "free",
    question: "Is this template really free to use?",
    answer:
      "Yes — this template is completely free and open source. Use it for personal projects, commercial products, or anything else. No attribution required.",
  },
  {
    id: "tech-stack",
    question: "What technologies are included in this template?",
    answer:
      "The template includes Next.js 16, React 19, Tailwind CSS v4, Drizzle ORM, better-auth for authentication, and R2-compatible storage. Everything you need to ship a production app.",
  },
  {
    id: "customize",
    question: "How easy is it to customize?",
    answer:
      "Very easy. All brand-specific content uses environment variables. Just update the config and replace the placeholder content with your own. The component structure is modular and easy to extend.",
  },
  {
    id: "deployment",
    question: "How do I deploy this?",
    answer:
      "The template is optimized for Vercel deployment but works with any platform that supports Next.js. Database uses Neon which is serverless-ready, and R2 works great with Vercel or Cloudflare.",
  },
  {
    id: "database",
    question: "Do I need to set up a database?",
    answer:
      "Yes, you'll need a Neon PostgreSQL database. The template includes the schema and all the necessary setup scripts. Just create a project on Neon and add your connection string to .env.",
  },
  {
    id: "auth",
    question: "Is authentication included?",
    answer:
      "Yes, better-auth is configured and ready to use. It supports email/password, OAuth (Google, GitHub), and session management. Just configure your OAuth credentials in the environment variables.",
  },
];

export default function FAQ({
  title = "Frequently Asked Questions",
  description = "The most common questions, answered.",
  supportText = "Have more questions?",
  supportLinkText = "Open an issue",
  faqData = defaultFaqData,
}: FAQProps) {
  const [openId, setOpenId] = useState<string | null>(faqData[0]?.id ?? null);

  return (
    <section id="faq" className="py-20" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            id="faq-heading"
            className="font-semibold text-2xl lg:text-4xl leading-[1.1] text-base-content mb-3"
          >
            {title}
          </h2>
          <p className="text-base-content/50">{description}</p>
        </div>

        <div className="flex flex-col gap-2">
          {faqData.map((item) => (
            <div
              key={item.id}
              className={`collapse collapse-arrow border border-base-content/10 transition-colors ${
                openId === item.id
                  ? "collapse-open border-primary/30"
                  : "collapse-close"
              }`}
            >
              <input
                type="radio"
                name="faq-accordion"
                checked={openId === item.id}
                onChange={() => setOpenId(openId === item.id ? null : item.id)}
              />
              <div className="collapse-title font-medium text-base-content">
                {item.question}
              </div>
              <div className="collapse-content text-base-content/60">
                {typeof item.answer === "string" ? (
                  <p>{item.answer}</p>
                ) : (
                  item.answer
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-base-content/50">
          {supportText}{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary"
          >
            {supportLinkText}
          </a>
        </div>
      </div>
    </section>
  );
}
