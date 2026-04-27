import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import CoursesSection from "@/components/sections/CoursesSection";
import FAQSection from "@/components/sections/FAQSection";
import PricingSection from "@/components/sections/PricingSection";
import WhySection from "@/components/sections/WhySection";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Онлайн-курсы китайского языка с нуля | ChinaChild",
    description:
      "Онлайн-курсы китайского языка для начинающих и продолжающих. Лицензированная школа, преподаватели ЮФУ и ДГТУ, мини-группы до 5 человек. Налоговый вычет 13%.",
    path: "/onlajn-kursy",
    keywords: [
      "онлайн курсы китайского",
      "курсы китайского языка онлайн",
      "китайский онлайн с нуля",
      "учить китайский онлайн",
      "обучение китайскому языку онлайн",
    ],
  });
}

export default function OnlineCoursesPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Онлайн-курсы", path: "/onlajn-kursy" },
        ]}
      />
      <PageHero
        eyebrow="Онлайн с любого устройства"
        title="Онлайн-курсы китайского языка с нуля"
        description="Лицензированная программа HSK 1–2 для подростков 12+ и взрослых. Мини-группы до 5 человек, личный кабинет с записями уроков, обучение с телефона или ноутбука."
        primaryCta={{ label: "Записаться на курс", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Пройти тест уровня", href: "/test-hsk" }}
      />

      <WhySection />
      <CoursesSection />
      <PricingSection />

      <section className="page-shell section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#1b1b1b] sm:text-4xl">
            С чего начать обучение китайскому онлайн
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-7 text-[#4b4b4b]">
            <p>
              Онлайн-курсы китайского языка ChinaChild — это лицензированная программа,
              рассчитанная на достижение разговорного уровня за 6 месяцев. Программа подходит
              взрослым без предварительной подготовки и подросткам с 12 лет.
            </p>
            <p>
              Обучение строится по международной системе уровней HSK 1–2: фонетика, лексика,
              грамматика, аудирование, чтение и говорение в единой логике. Материал подаётся
              последовательно — от пиньиня и базовых конструкций до простых диалогов и
              понимания аутентичных текстов.
            </p>
            <p>
              После регистрации в день старта курса появляется доступ к личному кабинету с
              лекциями, тестами и видеозаписями уроков. Сопровождение наставников, кураторов
              и ревьюеров включено в стоимость. Учиться можно с телефона: личный кабинет
              полностью адаптирован под мобильные устройства.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/hsk"
              className="text-sm font-semibold text-[#1b1b1b] underline underline-offset-4"
            >
              Подготовка к HSK 1–6
            </Link>
            <span className="text-[#9a9a9a]">·</span>
            <Link
              href="/dlya-vzroslyh"
              className="text-sm font-semibold text-[#1b1b1b] underline underline-offset-4"
            >
              Курс для взрослых с нуля
            </Link>
            <span className="text-[#9a9a9a]">·</span>
            <Link
              href="/dlya-detej"
              className="text-sm font-semibold text-[#1b1b1b] underline underline-offset-4"
            >
              Школьникам 12+
            </Link>
            <span className="text-[#9a9a9a]">·</span>
            <Link
              href="/prepodavateli"
              className="text-sm font-semibold text-[#1b1b1b] underline underline-offset-4"
            >
              Преподаватели школы
            </Link>
          </div>
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
