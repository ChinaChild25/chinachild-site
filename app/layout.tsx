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
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import AnalyticsEvents from "@/components/analytics/AnalyticsEvents";
import { ConsentProvider } from "@/lib/consent/context";
import CookieBanner from "@/components/consent/CookieBanner";
import { buildMetadata } from "@/lib/metadata";
import { createSiteGraph } from "@/lib/schema";
import { SITE_URL } from "@/lib/site-config";

// Порядок weight: первый элемент Next.js префетчит в HTML <link rel=preload>.
// LCP-элемент на блоге (H1) — font-medium (500), поэтому 500 идёт первым.
// 700 удалили: только legal-страницы (privacy/docs/user-agreement) и
// .lead-required использовали — заменены на 600. Минус один woff2 = -25%
// шрифтового трафика.
const inter = Inter({
  // latin-ext is required by the pinyin tone marks (ā á ǎ è ē ǐ ó …) sprinkled
  // through the HSK content. Without it declared, next/font still serves that
  // subset (~85 KiB) but only discovers it via CSS — so it loaded chained behind
  // the stylesheet at VeryHigh priority and became the deepest critical-path
  // node, starving the hero copy's fonts and inflating LCP on Slow 4G.
  // Declaring it here preloads it in parallel instead.
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
  weight: ["500", "400", "600"],
});

export const metadata: Metadata = {
  ...buildMetadata({
    title:
      "ChinaChild — онлайн-школа китайского языка HSK 1–6",
    description:
      "Онлайн-школа китайского ChinaChild: программа HSK 1–2, разговорный уровень за 6 месяцев, мини-группы до 5. Налоговый вычет 13%.",
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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
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
    <html
      lang="ru"
      className={inter.className}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
        {/* Preconnect / DNS-prefetch — kills first-byte latency for analytics. */}
        <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="" />
        <link rel="preconnect" href="https://mc.yandex.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://mc.yandex.com" />
        {/* Atom feed for blog discovery */}
        <link
          rel="alternate"
          type="application/atom+xml"
          title="ChinaChild — Блог"
          href="/feed.xml"
        />
      </head>
      <body>
        <ConsentProvider>
          {/* Analytics mounted close to <body> top so Yandex registers the visit even
              if the user leaves immediately. Both counters are gated on
              consent.analytics inside their components — no script tags are emitted
              until the user accepts. useSearchParams() needs Suspense to avoid
              de-opting the whole tree to client rendering. */}
          <Suspense fallback={null}>
            <YandexMetrika />
            <AnalyticsEvents />
          </Suspense>
          <GoogleAnalytics />
          {/* Site-wide JSON-LD @graph: connected nodes for richer SERP rendering */}
          <JsonLd data={createSiteGraph()} id="site-graph" />
          <div className="site-shell">
            <Header />
            {children}
            <Footer />
            <FloatingCta />
          </div>
          <CookieBanner />
        </ConsentProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
