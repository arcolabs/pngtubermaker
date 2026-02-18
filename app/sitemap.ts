import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pngtubermaker.com";

interface SitemapRoute {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  lastModified?: Date;
}

/**
 * Static routes configuration
 * Add new static pages here as the site grows
 */
const staticRoutes: SitemapRoute[] = [
  {
    path: "/",
    priority: 1.0,
    changeFrequency: "daily",
  },
  {
    path: "/pricing",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    path: "/legal/terms",
    priority: 0.3,
    changeFrequency: "monthly",
  },
  {
    path: "/legal/privacy",
    priority: 0.3,
    changeFrequency: "monthly",
  },
  {
    path: "/login",
    priority: 0.5,
    changeFrequency: "monthly",
  },
];

/**
 * Dynamic routes - fetch from database or API
 * Examples for future expansion:
 * - Blog posts: fetch from posts table
 * - User profiles: fetch from users table
 * - Generated thumbnails: fetch public galleries
 */
async function getDynamicRoutes(): Promise<SitemapRoute[]> {
  const routes: SitemapRoute[] = [];

  // Example: Blog posts (uncomment when /posts is implemented)
  // const posts = await db.query.posts.findMany({
  //   where: eq(posts.published, true),
  //   columns: { slug: true, updatedAt: true },
  // });
  // posts.forEach((post) => {
  //   routes.push({
  //     path: `/posts/${post.slug}`,
  //     priority: 0.7,
  //     changeFrequency: "weekly",
  //     lastModified: post.updatedAt,
  //   });
  // });

  // Example: Public thumbnail galleries (future feature)
  // const galleries = await db.query.thumbnailGalleries.findMany({
  //   where: eq(thumbnailGalleries.isPublic, true),
  //   columns: { id: true, updatedAt: true },
  // });
  // galleries.forEach((gallery) => {
  //   routes.push({
  //     path: `/gallery/${gallery.id}`,
  //     priority: 0.6,
  //     changeFrequency: "weekly",
  //     lastModified: gallery.updatedAt,
  //   });
  // });

  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: route.lastModified || new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
