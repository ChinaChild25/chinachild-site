import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Бизнес-китайский онлайн для команд | ChinaChild",
    description:
      "Корпоративное обучение китайскому языку для закупок, продаж, логистики и менеджмента. Онлайн-интенсивы, разговорная практика и деловая переписка.",
    path: "/dlya-biznesa",
    keywords: [
      "бизнес китайский онлайн",
      "корпоративный китайский",
      "китайский для бизнеса",
    ],
  });
}

const features = [
  {
    card: "card-cream",
    title: "Деловая переписка",
    body:
      "Готовые шаблоны для рабочих сценариев: запросы поставщикам, согласование условий, follow-up после встреч.",
  },
  {
    card: "card-sky",
    title: "Созвоны и переговоры",
    body:
      "Тренируем встречи, переговоры и презентацию продукта на живых кейсах из реальных команд.",
  },
  {
    card: "card-lime-soft",
    title: "Программа под отрасль",
    body:
      "E-commerce, импорт, логистика и B2B: подбираем лексику и сценарии под специфику бизнеса.",
  },
];

export default function BusinessLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Бизнес", path: "/dlya-biznesa" },
        ]}
      />
      <PageHero
        eyebrow="Корпоративный трек"
        title="Бизнес-китайский для команд, которым нужен прикладной результат"
        description="Помогаем закупкам, продажам, руководителям и аккаунт-командам быстрее входить в переписку, встречи и переговоры с партнёрами из Китая."
        primaryCta={{ label: "Обсудить курс для команды", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Преподаватели", href: "/prepodavateli" }}
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
