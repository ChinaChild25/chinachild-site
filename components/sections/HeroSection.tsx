import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import { REGISTER_URL } from "@/lib/site-config";
import { createEducationalOrganizationSchema } from "@/lib/schema";
import { socialProof } from "@/lib/site-data";

export default function HeroSection() {
  return (
    <section className="page-shell pt-6 pb-10 sm:pt-10 lg:pb-16">
      <JsonLd data={createEducationalOrganizationSchema()} id="home-edu-org-schema" />

      <div className="card-block card-block-lg card-violet">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="eyebrow">
              <span aria-hidden>🌐</span>
              Онлайн-школа китайского языка
            </span>

            <h1 className="mt-6 text-[2.4rem] font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-[3.2rem] lg:text-[3.8rem]">
              Китайский онлайн —<br />
              для детей и взрослых
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
              Сертифицированные преподаватели, живые занятия и платформа
              с AI-практикой. Подбираем программу под цель: первые слова,
              HSK, разговорный или бизнес-китайский.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ size: "large" })}
              >
                Записаться на пробный
              </Link>
              <Link
                href="/kursy"
                className={buttonStyles({ variant: "secondary", size: "large" })}
              >
                Смотреть курсы
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-sm font-medium">
              <span className="tag-pill">{socialProof.students}</span>
              <span className="tag-pill">{socialProof.rating}</span>
              <span className="tag-pill">{socialProof.since}</span>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[28px] bg-white/12 p-3 backdrop-blur-sm">
              <Image
                src="/hero-classroom.svg"
                alt="Онлайн-занятие китайским языком на платформе ChinaChild"
                width={720}
                height={640}
                priority
                className="h-auto w-full rounded-[22px]"
              />
            </div>
            <div className="pointer-events-none absolute -right-4 -top-4 hidden h-20 w-20 rounded-full bg-white/20 sm:block" aria-hidden />
            <div className="pointer-events-none absolute -bottom-6 -left-4 hidden h-14 w-14 rounded-full bg-white/15 sm:block" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
