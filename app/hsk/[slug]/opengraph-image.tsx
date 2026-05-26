import { hskLevels, getHskLevelBySlug } from "@/lib/hsk-levels";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Уровень HSK — ChinaChild";

export function generateStaticParams() {
  return hskLevels.map((level) => ({ slug: level.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function HskOgImage({ params }: Params) {
  const { slug } = await params;
  const level = getHskLevelBySlug(slug);

  return renderGenericOg({
    badge: "HSK",
    title: level
      ? `HSK ${level.level}: слова, иероглифы и экзамен`
      : "HSK: уровни и подготовка",
    subtitle: level
      ? `${level.words}+ слов · ${level.hanziCount} иероглифов · CEFR ${level.cefrEquivalent}`
      : "Подготовка к международному экзамену по китайскому",
    footer: "chinachild.ru / hsk",
    background: "#e7e6ff",
    cta: "Открыть уровень",
  });
}
