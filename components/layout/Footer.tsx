import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Card container with rounded corners */}
      <div className="max-w-screen-xl mx-auto bg-[#1A1A1A] rounded-3xl p-8 sm:p-12 lg:p-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 group select-none"
            >
              <Image
                src="/logo.svg"
                alt="Thumb-Free Logo"
                width={40}
                height={40}
                className="h-10 w-10 transition-transform duration-200 group-hover:scale-105 pointer-events-none select-none"
                priority
                draggable={false}
              />
              <h3 className="text-white font-semibold text-xl tracking-tight group-hover:text-white/90 transition-colors duration-200">
                Thumb-Free
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              Thumb-Free AI Thumbnail Generator: The World's First{" "}
              <span className="text-white font-medium">Free</span>, Unlimited AI
              Engine Built for Grow Your Channel.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-white font-normal text-[20px] leading-[26px] tracking-[-0.8px]">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/start"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 text-white font-normal text-[20px] leading-[26px] tracking-[-0.8px]">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Careers
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@thumb-free.com"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 text-white font-normal text-[20px] leading-[26px] tracking-[-0.8px]">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools Links */}
          <div>
            <h4 className="mb-4 text-white font-normal text-[20px] leading-[26px] tracking-[-0.8px]">
              Tools
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/youtube-thumbnail-grabber"
                  className="text-muted-foreground hover:text-[#FF5555] transition-colors duration-200"
                >
                  YouTube Thumbnail Grabber
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Thumb-Free. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <Link
              href="/legal/terms"
              className="hover:text-[#FF5555] transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link
              href="/legal/privacy"
              className="hover:text-[#FF5555] transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
