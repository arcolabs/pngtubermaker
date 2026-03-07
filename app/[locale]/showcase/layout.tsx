import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Showcase",
  description:
    "Browse AI-generated PNGTuber avatars created by our community. Get inspired for your next streaming character.",
  alternates: {
    canonical: "/showcase",
  },
};

export default function ShowcaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
