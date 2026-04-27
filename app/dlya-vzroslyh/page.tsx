import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
import { Calendar, GlobeCharacter, PercentMedal } from "@/components/decor/Decor";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для взрослых онлайн с нуля | ChinaChild",
    description:
      "Курс китайского для взрослых без подготовки: программа HSK 1–2, разговорный уровень за 6 месяцев. Лицензия Москвы, налоговый вычет 13%, мини-группы и индивидуальные занятия.",
    path: "/dlya-vzroslyh",
    keywords: [
      "китайский для взрослых",
      "китайский с нуля онлайн",
      "разговорный китайский онлайн",
      "HSK для взрослых",
    ],
  });
}

const features = [
  {
    card: "card-sky",
    title: "С нуля до разговорного",
    body:
      "Курс подходит взрослым без предварительной подготовки. От фонетики и базовых конструкций — до простых диалогов и аутентичных текстов.",
    icon: <GlobeCharacter className="absolute -right-2 -bottom-2 h-32 w-32 opacity-95" />,
  },
  {
    card: "card-cream",
    title: "Удобный график",
    body:
      "Лекции, тесты и видеозаписи занятий — в личном кабинете. Можно учиться с телефона: всё адаптировано под мобильное устройство.",
    icon: <Calendar className="absolute -right-2 -bottom-2 h-32 w-32 opacity-95" />,
  },
  {
    card: "card-lime-soft",
    title: "Налоговый вычет 13%",
    body:
      "Школа лицензирована департаментом города Москвы. Можно вернуть 13% от стоимости обучения — до 15 600 ₽ в год.",
    icon: <PercentMedal value="13%" className="absolute -right-4 -bottom-4 h-32 w-28 opacity-95" />,
  },
];

export default function AdultsLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Для взрослых", path: "/dlya-vzroslyh" },
        ]}
      />
      <PageHero
        eyebrow="Взрослые без подготовки"
        title="Китайский для взрослых онлайн с нуля"
        description="Лицензированная программа HSK 1–2: разговорный уровень за 6 месяцев. Курс подходит тем, кто никогда раньше не учил китайский — мы выстроим маршрут от фонетики до аутентичных текстов."
        primaryCta={{ label: "Записаться на пробный урок", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Посмотреть FAQ", href: "/#faq" }}
      />

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((item) => (
            <article key={item.title} className={`card-block relative h-full overflow-hidden ${item.card}`}>
              <h2 className="relative z-10 text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                {item.title}
              </h2>
              <p className="relative z-10 mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">{item.body}</p>
              {item.icon}
            </article>
          ))}
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
