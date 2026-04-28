import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        // Yandex respects this header for canonicalisation across UTM-tagged URLs.
        userAgent: "Yandex",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    host: SITE_URL,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
