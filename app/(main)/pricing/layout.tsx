import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for PNGTuber avatar generation. Free tier, Start at $9/mo, Pro at $30/mo. Create professional streaming avatars with AI.",
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
