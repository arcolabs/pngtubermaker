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
    id: "free-no-signup",
    question: "Is Thumb-Free really 100% free? Do I need to sign up?",
    answer:
      "Yes — Thumb-Free is completely free with unlimited thumbnail generations. Forever.\n\nNo sign-up required. No login. No credit card needed. Just visit the site, enter your video title, upload your photo, and generate professional YouTube thumbnails instantly. You can start creating immediately without creating an account.",
  },
  {
    id: "no-login-required",
    question: "Can I use Thumb-Free without logging in or creating an account?",
    answer:
      "Absolutely. Thumb-Free works without any login or account creation.\n\nUnlike other AI thumbnail generators that force you to sign up first, we believe in instant access. Just open thumbfree.com and start generating thumbnails right away. No email required. No password to remember. No account verification.",
  },
  {
    id: "whats-the-catch",
    question: "How is Thumb-Free free? What's the catch?",
    answer:
      "There's no catch. Thumb-Free is funded by optional premium features for power users who need advanced capabilities.\n\nThe core thumbnail generation — unlimited generations, face upload, basic editing — is 100% free for everyone. No hidden fees, no credit card required, no surprise charges. We believe every creator deserves access to professional tools regardless of budget.",
  },
  {
    id: "vs-paid-tools",
    question:
      "Why use Thumb-Free instead of paid tools like Canva or Photoshop?",
    answer:
      "Thumb-Free is built specifically for YouTube thumbnails with AI at its core.\n\nWhile Canva and Photoshop are great general design tools, Thumb-Free focuses exclusively on YouTube performance:\n• AI-powered thumbnail generation from text prompts\n• Face consistency with Persona upload\n• CTR-optimized layouts based on viral thumbnails\n• Instant generation — no design skills needed\n• 100% free, no subscription required\n\nSave $20-50/month and get better results designed for YouTube.",
  },
  {
    id: "what-is-thumb-free",
    question: "What is Thumb-Free and how does it work?",
    answer:
      "Thumb-Free is a free AI-powered YouTube thumbnail generator that helps creators make professional thumbnails without design skills.\n\nHow it works:\n1. Enter your video title\n2. Upload your photo (optional, for face consistency)\n3. Describe the style you want or use our templates\n4. AI generates multiple thumbnail options in seconds\n5. Download and use on your YouTube video\n\nNo software to install. Works in your browser on desktop, tablet, or mobile.",
  },
  {
    id: "unlimited-generations",
    question: "Is there a limit on how many thumbnails I can generate?",
    answer:
      "No limits. Generate as many thumbnails as you need.\n\nUnlike other AI tools that give you 10-50 free generations then force you to pay, Thumb-Free offers truly unlimited thumbnail creation. Create 10 thumbnails or 1,000 — it's always free. Perfect for A/B testing different thumbnail styles or creating thumbnails for your entire content calendar.",
  },
];

export default function FAQ({
  title = "Frequently Asked Questions",
  description = "The most common questions, answered.",
  supportText = "Anything else?",
  supportLinkText = "Click here",
  faqData = defaultFaqData,
}: FAQProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set([faqData[0]?.id]),
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatAnswer = (answer: string | React.ReactNode): React.ReactNode => {
    if (typeof answer !== "string") {
      return answer;
    }

    // Split by double newlines to create paragraphs
    const paragraphs = answer.split("\n\n");
    return paragraphs.map((paragraph) => {
      // Check if paragraph starts with numbered list (e.g., "01.")
      if (/^\d+\./.test(paragraph.trim())) {
        return (
          <p key={paragraph.slice(0, 10)} className="mb-2">
            {paragraph}
          </p>
        );
      }
      return (
        <p key={paragraph.slice(0, 10)} className="mb-4">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <section
      id="faq"
      className="relative flex flex-col justify-between items-center w-full pt-14 lg:pt-16"
      aria-labelledby="faq-heading"
    >
      <header className="w-full flex flex-col gap-2 justify-between items-center">
        <h2
          id="faq-heading"
          className="font-semibold text-2xl lg:text-4xl text-center leading-[1.1] bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
          }}
        >
          {title}
        </h2>
        <button
          type="button"
          aria-label="Open chat to contact support"
          className="text-center hidden sm:block text-[#FFFFFF80] duration-300 text-sm lg:text-base focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm p-2 touch-action-manipulation"
        >
          {description}
          <br />
          <span className="text-[#FFFFFFE6]">
            {supportText}&nbsp;
            <span className="underline duration-300 hover:text-primary">
              {supportLinkText}
            </span>{" "}
            to talk directly to the team.
          </span>
        </button>
        <button
          type="button"
          aria-label="Open chat to contact support"
          className="text-center block sm:hidden text-[#FFFFFF80] duration-300 text-sm lg:text-base focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm p-2 touch-action-manipulation"
        >
          {description}
          <br />
          <span className="text-[#FFFFFFE6]">
            {supportText}
            <br />
            <span className="underline duration-300 hover:text-primary">
              {supportLinkText}
            </span>{" "}
            to talk directly to the team.
          </span>
        </button>
      </header>

      <ul
        className="flex w-full flex-col gap-2 lg:gap-3 mt-6 lg:mt-12"
        aria-label="Frequently asked questions"
      >
        {faqData.map((item) => {
          const isOpen = openItems.has(item.id);
          const contentId = `accordion-content-${item.id}`;
          const buttonId = `accordion-button-${item.id}`;

          return (
            <li key={item.id}>
              <div
                className={`group flex flex-col items-start rounded-2xl duration-300 ease-in-out ${
                  isOpen ? "bg-white/10" : ""
                } hover:bg-white/10 shadow-[inset_0_0_16px_rgba(240,247,245,0.1)] hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.2)] border border-white/10 hover:border-white/20`}
              >
                <button
                  type="button"
                  className="flex items-center w-full min-h-12 p-4 duration-200 border border-transparent rounded-xl text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 touch-action-manipulation"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  id={buttonId}
                  onClick={() => toggleItem(item.id)}
                >
                  <div
                    className="w-7 h-7 min-w-7 min-h-7 rounded-lg mr-4 flex items-center justify-center border border-white/10 bg-white/10 group-hover:border-primary/25 shadow-inner-primary-sm/10 group-hover:bg-primary/15 opacity-90 duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <div
                      className={`${
                        isOpen ? "rotate-45" : "group-hover:rotate-6"
                      } text-primary ease-out will-change-transform duration-300 group-hover:text-primary`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M11 11V6C11 5.44772 11.4477 5 12 5V5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12V12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19V19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12V12C5 11.4477 5.44772 11 6 11H11Z" />
                      </svg>
                    </div>
                  </div>
                  <h4
                    className={`text-sm flex-1 lg:text-base duration-300 group-hover:opacity-100 ${
                      isOpen
                        ? "text-primary font-medium opacity-90 group-hover:text-primary"
                        : "font-medium opacity-70 group-hover:text-primary group-hover:opacity-100"
                    }`}
                  >
                    {item.question}
                  </h4>
                </button>
                <div
                  className={`text-left text-sm px-4 transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                  id={contentId}
                >
                  <div className="mb-4 text-[#FFFFFF80]">
                    {formatAnswer(item.answer)}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
