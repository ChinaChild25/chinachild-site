import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для детей онлайн с 5 лет | ChinaChild",
    description:
      "Онлайн-уроки китайского для детей 5-10 лет: игровой формат, первые слова, чтение пиньиня и мягкая подготовка к дальнейшему HSK-маршруту.",
    path: "/dlya-detej",
    keywords: [
      "китайский для детей",
      "уроки китайского для ребенка",
      "китайский с 5 лет онлайн",
    ],
  });
}

export default function KidsLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Для детей", path: "/dlya-detej" },
        ]}
      />
      <section className="page-shell section-space pt-8">
        <span className="section-label">Дети 5-10 лет</span>
        <h1 className="section-title">Китайский онлайн для детей с мягким стартом и живой речью</h1>
        <p className="section-description">
          Занятия строятся вокруг коротких блоков, игры, визуальной памяти и
          безопасной разговорной практики. Ребёнок не пугается нового языка и
          постепенно начинает говорить сам.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            "Первые слова и фразы без перегруза теорией",
            "Пиньинь, базовые иероглифы и аудирование на понятных темах",
            "Поддержка родителей и короткие домашние задания",
          ].map((item) => (
            <div key={item} className="surface-card rounded-[26px] p-6 text-sm leading-7 text-[#4B5563]">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles({
              className: "bg-[#FF3D00] text-white hover:bg-[#f03a00]",
            })}
          >
            Записать ребёнка на пробный урок
          </Link>
          <Link href="/kursy" className={buttonStyles({ variant: "secondary" })}>
            Смотреть все курсы
          </Link>
        </div>
      </section>
    </main>
  );
}
