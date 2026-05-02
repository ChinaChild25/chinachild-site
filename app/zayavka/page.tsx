import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LeadForm from "@/components/forms/LeadForm";
import { buildMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Оставить заявку — ChinaChild",
  description:
    "Оставьте заявку — менеджер ChinaChild свяжется в течение рабочего дня, подберёт подходящий курс китайского, расскажет о ценах и расписании.",
  path: "/zayavka",
  keywords: [
    "записаться на китайский",
    "ChinaChild заявка",
    "консультация по курсу китайского",
  ],
});

export default function ZayavkaPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Оставить заявку", path: "/zayavka" },
        ]}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <span className="tag-pill">Заявка</span>
            <h1 className="mt-6 text-[2.25rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3rem]">
              Оставьте заявку — мы свяжемся в течение рабочего дня
            </h1>
            <p className="mt-5 text-base leading-[1.55] text-[#4b4b4b]">
              Расскажите, что вас интересует — мы подберём формат обучения,
              расскажем о ценах, расписании и программе. Бесплатная консультация
              без обязательств.
            </p>

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
                Пн–Пт 09:00–19:00 МСК. В выходные перезваниваем в первый рабочий
                день.
              </p>
            </div>
          </div>

          <div className="card-block lead-form-wrap">
            <LeadForm source="zayavka-page" />
          </div>
        </div>
      </section>
    </main>
  );
}
