import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — онлайн-школа китайского языка`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "ru-RU",
    categories: ["education", "lifestyle"],
    icons: [
      { src: "/icon0.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    // Quick-access shortcuts surface in long-press menus on Android, taskbar
    // on Windows, and the dock on iOS once installed as PWA.
    shortcuts: [
      {
        name: "Все курсы",
        short_name: "Курсы",
        description: "Каталог курсов китайского языка",
        url: "/courses",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
      {
        name: "Подготовка к HSK",
        short_name: "HSK",
        description: "Целевая подготовка к экзамену HSK",
        url: "/courses/hsk-preparation",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
      {
        name: "Оставить заявку",
        short_name: "Заявка",
        description: "Связаться с менеджером школы",
        url: "/zayavka",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
      {
        name: "Блог",
        short_name: "Блог",
        description: "Статьи о китайском языке",
        url: "/blog",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
    ],
  };
}
