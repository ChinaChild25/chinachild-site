import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import LeadModal from "@/components/forms/LeadModal";
import Avatar from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  LICENSE_PROGRAM,
  LICENSE_REGION_INSTRUMENTAL,
} from "@/lib/site-config";
import { teachers } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "О школе ChinaChild — лицензированное обучение китайскому языку",
    description:
      "ChinaChild — онлайн-школа китайского языка с образовательной лицензией Москвы. Программа HSK 1–2, преподаватели ЮФУ и ДГТУ с опытом 10+ лет, мини-группы до 5 человек.",
    path: "/about",
    keywords: [
      "о школе chinachild",
      "онлайн школа китайского",
      "лицензированная школа китайского",
      "школа китайского языка",
    ],
  });
}

export default function AboutPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "О школе", path: "/about" },
        ]}
      />
      <PageHero
        eyebrow="О школе"
        title="ChinaChild — лицензированная онлайн-школа китайского языка"
        description="Мы помогаем подросткам с 12 лет и взрослым выйти на разговорный уровень китайского за 6 месяцев. Программа лицензирована департаментом города Москвы, ученики могут вернуть налоговый вычет 13%."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Методика школы", href: "/methodology" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="card-block card-violet-soft">
            <div className="text-[2.5rem] font-medium tracking-[-0.02em] text-[#262626] leading-[1.05]">10+</div>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              лет опыт у каждого преподавателя школы
            </p>
          </div>
          <div className="card-block card-cream">
            <div className="text-[2.5rem] font-medium tracking-[-0.02em] text-[#262626] leading-[1.05]">HSK 1–2</div>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              лицензированная программа для разговорного уровня
            </p>
          </div>
          <div className="card-block card-lime-soft">
            <div className="text-[2.5rem] font-medium tracking-[-0.02em] text-[#262626] leading-[1.05]">до 5</div>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              человек в мини-группе — у каждого хватает времени на речь
            </p>
          </div>
          <div className="card-block card-sky">
            <div className="text-[2.5rem] font-medium tracking-[-0.02em] text-[#262626] leading-[1.05]">13%</div>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              налоговый вычет — школа лицензирована в Москве
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Как устроена школа
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
            <p>
              ChinaChild — онлайн-школа китайского языка для подростков с 12 лет и взрослых
              без подготовки. Мы работаем по программе HSK 1–2 и помогаем выйти на разговорный
              уровень за 6 месяцев. Образовательная лицензия выдана {LICENSE_REGION_INSTRUMENTAL} — на
              программу {LICENSE_PROGRAM}. Это значит, что ученики могут вернуть налоговый
              вычет 13% от стоимости обучения, до 15 600 ₽ в год.
            </p>
            <p>
              Обучение полностью онлайн: занятия в видеоформате, личный кабинет с лекциями,
              тестами и видеозаписями уроков. Платформа адаптирована под мобильные устройства,
              поэтому ученик может проходить материалы из дома, с работы или в дороге.
            </p>
            <p>
              Мы делаем ставку на мини-группы до 5 человек — формат, в котором у каждого хватает
              времени на разговорную практику и обратную связь от преподавателя. Параллельно
              доступен индивидуальный формат — со скидкой 10% для школьников с 12 лет при оплате
              за 2 месяца.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Команда</h2>
          <p className="section-description">
            В команде преподаватели, прошедшие подготовку в ведущих вузах региона — ЮФУ и
            ДГТУ. Опыт индивидуального и группового обучения — более 10 лет.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {teachers.map((t) => (
            <article key={t.slug} className="card-block card-cream-soft h-full">
              <div className="flex items-center gap-4">
                <Avatar
                  name={t.name}
                  size={64}
                  src={t.image}
                  alt={t.imageAlt}
                  title={t.imageTitle}
                />
                <div>
                  <h3 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626]">
                    {t.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[#262626]">
                    {t.specialization}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-[1.55] text-[#4b4b4b]">{t.credentials}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet-soft">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Лицензия и документы
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.55] text-[#4b4b4b]">
            <p>
              Образовательная деятельность ChinaChild ведётся на основании образовательной
              лицензии, выданной {LICENSE_REGION_INSTRUMENTAL}. Программа дополнительного профессионального
              образования соответствует уровням {LICENSE_PROGRAM} международной системы HSK и
              регулируется Федеральным законом 273-ФЗ «Об образовании в Российской Федерации».
            </p>
            <p>
              По итогам обучения школа выдаёт документ о прохождении программы дополнительного
              профессионального образования. Этот документ можно приложить к заявлению на
              налоговый вычет 13% — до 15 600 ₽ в год.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/methodology" className={buttonStyles({ variant: "secondary" })}>
              Методика школы
            </Link>
            <Link href="/courses" className={buttonStyles({})}>
              Все курсы
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
                Контакты школы
              </h2>
              <p className="mt-4 text-base leading-7 text-white/85">
                Если у вас остались вопросы про лицензию, программу или формат обучения,
                напишите или позвоните — отвечаем в течение рабочего дня.
              </p>
            </div>
            <div className="grid gap-3 text-white">
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2]">
                {CONTACT_PHONE}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-base text-white/80">
                {CONTACT_EMAIL}
              </a>
              <LeadModal
                triggerClassName={buttonStyles({ variant: "secondary", size: "large", className: "mt-4 w-fit" })}
                source="about-contact-card"
              >
                Записаться на пробное
              </LeadModal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
