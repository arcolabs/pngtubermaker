"use client";

import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-100 text-base-content">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center group">
              <Image
                src={brand.logo.svgPath}
                alt={brand.logo.alt}
                width={120}
                height={40}
                className="h-10 w-auto"
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
            <Link href="/dashboard" className="link link-hover text-sm">
              Dashboard
            </Link>
            <Link href="/pricing" className="link link-hover text-sm">
              Pricing
            </Link>
          </nav>

          <nav className="flex flex-col gap-2">
            <h6 className="footer-title">Resources</h6>
            <Link
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover text-sm"
            >
              Documentation
            </Link>
            <Link
              href={brand.social.github || "https://github.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover text-sm"
            >
              GitHub
            </Link>
            {brand.social.discord && (
              <Link
                href={brand.social.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover text-sm"
              >
                Discord
              </Link>
            )}
          </nav>

          <nav className="flex flex-col gap-2">
            <h6 className="footer-title">Legal</h6>
            <Link href="/legal/terms" className="link link-hover text-sm">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="link link-hover text-sm">
              Privacy Policy
            </Link>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-16">
          <p className="text-sm text-base-content/40">
            © {currentYear} {brand.name}. All rights reserved.
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
