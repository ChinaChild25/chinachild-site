import { renderSectionOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Блог ChinaChild";

export default function Image() {
  return renderSectionOg({
    badge: "Блог",
    title: "Статьи о китайском языке",
    subtitle: "Методика, HSK, советы родителям и разборы для тех, кто учит китайский.",
    footer: "chinachild.ru / blog",
    accentColor: "#3a4d12",
    background: "#eef5c8",
    imagePath: "/og/blog.png",
    imageMime: "image/png",
  });
}
