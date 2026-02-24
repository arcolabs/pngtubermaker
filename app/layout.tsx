import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: `${brand.name} - AI PNGTuber Avatar Generator`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  keywords: [
    "PNGTuber",
    "VTuber",
    "avatar generator",
    "AI avatar",
    "streaming",
    "Twitch avatar",
    "YouTube avatar",
    "Discord avatar",
    "virtual character",
    "PNG avatar",
  ],
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
    highPrice: "30",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <head>
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
