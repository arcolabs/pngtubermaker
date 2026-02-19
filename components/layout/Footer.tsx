"use client";

import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-100 text-base-content">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        {/* Mobile: compact single-column / Desktop: 4-col grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src={brand.logo.svgPath}
                alt={brand.logo.alt}
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
                draggable={false}
              />
            </Link>
            <p className="text-sm text-base-content/50 mt-3 max-w-xs">
              {brand.description}
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            <h6 className="footer-title">Product</h6>
            <Link href="/pricing" className="link link-hover text-sm">
              Pricing
            </Link>
          </nav>

          <nav className="flex flex-col gap-2">
            <h6 className="footer-title">Resources</h6>
            <Link
              href={brand.social.discord || "https://discord.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover text-sm"
            >
              Discord
            </Link>
            <Link href="/partners" className="link link-hover text-sm">
              Partners
            </Link>
          </nav>

          <nav className="flex flex-col gap-2">
            <h6 className="footer-title">Legal</h6>
            <Link href="/legal/terms" className="link link-hover text-sm">
              Terms
            </Link>
            <Link href="/legal/privacy" className="link link-hover text-sm">
              Privacy
            </Link>
          </nav>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-5">
          <Link href="/" className="inline-block">
            <Image
              src={brand.logo.svgPath}
              alt={brand.logo.alt}
              width={120}
              height={40}
              className="h-7 w-auto"
              priority
              draggable={false}
            />
          </Link>
          <p className="text-sm text-base-content/50 max-w-xs">
            {brand.description}
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/pricing" className="link link-hover">
              Pricing
            </Link>
            <Link
              href={brand.social.discord || "https://discord.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover"
            >
              Discord
            </Link>
            <Link href="/partners" className="link link-hover">
              Partners
            </Link>
            <Link href="/legal/terms" className="link link-hover">
              Terms
            </Link>
            <Link href="/legal/privacy" className="link link-hover">
              Privacy
            </Link>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-base-content/10">
          <p className="text-sm text-base-content/40">
            © {currentYear} {brand.name}
          </p>
          <a
            href={`mailto:${brand.contact.email}`}
            className="link link-hover text-sm text-base-content/40"
          >
            {brand.contact.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
