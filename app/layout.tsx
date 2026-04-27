import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata = {
  title: "ChinaChild — китайский язык онлайн",
  description: "Онлайн школа китайского языка для детей и взрослых",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
