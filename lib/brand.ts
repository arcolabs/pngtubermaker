const env =
  typeof process !== "undefined"
    ? process.env
    : (globalThis as unknown as { env?: Record<string, string> }).env || {};

export const brand = {
  name: env.NEXT_PUBLIC_APP_NAME || "NextJS Template",
  shortName: env.NEXT_PUBLIC_APP_SHORT_NAME || "Template",
  description:
    env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "A production-ready Next.js starter template with React 19 and Tailwind CSS v4.",

  contact: {
    email: env.NEXT_PUBLIC_CONTACT_EMAIL || "support@example.com",
    website: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  social: {
    twitter: env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
    github: env.NEXT_PUBLIC_SOCIAL_GITHUB || "",
    discord: env.NEXT_PUBLIC_SOCIAL_DISCORD || "",
  },

  logo: {
    svgPath: "/logo.svg",
    alt: "Logo",
  },

  ascii: {
    enabled: true,
    text:
      (env.NEXT_PUBLIC_APP_NAME || "NextJS Template")
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 10) || "TEMPLATE",
  },

  features: {
    auth: env.NEXT_PUBLIC_FEATURE_AUTH !== "false",
    storage: env.NEXT_PUBLIC_FEATURE_STORAGE !== "false",
  },

  theme: {
    primaryColor: env.NEXT_PUBLIC_PRIMARY_COLOR || "#3b82f6",
  },
} as const;

export type Brand = typeof brand;
