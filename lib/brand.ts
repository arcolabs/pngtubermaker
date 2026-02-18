export const brand = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "NextJS Template",
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || "Template",
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "A production-ready Next.js starter template with React 19 and Tailwind CSS v4.",

  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@example.com",
    website: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  social: {
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB || "",
    discord: process.env.NEXT_PUBLIC_SOCIAL_DISCORD || "",
  },

  logo: {
    svgPath: "/logo.svg",
    alt: "Logo",
  },

  ascii: {
    enabled: true,
    text:
      (process.env.NEXT_PUBLIC_APP_NAME || "NextJS Template")
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 10) || "TEMPLATE",
  },

  features: {
    auth: process.env.NEXT_PUBLIC_FEATURE_AUTH !== "false",
    storage: process.env.NEXT_PUBLIC_FEATURE_STORAGE !== "false",
  },

  theme: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#3b82f6",
  },
} as const;

export type Brand = typeof brand;
