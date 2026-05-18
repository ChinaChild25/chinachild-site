import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import FloatingCta from "@/components/layout/FloatingCta";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ThemeInitScript from "@/components/theme/ThemeInitScript";
import JsonLd from "@/components/seo/JsonLd";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { buildMetadata } from "@/lib/metadata";
import { createSiteGraph } from "@/lib/schema";
import { SITE_URL } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  ...buildMetadata({
    title:
      "ChinaChild — Онлайн-школа китайского языка | Курсы HSK 1–6 для подростков 12+ и взрослых",
    description:
      "Лицензированная онлайн-школа китайского языка ChinaChild (HSK+). Программа HSK 1–2 — разговорный уровень за 6 месяцев. Мини-группы до 5 человек, преподаватели ЮФУ и ДГТУ, налоговый вычет 13%.",
    path: "/",
    keywords: [
      "китайский язык онлайн",
      "онлайн школа китайского языка",
      "обучение китайскому",
      "курсы китайского",
      "китайский с нуля",
      "подготовка к HSK",
      "HSK онлайн",
    ],
  }),
  alternates: {
    canonical: SITE_URL,
    languages: {
      "ru-RU": SITE_URL,
      "x-default": SITE_URL,
    },
    types: {
      "application/atom+xml": [{ url: `${SITE_URL}/feed.xml`, title: "ChinaChild — Блог (Atom)" }],
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.className} data-theme="light" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        {/* Preconnect / DNS-prefetch — kills first-byte latency for analytics. */}
        <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        {/* Atom feed for blog discovery */}
        <link
          rel="alternate"
          type="application/atom+xml"
          title="ChinaChild — Блог"
          href="/feed.xml"
        />
      </head>
      <body>
        {/* Analytics mounted as close to <body> top as possible so Yandex registers
            the visit even if the user leaves immediately. useSearchParams() must be
            wrapped in Suspense to avoid de-opting the whole tree to client rendering. */}
        <Suspense fallback={null}>
          <YandexMetrika />
        </Suspense>
        {/* Site-wide JSON-LD @graph: connected nodes for richer SERP rendering */}
        <JsonLd data={createSiteGraph()} id="site-graph" />
        <div className="site-shell">
          <Header />
          {children}
          <Footer />
          <FloatingCta />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
