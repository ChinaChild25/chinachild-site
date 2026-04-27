import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import CoursesSection from "@/components/sections/CoursesSection";
import FAQSection from "@/components/sections/FAQSection";
import PricingSection from "@/components/sections/PricingSection";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Курсы китайского языка онлайн — все программы | ChinaChild",
    description:
      "Все курсы китайского языка онлайн в школе ChinaChild: HSK 1–2, индивидуально для подростков 12+, корпоративные группы. Лицензия Москвы, налоговый вычет 13%, мини-группы до 5 человек.",
    path: "/kursy",
    keywords: [
      "курсы китайского языка онлайн",
      "курсы китайского для детей",
      "курсы китайского для взрослых",
      "обучение китайскому языку",
      "учить китайский онлайн",
      "подготовка к HSK",
    ],
  });
}

const internalLinks = [
  { label: "HSK 1–6 онлайн", href: "/hsk" },
  { label: "Школьникам 12+", href: "/dlya-detej" },
  { label: "Старшеклассникам", href: "/dlya-podrostkov" },
  { label: "Взрослым с нуля", href: "/dlya-vzroslyh" },
  { label: "Корпоративно", href: "/dlya-biznesa" },
  { label: "Преподаватели", href: "/prepodavateli" },
  { label: "Тест уровня", href: "/test-hsk" },
];

export default function CoursesPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Курсы", path: "/kursy" },
        ]}
      />
      <PageHero
        eyebrow="Курсы и форматы"
        title="Курсы китайского языка онлайн в ChinaChild"
        description="Подбираем формат под уровень, возраст и темп: мини-группа до 5 человек, индивидуальные занятия или интенсив. Программа лицензирована департаментом города Москвы."
        primaryCta={{ label: "Записаться", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Цены", href: "#tseny" }}
      />
      <CoursesSection />
      <PricingSection />

      <section className="page-shell section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#1b1b1b] sm:text-4xl">
            Какой курс китайского выбрать
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-7 text-[#4b4b4b]">
            <p>
              Программы школы ChinaChild построены на единой методике, лицензированной
              департаментом города Москвы. Курс HSK с нуля рассчитан на 80 занятий и подходит
              взрослым без предварительной подготовки. Уже к концу программы выпускники
              выходят на разговорный уровень и сертификат HSK 2.
            </p>
            <p>
              Школьникам с 12 лет рекомендуем индивидуальный курс с преподавателем — со
              скидкой 10% при оплате за 2 месяца. Командам компаний доступен корпоративный
              формат с отчётностью и закрывающими документами.
            </p>
            <p>
              После завершения базовой программы можно продолжить обучение на нашей
              платформе вплоть до HSK 6 — со сложными заданиями, интенсивной практикой и
              сопровождением кураторов.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
            {internalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#1b1b1b] underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
