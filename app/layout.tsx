import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingCta from "@/components/layout/FloatingCta";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import JsonLd from "@/components/seo/JsonLd";
import YandexMetrika from "@/components/seo/YandexMetrika";
import { buildMetadata } from "@/lib/metadata";
import { createSiteGraph } from "@/lib/schema";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = buildMetadata({
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
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.className}>
      <body>
        {/* Global JSON-LD @graph: connected nodes for richer SERP rendering */}
        <JsonLd data={createSiteGraph()} id="site-graph" />
        <YandexMetrika />
        <div className="site-shell">
          <Header />
          {children}
          <Footer />
          <FloatingCta />
        </div>
      </body>
    </html>
  );
}
