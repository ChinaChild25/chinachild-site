import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site-config";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
};

const DEFAULT_IMAGE_PATH = "/hero-classroom.svg";

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
  imagePath = DEFAULT_IMAGE_PATH,
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(imagePath);

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
        "ru-KZ": canonical,
        "ru-BY": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "ChinaChild — онлайн-школа китайского языка",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    other: {
      "format-detection": "telephone=no",
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
