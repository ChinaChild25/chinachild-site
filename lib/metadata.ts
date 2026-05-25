import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site-config";

type ArticleMeta = {
  publishedTime: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
};

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  keywords?: string[];
  /** Override OG image manually (rare). Default: app/opengraph-image.tsx auto-binding. */
  imagePath?: string;
  /** When set, OG type switches to "article" and emits article:* meta tags */
  article?: ArticleMeta;
};

export function buildMetadata({
  title,
  description,
  path,
  canonicalPath,
  keywords = [],
  imagePath,
  article,
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(canonicalPath ?? path);

  // Per-route opengraph-image.tsx files generate the OG/Twitter image automatically.
  // Only fall back to manual image if explicitly provided.
  const manualImages = imagePath
    ? [
        {
          url: absoluteUrl(imagePath),
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ]
    : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: SITE_NAME,
    category: "education",
    referrer: "origin-when-cross-origin",
    keywords,
    alternates: {
      canonical,
      languages: {
        "ru-RU": canonical,
        "x-default": canonical,
      },
    },
    openGraph: article
      ? {
          type: "article",
          locale: "ru_RU",
          url: canonical,
          siteName: SITE_NAME,
          title,
          description,
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime ?? article.publishedTime,
          authors: article.authors,
          section: article.section,
          tags: article.tags,
          ...(manualImages ? { images: manualImages } : {}),
        }
      : {
          type: "website",
          locale: "ru_RU",
          url: canonical,
          siteName: SITE_NAME,
          title,
          description,
          ...(manualImages ? { images: manualImages } : {}),
        },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(manualImages ? { images: manualImages.map((i) => i.url) } : {}),
    },
    other: {
      "format-detection": "telephone=no",
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      other: {
        ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
          ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
          : {}),
        ...(process.env.NEXT_PUBLIC_MAILRU_VERIFICATION
          ? { "mailru-verification": process.env.NEXT_PUBLIC_MAILRU_VERIFICATION }
          : {}),
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
