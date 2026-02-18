"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UserButton } from "@/components/auth/auth-buttons";
import { brand } from "@/lib/brand";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-sm">
      <nav className="navbar container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="navbar-start">
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={brand.logo.svgPath}
              alt={brand.logo.alt}
              width={48}
              height={48}
              className="h-10 w-10 sm:h-12 sm:w-12 transition-transform duration-200 group-hover:scale-105 pointer-events-none select-none"
              priority
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <span className="text-lg sm:text-xl font-semibold text-base-content tracking-tight group-hover:text-primary transition-colors duration-200 select-none">
              {brand.name}
            </span>
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link
                href="/dashboard"
                className="text-base-content/70 hover:text-primary hover:bg-primary/10"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="text-base-content/70 hover:text-primary hover:bg-primary/10"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-end gap-2 sm:gap-3">
          <UserButton />

          <div className="dropdown dropdown-end lg:hidden">
            <button
              type="button"
              tabIndex={0}
              className="btn btn-ghost btn-square"
              aria-label="Toggle menu"
              onClick={() => setIsOpen(!isOpen)}
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
            {isOpen && (
              <ul className="dropdown-content menu bg-base-200 rounded-box z-[1] mt-2 w-52 p-2 shadow-xl border border-base-content/10">
                <li>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" onClick={() => setIsOpen(false)}>
                    Pricing
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
