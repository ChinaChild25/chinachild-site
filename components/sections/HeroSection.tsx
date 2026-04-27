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
          <Badge className="bg-[#FFE03D]">ChinaChild • HSK • онлайн</Badge>
          <h1 className="mt-6 text-[2.35rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#1A1A2E] sm:text-[3.5rem] lg:text-[4.2rem]">
            Китайский язык онлайн — для детей и взрослых
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4B5563]">
            Учите китайский с преподавателями HSK 5-6, работайте в удобном
            ритме на AI-платформе и выходите на разговорный уровень через
            живую практику, записи уроков и понятный трек прогресса.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({
                size: "large",
                className: "bg-[#FF3D00] text-white hover:bg-[#f03a00]",
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

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[#1A1A2E]">
            <span className="rounded-full bg-white px-4 py-2 ring-1 ring-[rgba(26,26,46,0.08)]">
              {socialProof.students}
            </span>
            <span className="rounded-full bg-white px-4 py-2 ring-1 ring-[rgba(26,26,46,0.08)]">
              {socialProof.rating}
            </span>
            <span className="rounded-full bg-white px-4 py-2 ring-1 ring-[rgba(26,26,46,0.08)]">
              {socialProof.since}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="surface-card relative overflow-hidden rounded-[32px] bg-[#fff7ec] p-4 sm:p-6">
            <div className="absolute right-5 top-5 rounded-full bg-[#1A1A2E] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white">
              你好 • 学 • 说
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
              <div className="text-sm font-semibold text-[#6B7280]">Что входит</div>
              <p className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#1A1A2E]">
                Живые занятия, AI-практика и записи уроков
              </p>
            </div>
            <div className="surface-card rounded-[24px] bg-[#2A2AF4] p-5 text-white">
              <div className="text-sm font-semibold text-white/72">Фокус</div>
              <p className="mt-2 text-lg font-bold tracking-[-0.03em]">
                Разговорный китайский без перегруза теорией
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
