import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata = {
  title: "ChinaChild — китайский язык онлайн",
  description:
    "Онлайн-школа китайского языка для детей и взрослых. Подготовка к HSK.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className} style={{ background: "#fff", color: "#111" }}>
        {children}
      </body>
    </html>
  );
}
