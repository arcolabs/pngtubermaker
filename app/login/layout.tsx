import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to PNGTuberMaker with Google, GitHub, Discord, or Twitch to start creating AI-powered PNGTuber avatars.",
  robots: { index: false },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
