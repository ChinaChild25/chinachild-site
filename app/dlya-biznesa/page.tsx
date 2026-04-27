import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
import { ChartUp, PercentMedal, SpeechBubbles } from "@/components/decor/Decor";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Корпоративный китайский для команд | ChinaChild",
    description:
      "Корпоративное обучение китайскому языку: программа HSK 1–2, мини-группы для сотрудников, закрывающие документы и отчётность по прогрессу команды.",
    path: "/dlya-biznesa",
    keywords: [
      "корпоративный китайский",
      "китайский для бизнеса",
      "обучение сотрудников китайскому",
      "групповое обучение китайскому",
    ],
  });
}

const features = [
  {
    card: "card-cream",
    title: "Программа HSK 1–2 для команды",
    body:
      "Лицензированный курс с акцентом на разговор, переписку с китайскими партнёрами и работу с документами.",
    icon: <SpeechBubbles className="absolute -right-2 -bottom-2 h-32 w-36 opacity-95" />,
  },
  {
    card: "card-sky",
    title: "Отчётность и прозрачный прогресс",
    body:
      "Личный кабинет, посещаемость, тесты и видеозаписи — HR-руководитель видит динамику каждого сотрудника.",
    icon: <ChartUp className="absolute -right-2 -bottom-2 h-32 w-36 opacity-95" />,
  },
  {
    card: "card-lime-soft",
    title: "Закрывающие документы",
    body:
      "Образовательная лицензия Москвы. Готовы оформить договор, акт и счёт под бухгалтерию заказчика.",
    icon: <PercentMedal value="ЭДО" className="absolute -right-4 -bottom-4 h-32 w-28 opacity-95" />,
  },
];

export default function BusinessLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Бизнесу", path: "/dlya-biznesa" },
        ]}
      />
      <PageHero
        eyebrow="Корпоративные группы"
        title="Корпоративный китайский для команд и сотрудников"
        description="Лицензированная онлайн-программа HSK 1–2 для команд: мини-группы до 5 человек, отчётность по прогрессу и закрывающие документы для бухгалтерии."
        primaryCta={{ label: "Обсудить курс для команды", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Преподаватели", href: "/prepodavateli" }}
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
