import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Бизнес-китайский онлайн для команд | ChinaChild",
    description:
      "Корпоративное обучение китайскому языку для закупок, продаж, логистики и менеджмента. Онлайн-интенсивы, разговорная практика и деловая переписка.",
    path: "/dlya-biznesa",
    keywords: [
      "бизнес китайский онлайн",
      "корпоративный китайский",
      "китайский для бизнеса",
    ],
  });
}

export default function BusinessLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Бизнес", path: "/dlya-biznesa" },
        ]}
      />
      <section className="page-shell section-space pt-8">
        <span className="section-label">Корпоративный трек</span>
        <h1 className="section-title">Бизнес-китайский для команд, которым нужен прикладной результат</h1>
        <p className="section-description">
          Помогаем закупкам, продажам, руководителям и аккаунт-командам быстрее
          входить в переписку, встречи и переговоры с партнёрами из Китая.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            "Деловая переписка и быстрые шаблоны для рутинных сценариев",
            "Созвоны, встречи, поставщики и презентация продукта",
            "Программа под отрасль: e-commerce, импорт, логистика, B2B",
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
            Обсудить корпоративный курс
          </Link>
          <Link href="/prepodavateli" className={buttonStyles({ variant: "secondary" })}>
            Посмотреть преподавателей
          </Link>
        </div>
      </section>
    </main>
  );
}
