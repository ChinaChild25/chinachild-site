import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import Badge from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { REGISTER_URL } from "@/lib/site-config";
import { createEducationalOrganizationSchema } from "@/lib/schema";
import { socialProof } from "@/lib/site-data";

export default function HeroSection() {
  return (
    <section className="page-shell section-space pb-8 pt-10 sm:pb-12 lg:pt-16">
      {/* Hero carries the single H1 for the homepage and the main target query. */}
      <JsonLd data={createEducationalOrganizationSchema()} id="home-edu-org-schema" />
      <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <Badge className="border border-[rgba(148,163,184,0.28)] bg-white/85 text-[#0F172A]">
            ChinaChild • HSK • премиум-формат
          </Badge>
          <h1 className="mt-6 text-[2.35rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#0F172A] sm:text-[3.5rem] lg:text-[4.2rem]">
            Китайский язык онлайн.
            <span className="block bg-[linear-gradient(102deg,#0F172A,#4F46E5)] bg-clip-text text-transparent">
              Дизайн и обучение уровня top-tier продуктов.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#475569]">
            Учите китайский с преподавателями HSK 5-6 на платформе с премиальным
            интерфейсом: прозрачный прогресс, AI-практика, живые уроки и
            персональный трек развития без перегруза.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({
                size: "large",
                className:
                  "bg-[linear-gradient(135deg,#0F172A,#1D4ED8)] text-white hover:bg-[linear-gradient(135deg,#0B1220,#1E40AF)]",
              })}
            >
              Записаться на пробный урок
            </Link>
            <Link
              href="/kursy"
              className={buttonStyles({
                variant: "secondary",
                size: "large",
              })}
            >
              Смотреть курсы
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[#0F172A]">
            <span className="rounded-full bg-white/95 px-4 py-2 ring-1 ring-[rgba(148,163,184,0.28)]">
              {socialProof.students}
            </span>
            <span className="rounded-full bg-white/95 px-4 py-2 ring-1 ring-[rgba(148,163,184,0.28)]">
              {socialProof.rating}
            </span>
            <span className="rounded-full bg-white/95 px-4 py-2 ring-1 ring-[rgba(148,163,184,0.28)]">
              {socialProof.since}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.08em] text-[#64748B]">
            <span>Product-grade UX</span>
            <span className="h-1 w-1 rounded-full bg-[#94A3B8]" />
            <span>AI-assisted learning</span>
            <span className="h-1 w-1 rounded-full bg-[#94A3B8]" />
            <span>Live human feedback</span>
          </div>
        </div>

        <div className="relative">
          <div className="surface-card relative overflow-hidden rounded-[32px] bg-[linear-gradient(140deg,#EEF2FF,#F8FAFC)] p-4 sm:p-6">
            <div className="absolute right-5 top-5 rounded-full bg-[#0F172A] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white">
              你好 • 学 • 说 • 成长
            </div>
            <Image
              src="/hero-classroom.svg"
              alt="Онлайн-занятие китайским языком на платформе ChinaChild"
              width={720}
              height={640}
              priority
              className="h-auto w-full rounded-[26px]"
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="surface-card rounded-[24px] bg-white p-5">
              <div className="text-sm font-semibold text-[#64748B]">Что входит</div>
              <p className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#0F172A]">
                Живые занятия, AI-практика и записи уроков
              </p>
            </div>
            <div className="surface-card rounded-[24px] bg-[linear-gradient(140deg,#0F172A,#1D4ED8)] p-5 text-white">
              <div className="text-sm font-semibold text-white/72">Фокус</div>
              <p className="mt-2 text-lg font-bold tracking-[-0.03em]">
                Разговорный китайский + визуально понятный прогресс
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
