import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Результаты учеников ChinaChild";

export default function Image() {
  return renderGenericOg({
    badge: "Результаты",
    title: "Прогресс учеников ChinaChild",
    subtitle: "Разговорный уровень, подготовка к HSK и реальные учебные кейсы.",
    footer: "chinachild.ru / results",
    accentColor: "#5c5cff",
    background: "#e7e6ff",
  });
}
