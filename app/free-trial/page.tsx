import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LeadForm from "@/components/forms/LeadForm";
import { buildMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Бесплатный пробный урок китайского языка — ChinaChild",
  description:
    "Бесплатный пробный урок китайского в ChinaChild. Преподаватель оценит уровень, поставит цель и подберёт подходящий курс. Запись на удобное время — без обязательств.",
  path: "/free-trial",
  keywords: [
    "пробный урок китайского",
    "бесплатное занятие китайский",
    "первый урок китайского онлайн",
    "пробное занятие HSK",
  ],
});

export default function FreeTrialPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Пробный урок", path: "/free-trial" },
        ]}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <span className="tag-pill">Бесплатное занятие</span>
            <h1 className="mt-6 text-[2.25rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3rem]">
              Бесплатный пробный урок китайского
            </h1>
            <p className="mt-5 text-base leading-[1.55] text-[#4b4b4b]">
              За 60 минут с преподавателем-методистом вы:
            </p>
            <ul className="mt-4 grid gap-2 text-base leading-[1.55] text-[#4b4b4b]">
              <li>— узнаете свой уровень по шкале HSK 1–6;</li>
              <li>— получите рекомендации по программе и темпу;</li>
              <li>— обсудите цели — туризм, работа, поступление в вуз КНР;</li>
              <li>— попробуете живое занятие в формате нашей школы.</li>
            </ul>

            <div className="mt-10 grid gap-3 text-sm">
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]"
              >
                {CONTACT_PHONE}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-base text-[#6b6b6b] hover:text-[#262626]"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-4 text-xs leading-[1.55] text-[#9a9a9a]">
                Без обязательств: после пробного занятия вы решаете, продолжать или нет.
                Никаких автосписаний и подписок.
              </p>
            </div>
          </div>

          <div className="card-block lead-form-wrap">
            <LeadForm source="free-trial-page" />
          </div>
        </div>
      </section>
    </main>
  );
}
