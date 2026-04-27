import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
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

const features = [
  {
    card: "card-cream",
    title: "Первые слова без перегруза",
    body:
      "Короткие блоки, игры, песни и визуальные карточки. Ребёнок не зазубривает, а учит язык в действии.",
  },
  {
    card: "card-lime-soft",
    title: "Пиньинь и базовые иероглифы",
    body:
      "Учим читать звуки и узнавать иероглифы по темам, чтобы переход к чтению был плавным и без страха.",
  },
  {
    card: "card-sky",
    title: "Поддержка родителей",
    body:
      "Преподаватель и куратор на связи: рассказывают про прогресс ребёнка, помогают с домашкой и мотивацией.",
  },
];

export default function KidsLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Для детей", path: "/dlya-detej" },
        ]}
      />
      <PageHero
        eyebrow="Дети 5-10 лет"
        title="Китайский для детей онлайн — мягкий старт и живая речь"
        description="Занятия строятся вокруг коротких блоков, игры, визуальной памяти и безопасной разговорной практики. Ребёнок не пугается нового языка и постепенно начинает говорить сам."
        primaryCta={{ label: "Записать на пробный урок", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Все курсы", href: "/kursy" }}
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
