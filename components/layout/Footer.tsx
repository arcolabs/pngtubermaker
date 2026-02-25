"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { brand } from "@/lib/brand";

interface BadgeData {
  id: string;
  url: string;
  imageUrl: string;
  altText: string;
  width: number;
  height: number;
}

const BADGES_PER_PAGE = 2;
const ROTATE_INTERVAL = 8000; // 8s per group

function FooterBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    fetch("/api/badges")
      .then((res) => (res.ok ? res.json() : { badges: [] }))
      .then((data) => setBadges(data.badges))
      .catch(() => {});
  }, []);

  const pages = useMemo(() => {
    const result: BadgeData[][] = [];
    for (let i = 0; i < badges.length; i += BADGES_PER_PAGE) {
      result.push(badges.slice(i, i + BADGES_PER_PAGE));
    }
    return result;
  }, [badges]);

  const needsRotation = pages.length > 1;

  const rotate = useCallback(() => {
    setPageIndex((prev) => (prev + 1) % pages.length);
  }, [pages.length]);

  useEffect(() => {
    if (!needsRotation) return;
    const timer = setInterval(rotate, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [needsRotation, rotate]);

  if (pages.length === 0) return null;

  const currentPage = pages[pageIndex] ?? pages[0];

  return (
    <div className="flex items-center gap-3">
      {currentPage.map((b) => (
        <a
          key={b.id}
          href={b.url}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-50 hover:opacity-80 transition-opacity duration-500"
        >
          {/* biome-ignore lint/performance/noImgElement: external badge image */}
          <img
            src={b.imageUrl}
            alt={b.altText}
            width={Math.round(b.width * 0.55)}
            height={Math.round(b.height * 0.55)}
          />
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <footer className="bg-base-100 text-base-content">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        {/* Mobile: compact single-column / Desktop: 4-col grid */}
        <div className="hidden md:grid md:grid-cols-5 gap-10">
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
            <Link
              href="/create"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              Create Avatar
            </Link>
            <Link
              href="/pricing"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              Pricing
            </Link>
            <Link
              href="/free-pngtuber-maker"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              Free PNGTuber Maker
            </Link>
            <Link
              href="/vtuber-maker"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              VTuber Maker
            </Link>
          </nav>

          <nav className="flex flex-col gap-2">
            <h6 className="footer-title">Resources</h6>
            <Link
              href="/guides/how-to-make-a-pngtuber"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              How to Make a PNGTuber
            </Link>
            <Link
              href="/for/twitch"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              Twitch Avatar Maker
            </Link>
            <Link
              href="/for/discord"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              Discord Avatar Maker
            </Link>
            <Link
              href="/for/youtube"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              YouTube Avatar Maker
            </Link>
          </nav>

          <nav className="flex flex-col gap-2">
            <h6 className="footer-title">Community</h6>
            <Link
              href={brand.social.discord || "https://discord.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              Discord
            </Link>
            <Link
              href="/partners"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              Partners
            </Link>
          </nav>

          <nav className="flex flex-col gap-2">
            <h6 className="footer-title">Legal</h6>
            <Link
              href="/legal/terms"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="text-base-content/70 hover:text-primary transition-colors text-sm"
            >
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
            <Link
              href="/create"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Create Avatar
            </Link>
            <Link
              href="/pricing"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/free-pngtuber-maker"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Free PNGTuber Maker
            </Link>
            <Link
              href="/vtuber-maker"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              VTuber Maker
            </Link>
            <Link
              href="/guides/how-to-make-a-pngtuber"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              How to Make a PNGTuber
            </Link>
            <Link
              href={brand.social.discord || "https://discord.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Discord
            </Link>
            <Link
              href="/partners"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Partners
            </Link>
            <Link
              href="/legal/terms"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Privacy
            </Link>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-base-content/10">
          <p className="text-sm text-base-content/40">
            © {currentYear} {brand.name}
          </p>
          <div className="flex items-center gap-4">
            {isHomepage && <FooterBadges />}
            <a
              href={`mailto:${brand.contact.email}`}
              className="text-sm text-base-content/40 hover:text-primary transition-colors"
            >
              {brand.contact.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
