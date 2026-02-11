import { GeistMono } from "geist/font/mono";
import { GeistPixelGrid } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from "@/components/seo/StructuredData";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thumb-free.com";

export const metadata: Metadata = {
  title: {
    default: "Thumb-Free - Free AI YouTube Thumbnail Generator",
    template: "%s | Thumb-Free",
  },
  description:
    "Create professional YouTube thumbnails in seconds with AI. 100% free, unlimited thumbnail generation. No credit card required.",
  keywords: [
    "YouTube thumbnail generator",
    "AI thumbnail maker",
    "free thumbnail creator",
    "YouTube thumbnail downloader",
    "AI YouTube thumbnails",
  ],
  authors: [{ name: "Thumb-Free" }],
  creator: "Thumb-Free",
  publisher: "Thumb-Free",
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
  alternates: {
    canonical: baseUrl,
  },
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
    title: "Thumb-Free",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Thumb-Free",
    title: "Thumb-Free - Free AI YouTube Thumbnail Generator",
    description:
      "Create professional YouTube thumbnails in seconds with AI. 100% free, unlimited thumbnail generation.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Thumb-Free AI Thumbnail Generator - Create professional YouTube thumbnails",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thumb-Free - Free AI YouTube Thumbnail Generator",
    description:
      "Create professional YouTube thumbnails in seconds with AI. 100% free, unlimited.",
    images: ["/og-image.jpg"],
    creator: "@thumbfree",
  },
  verification: {
    // Add verification tokens when you have them:
    // google: "your-google-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "technology",
  classification: "Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <OrganizationStructuredData />
        <WebsiteStructuredData />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelGrid.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
