import Link from "next/link";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import { createEducationalOrganizationSchema } from "@/lib/schema";
import { siteFacts } from "@/lib/site-data";

const proofPoints = [
  { value: "HSK 1–6", label: "Все уровни международного экзамена" },
  { value: "6 мес.", label: "До разговорного уровня по программе HSK 2" },
  { value: "до 5", label: "Человек в мини-группе" },
  { value: "13%", label: "Налоговый вычет — лицензия Москвы" },
];

export default function HeroSection() {
  return (
    <section className="page-shell-wide pt-10 pb-12 sm:pt-16 lg:pt-20 lg:pb-20">
      <JsonLd data={createEducationalOrganizationSchema()} id="home-edu-org-schema" />

      <div className="mx-auto max-w-4xl text-center">
        <Link
          href="#otzyvy"
          className="inline-flex items-center gap-2 text-sm text-[#262626] transition hover:opacity-70"
          aria-label="Средняя оценка выпускников по отзывам"
          itemScope
          itemType="https://schema.org/AggregateRating"
        >
          <span aria-hidden className="text-[#FFB800] leading-none">★</span>
          <span className="font-medium">
            <span itemProp="ratingValue">{siteFacts.aggregateRating}</span> из <span itemProp="bestRating">5</span>
          </span>
          <span className="text-[#6b6b6b]">
            · на основании отзывов выпускников
          </span>
          <meta itemProp="reviewCount" content={String(siteFacts.reviewCount)} />
          <meta itemProp="worstRating" content="1" />
          <span aria-hidden className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(0,0,0,0.2)] text-[10px] font-medium text-[#6b6b6b]">
            i
          </span>
        </Link>
        <div className="mt-3">
          <span className="tag-pill">Лицензированная программа · Москва</span>
        </div>
        <h1 className="mt-6 text-[2.5rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3.4rem] lg:text-[4.25rem] lg:leading-[1.06]">
          Курсы китайского языка онлайн —<br className="hidden sm:block" />
          разговорный уровень за 6 месяцев
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.55] text-[#4b4b4b] sm:text-[1.125rem]">
          Онлайн-школа ChinaChild. Лицензированный курс HSK 1–2: фонетика,
          грамматика, лексика, аудирование, чтение и говорение в единой логике.
          Подходит подросткам с 12 лет и взрослым без подготовки.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LeadModal
            triggerClassName={buttonStyles({ size: "large" })}
            source="hero"
          >
            Записаться на пробный урок
          </LeadModal>
          <Link href="/courses" className={buttonStyles({ variant: "secondary", size: "large" })}>
            Смотреть курсы
          </Link>
        </div>
      </div>

      <dl className="mx-auto mt-14 grid max-w-5xl gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
        {proofPoints.map((p) => (
          <div
            key={p.value}
            className="rounded-[20px] bg-white px-6 py-5"
          >
            <dt className="text-[1.75rem] font-medium tracking-[-0.02em] text-[#262626] sm:text-[2rem]">
              {p.value}
            </dt>
            <dd className="mt-2 text-sm leading-[1.55] text-[#6b6b6b]">{p.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
