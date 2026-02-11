"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UserButton } from "@/components/auth/auth-buttons";

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Transparent glass effect with blur only */}
      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src="/logo.svg"
              alt="Thumb-Free Logo"
              width={48}
              height={48}
              className="h-12 w-12 transition-transform duration-200 group-hover:scale-105 pointer-events-none select-none"
              priority
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <span className="text-xl font-semibold text-foreground tracking-tight group-hover:text-foreground/90 transition-colors duration-200 select-none">
              Thumb-Free
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="#features"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              Features
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200 bg-transparent border-0"
            >
              How It Works
            </button>
            <Link
              href="#faq"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              FAQ
            </Link>
          </nav>

          {/* Right side - Auth button */}
          <div className="flex items-center gap-3">
            <UserButton />

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden relative border-t border-border/30 backdrop-blur-xl bg-background/95">
          <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 space-y-2">
            <Link
              href="#features"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-4 text-base font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-white/5 rounded-xl transition-all duration-200 min-h-[52px] active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Features icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Features
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => scrollToSection("how-it-works"), 100);
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-4 text-base font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-white/5 rounded-xl transition-all duration-200 bg-transparent border-0 min-h-[52px] active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>How It Works icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              How It Works
            </button>
            <Link
              href="#faq"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-4 text-base font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-white/5 rounded-xl transition-all duration-200 min-h-[52px] active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>FAQ icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              FAQ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
