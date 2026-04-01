import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for PNGTuber avatar generation. Free credits to start, Creator Pass at $7.99/mo. Create professional streaming avatars with AI.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
