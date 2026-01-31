"use client";

import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: "what-is-thumb-free",
    question: "What is Thumb-Free?",
    answer:
      "Thumb-Free is a YouTube thumbnail creation tool built to help creators create, test & iterate thumbnails & titles that get clicked.\n\nThis is not a generic image generator. Everything is designed around YouTube performance, CTR & repeatable results.\n\nNo designers. No photoshoots. No guesswork.",
  },
  {
    id: "why-choose-thumb-free",
    question: "Why choose Thumb-Free over ChatGPT, Midjourney or other AI tools?",
    answer:
      "Those tools generate images. Thumb-Free is built specifically for YouTube thumbnails & titles. Thumb-Free focuses on performance, not aesthetics.\n\nWhat Thumb-Free does that generic AI doesn't:\n01. Recreate thumbnails that already work\n02. Score thumbnails & titles with data-backed feedback\n03. Fix weak packaging in one click\n04. Stay consistent with Persona, FaceSwap & Style\n05. Generate titles optimized for CTR",
  },
  {
    id: "use-own-face",
    question: "Can I use Thumb-Free with my own face?",
    answer:
      "Yes.\n\nUpload a few photos once, create your Persona, then reuse your face consistently across all thumbnails.\n\nNo reshoots. No awkward poses. No photoshoot days.",
  },
  {
    id: "design-skills",
    question: "Do I need design skills to use Thumb-Free?",
    answer:
      "No.\n\nEverything works through simple prompts & text-based edits. You describe what you want changed, Thumb-Free handles the execution.",
  },
  {
    id: "how-it-works",
    question: "How does it work?",
    answer:
      "Simply enter your video title, upload your photo, and let Thumb-Free generate professional thumbnails in seconds. You can then iterate, optimize, and download your final design.",
  },
  {
    id: "pricing",
    question: "What are the pricing options?",
    answer:
      "Thumb-Free offers flexible pricing plans to suit creators of all sizes. Check our pricing page for the latest plans and features.",
  },
];

export default function FAQ() {
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
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph starts with numbered list (e.g., "01.")
      if (/^\d+\./.test(paragraph.trim())) {
        return (
          <p key={index} className="mb-2">
            {paragraph}
          </p>
        );
      }
      return (
        <p key={index} className={index < paragraphs.length - 1 ? "mb-4" : ""}>
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
          Frequently Asked Questions
        </h2>
        <button
          type="button"
          aria-label="Open chat to contact support"
          className="text-center hidden sm:block text-[#FFFFFF80] duration-300 text-sm lg:text-base focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm p-2 touch-action-manipulation"
        >
          The most common questions, answered.
          <br />
          <span className="text-[#FFFFFFE6]">
            Anything else?&nbsp;
            <span className="underline duration-300 hover:text-primary">
              Click here
            </span>{" "}
            to talk directly to the team.
          </span>
        </button>
        <button
          type="button"
          aria-label="Open chat to contact support"
          className="text-center block sm:hidden text-[#FFFFFF80] duration-300 text-sm lg:text-base focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm p-2 touch-action-manipulation"
        >
          The most common questions, answered.
          <br />
          <span className="text-[#FFFFFFE6]">
            Anything else?
            <br />
            <span className="underline duration-300 hover:text-primary">
              Click here
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
                      >
                        <path d="M11 11V6C11 5.44772 11.4477 5 12 5V5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12V12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19V19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12V12C5 11.4477 5.44772 11 6 11H11Z" />
                      </svg>
                    </div>
                  </div>
                  <h4
                    className={`text-sm flex-1 lg:text-base duration-300 group-hover:opacity-100 ${
                      item.id === "what-is-thumb-free"
                        ? isOpen
                          ? "text-[#FF5555] font-bold opacity-90"
                          : "text-[#FF5555] font-bold opacity-70 group-hover:opacity-100"
                        : isOpen
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
                  aria-labelledby={buttonId}
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
