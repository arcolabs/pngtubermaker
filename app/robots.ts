import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pngtubermaker.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Disallow patterns for future use:
        // disallow: [
        //   "/api/",           // API routes
        //   "/admin/",         // Admin panel
        //   "/auth/",          // Auth flows (except public pages)
        //   "/dashboard/",     // User dashboards
        //   "/*.json",         // JSON API responses
        //   "/private/",       // Private content
        // ],
      },
      // Googlebot-specific rules (optional)
      // {
      //   userAgent: "Googlebot",
      //   allow: "/",
      //   disallow: [],
      // },
      // Bingbot-specific rules (optional)
      // {
      //   userAgent: "Bingbot",
      //   allow: "/",
      //   disallow: [],
      // },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // Optional: Host directive for preferred domain
    // host: baseUrl,
  };
}
