import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
import { GlobeCharacter, Heart3D, PuzzleHands } from "@/components/decor/Decor";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для школьников 12+ онлайн | ChinaChild",
    description:
      "Курс китайского языка для подростков от 12 лет. Лицензированная программа HSK 1–2 с разговорным уровнем за 6 месяцев. Индивидуальный курс — скидка 10% при оплате за 2 месяца.",
    path: "/dlya-detej",
    keywords: [
      "китайский для школьников",
      "китайский для детей онлайн",
      "китайский с 12 лет",
      "HSK для подростков",
    ],
  });
}

const features = [
  {
    card: "card-cream",
    title: "Индивидуальный темп",
    body:
      "Один на один с преподавателем. Подросток получает разбор ошибок, персональное сопровождение и удобное расписание.",
    icon: <PuzzleHands className="absolute -right-4 -bottom-4 h-32 w-44 opacity-95" />,
  },
  {
    card: "card-lime-soft",
    title: "HSK 1–2 за 6 месяцев",
    body:
      "Лицензированная программа: фонетика, базовые конструкции, диалоги и аутентичные тексты. По итогу — разговорный уровень и сертификат.",
    icon: <GlobeCharacter className="absolute -right-2 -bottom-2 h-32 w-32 opacity-95" />,
  },
  {
    card: "card-sky",
    title: "Скидка 10% за 2 месяца",
    body:
      "Индивидуальный курс при оплате за 2 месяца — 28 990 ₽ вместо 31 990 ₽. Плюс налоговый вычет 13% — до 15 600 ₽ в год.",
    icon: <Heart3D className="absolute -right-2 -bottom-2 h-28 w-28 opacity-95" />,
  },
];

export default function KidsLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Школьникам 12+", path: "/dlya-detej" },
        ]}
      />
      <PageHero
        eyebrow="Школьники 12+"
        title="Китайский для школьников 12+ онлайн"
        description="Индивидуальный курс или мини-группа по программе HSK 1–2. Подросток выходит на разговорный уровень за 6 месяцев — без зубрёжки, с живой практикой и поддержкой преподавателя."
        primaryCta={{ label: "Записать на пробный урок", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Все курсы", href: "/kursy" }}
      />

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((item) => (
            <article key={item.title} className={`card-block relative h-full overflow-hidden ${item.card}`}>
              <h2 className="relative z-10 text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                {item.title}
              </h2>
              <p className="relative z-10 mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">{item.body}</p>
              {item.icon}
            </article>
          ))}
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
