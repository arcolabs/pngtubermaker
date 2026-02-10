"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UserButton } from "@/components/auth/auth-buttons";

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
            <Link
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/posts"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              Blog
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
        <div className="lg:hidden relative border-t border-border/30 backdrop-blur-xl">
          <nav className="max-w-screen-xl mx-auto px-6 py-4 space-y-1">
            <Link
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/posts"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#FF5555] hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              Blog
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
