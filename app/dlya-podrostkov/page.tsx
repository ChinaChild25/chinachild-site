import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для подростков онлайн | ChinaChild",
    description:
      "Китайский для подростков 11-16 лет: школьная база, разговорная практика и подготовка к HSK в онлайн-школе ChinaChild.",
    path: "/dlya-podrostkov",
    keywords: [
      "китайский для подростков",
      "HSK для школьников",
      "онлайн китайский для подростка",
    ],
  });
}

export default function TeensLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Для подростков", path: "/dlya-podrostkov" },
        ]}
      />
      <section className="page-shell section-space pt-8">
        <span className="section-label">Подростки 11-16 лет</span>
        <h1 className="section-title">Китайский для подростков: HSK, школа и уверенная речь</h1>
        <p className="section-description">
          Подростковый трек совмещает системную грамматику, живые темы для
          разговора и понятный план подготовки к HSK без сухой зубрёжки.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            "Разговорные сценарии для школы, поездок и общения",
            "Контрольные точки по HSK 1-3 и стратегия подготовки",
            "Отчёты по прогрессу, словарю и темпам повторения",
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
            Записаться на диагностику
          </Link>
          <Link href="/kursy" className={buttonStyles({ variant: "secondary" })}>
            Смотреть курс
          </Link>
        </div>
      </section>
    </main>
  );
}
