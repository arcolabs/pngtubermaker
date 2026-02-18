export const brand = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "PNGTuberMaker",
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || "PNGTuber",
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Create professional PNGTuber avatars in minutes with AI. Generate custom characters, expressions, and animations for streaming on Twitch, YouTube, and Discord.",

  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@pngtubermaker.com",
    website: process.env.NEXT_PUBLIC_APP_URL || "https://pngtubermaker.com",
  },

  social: {
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB || "",
    discord:
      process.env.NEXT_PUBLIC_SOCIAL_DISCORD || "https://discord.gg/zysPAnvP8f",
  },

  logo: {
    svgPath: "/logo.svg",
    alt: "PNGTuberMaker Logo",
  },

  ascii: {
    enabled: true,
    text:
      (process.env.NEXT_PUBLIC_APP_NAME || "PNGTuberMaker")
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 10) || "PNGTUBER",
  },

  features: {
    auth: process.env.NEXT_PUBLIC_FEATURE_AUTH !== "false",
    storage: process.env.NEXT_PUBLIC_FEATURE_STORAGE !== "false",
  },

  theme: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#06b6d4",
  },
} as const;

export type Brand = typeof brand;
