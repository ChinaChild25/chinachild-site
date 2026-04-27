import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
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

const features = [
  {
    card: "card-violet-soft",
    title: "Разговорные сценарии",
    body:
      "Школа, поездки, общение с друзьями. Учим говорить, а не отвечать у доски.",
  },
  {
    card: "card-cream",
    title: "Подготовка к HSK 1-3",
    body:
      "Контрольные точки по экзамену, тренировка типовых заданий и стратегия времени.",
  },
  {
    card: "card-lime-soft",
    title: "Прозрачный прогресс",
    body:
      "Отчёты по словарю, темам и темпу повторения — у подростка и родителей одна картинка.",
  },
];

export default function TeensLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Для подростков", path: "/dlya-podrostkov" },
        ]}
      />
      <PageHero
        eyebrow="Подростки 11-16 лет"
        title="Китайский для подростков: HSK, школа и уверенная речь"
        description="Подростковый трек совмещает системную грамматику, живые темы для разговора и понятный план подготовки к HSK без сухой зубрёжки."
        primaryCta={{ label: "Записаться на диагностику", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Смотреть курс", href: "/kursy" }}
      />

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((item) => (
            <article key={item.title} className={`card-block h-full ${item.card}`}>
              <h2 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
