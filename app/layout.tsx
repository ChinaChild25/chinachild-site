import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FloatingCta from "@/components/layout/FloatingCta";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { createOrganizationSchema } from "@/lib/schema";

const inter = localFont({
  src: "./fonts/Inter-Variable.ttf",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = buildMetadata({
  title:
    "ChinaChild — Онлайн-школа китайского языка | Курсы для детей и взрослых",
  description:
    "Учите китайский онлайн с носителями и сертифицированными преподавателями. Курсы для детей с 5 лет, подростков и взрослых. Первый урок бесплатно. Запишитесь сегодня!",
  path: "/",
  keywords: [
    "китайский язык онлайн",
    "онлайн школа китайского языка",
    "китайский для детей",
    "курсы китайского языка",
    "подготовка к HSK",
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
        {/* Global organization schema helps search engines identify the brand. */}
        <JsonLd data={createOrganizationSchema()} id="organization-schema" />
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
