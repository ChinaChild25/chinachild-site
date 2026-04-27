import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для взрослых онлайн с нуля | ChinaChild",
    description:
      "Изучение китайского для взрослых онлайн: разговорная практика, HSK 1-2, поездки, работа и жизнь с Китаем без перегруза академической теорией.",
    path: "/dlya-vzroslyh",
    keywords: [
      "китайский для взрослых",
      "китайский с нуля онлайн",
      "разговорный китайский онлайн",
    ],
  });
}

const features = [
  {
    card: "card-sky",
    title: "Путешествия и переезд",
    body:
      "Бытовая лексика, диалоги в кафе, такси, аэропорту, аренда жилья и работа с китайскими сервисами.",
  },
  {
    card: "card-cream",
    title: "Работа и партнёры",
    body:
      "Деловая переписка, созвоны и встречи с китайскими коллегами без зависимости от перевода.",
  },
  {
    card: "card-lime-soft",
    title: "HSK по необходимости",
    body:
      "Если нужен формальный результат — ведём по треку HSK 1-2 с тренировкой всех частей экзамена.",
  },
];

export default function AdultsLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Для взрослых", path: "/dlya-vzroslyh" },
        ]}
      />
      <PageHero
        eyebrow="Взрослые"
        title="Китайский для взрослых онлайн: с нуля до уверенного общения"
        description="Удобный формат для занятых людей: персональный темп, записи уроков, короткие домашние задания и разговорная практика, связанная с реальными ситуациями."
        primaryCta={{ label: "Начать бесплатно", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Посмотреть FAQ", href: "/#faq" }}
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
