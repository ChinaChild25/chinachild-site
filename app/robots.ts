import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: SITE_URL,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
