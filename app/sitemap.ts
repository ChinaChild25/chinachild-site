import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },

    // Money pages — high priority
    { url: absoluteUrl("/courses"), lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: absoluteUrl("/courses/online-chinese"), lastModified: now, changeFrequency: "weekly", priority: 0.93 },
    { url: absoluteUrl("/courses/hsk-preparation"), lastModified: now, changeFrequency: "weekly", priority: 0.93 },
    { url: absoluteUrl("/courses/chinese-for-adults"), lastModified: now, changeFrequency: "weekly", priority: 0.92 },
    { url: absoluteUrl("/courses/chinese-for-kids"), lastModified: now, changeFrequency: "weekly", priority: 0.92 },
    { url: absoluteUrl("/courses/business-chinese"), lastModified: now, changeFrequency: "weekly", priority: 0.88 },

    // Trust pages — strong E-E-A-T
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.82 },
    { url: absoluteUrl("/methodology"), lastModified: now, changeFrequency: "monthly", priority: 0.82 },
    { url: absoluteUrl("/results"), lastModified: now, changeFrequency: "monthly", priority: 0.78 },
    { url: absoluteUrl("/reviews"), lastModified: now, changeFrequency: "weekly", priority: 0.78 },

    // Blog hub
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },

    // Legal
    { url: absoluteUrl("/privacy-policy"), lastModified: now, changeFrequency: "yearly", priority: 0.25 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes];
}
