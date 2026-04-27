import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для взрослых онлайн с нуля | ChinaChild",
    description:
      "Изучение китайского для взрослых онлайн: разговорная практика, HSK 1-2, поездки, работа и жизнь с Китаем без перегруза академической теорией.",
    path: "/dlya-vzroslyh",
    keywords: [
      "китайский для взрослых",
      "китайский с нуля онлайн",
      "разговорный китайский онлайн",
    ],
  });
}

export default function AdultsLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Для взрослых", path: "/dlya-vzroslyh" },
        ]}
      />
      <section className="page-shell section-space pt-8">
        <span className="section-label">Взрослые</span>
        <h1 className="section-title">Китайский для взрослых онлайн: с нуля до уверенного общения</h1>
        <p className="section-description">
          Удобный формат для занятых людей: персональный темп, записи уроков,
          короткие домашние задания и разговорная практика, которая связана с
          реальными ситуациями, а не только с учебником.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            "Путешествия, переезд, работа с китайскими коллегами и партнёрами",
            "Фокус на частотной лексике и понятных жизненных сценариях",
            "Маршрут на HSK 1-2, если нужен формальный результат и экзамен",
          ].map((item) => (
            <div key={item} className="surface-card rounded-[26px] p-6 text-sm leading-7 text-[#4B5563]">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles({
              className: "bg-[#FF3D00] text-white hover:bg-[#f03a00]",
            })}
          >
            Начать бесплатно
          </Link>
          <Link href="/#faq" className={buttonStyles({ variant: "secondary" })}>
            Посмотреть FAQ
          </Link>
        </div>
      </section>
    </main>
  );
}
