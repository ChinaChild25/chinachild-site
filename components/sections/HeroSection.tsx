import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import { REGISTER_URL } from "@/lib/site-config";
import { createEducationalOrganizationSchema } from "@/lib/schema";

const proofPoints = [
  { value: "HSK 1–6", label: "Все уровни международного экзамена" },
  { value: "6 мес.", label: "До разговорного уровня по программе HSK 2" },
  { value: "до 5", label: "Человек в мини-группе" },
  { value: "13%", label: "Налоговый вычет — лицензия Москвы" },
];

export default function HeroSection() {
  return (
    <section className="page-shell pt-10 pb-12 sm:pt-16 lg:pt-20 lg:pb-20">
      <JsonLd data={createEducationalOrganizationSchema()} id="home-edu-org-schema" />

      <div className="mx-auto max-w-4xl text-center">
        <span className="tag-pill">Лицензированная программа · Москва</span>
        <h1 className="mt-6 text-[2.4rem] font-bold leading-[1.04] tracking-[-0.04em] text-[#1b1b1b] sm:text-[3.4rem] lg:text-[4rem]">
          Курсы китайского языка онлайн —<br className="hidden sm:block" />
          разговорный уровень за 6 месяцев
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#4b4b4b] sm:text-lg">
          Онлайн-школа ChinaChild. Лицензированный курс HSK 1–2: фонетика,
          грамматика, лексика, аудирование, чтение и говорение в единой логике.
          Подходит подросткам с 12 лет и взрослым без подготовки.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles({ size: "large" })}
          >
            Записаться на пробный урок
          </Link>
          <Link href="/courses" className={buttonStyles({ variant: "secondary", size: "large" })}>
            Смотреть курсы
          </Link>
        </div>
      </div>

      <dl className="mx-auto mt-14 grid max-w-5xl gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
        {proofPoints.map((p) => (
          <div
            key={p.value}
            className="rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white px-6 py-5"
          >
            <dt className="text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b] sm:text-3xl">
              {p.value}
            </dt>
            <dd className="mt-2 text-sm leading-6 text-[#6b6b6b]">{p.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
