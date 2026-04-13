import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { brand } from "@/lib/brand";
import { isRtl, type Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: {
    default: `PNGTuber Maker — Free AI PNGTuber Avatar Generator | ${brand.name}`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Free AI PNGTuber Maker — Create custom PNGTuber avatars, expression packs & animations for Twitch, YouTube & Discord streaming. No art skills needed. Go live in minutes.",
  keywords: [
    "PNGTuber Maker",
    "PNGTuber",
    "PNG Tuber",
    "PNGTuber avatar",
    "PNGTuber generator",
    "free PNGTuber maker",
    "AI PNGTuber",
    "VTuber maker",
    "VTuber avatar maker",
    "AI avatar generator",
    "Twitch avatar maker",
    "YouTube avatar maker",
    "Discord avatar maker",
    "streaming avatar",
    "PNGTuber expressions",
    "PNGTuber software",
    "anime avatar maker",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: brand.name }],
  creator: brand.name,
  publisher: brand.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(brand.contact.website),
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: brand.name,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: brand.contact.website,
    siteName: brand.name,
    title: brand.name,
    description: brand.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: brand.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
    images: ["/og-image.jpg"],
  },
  category: "technology",
  classification: "Software",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: brand.name,
  url: brand.contact.website,
  description: brand.description,
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "7.99",
    priceCurrency: "USD",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as Locale;

  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} data-theme="light">
      <head>
        <script defer src="https://admin.tritonix.cn/t.js" data-site="2" />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
