import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import PricingSection from "@/components/sections/PricingSection";
import FAQSection from "@/components/sections/FAQSection";
import TaxDeductionCalculator from "@/components/calculators/TaxDeductionCalculator";
import { buildMetadata } from "@/lib/metadata";
import { faqs } from "@/lib/site-data";

export const metadata: Metadata = buildMetadata({
  title: "Цены на курсы китайского языка ChinaChild — тарифы и оплата",
  description:
    "Индивидуальный модуль ChinaChild — 17 990 ₽ за месяц и 8 занятий по 60 минут, без подписки и автоматического списания. Следующий модуль оплачивается отдельно по решению ученика.",
  path: "/price",
  keywords: [
    "цены на курсы китайского",
    "стоимость HSK",
    "сколько стоит выучить китайский",
    "цена занятий с репетитором китайского",
    "тарифы школы китайского",
  ],
});

const pricingFaqs = faqs.filter((f) =>
  /стоимост|оплат|вычет|цен/i.test(f.question + f.answer),
);

export default function PricePage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Цены", path: "/price" },
        ]}
      />
      <PageHero
        eyebrow="Цены и тарифы"
        title="Сколько стоит обучение китайскому в ChinaChild"
        description="Обучение проходит последовательными модулями. Один индивидуальный модуль стоит 17 990 ₽, рассчитан на месяц и включает 8 занятий по 60 минут. После него можно продолжить обучение, отдельно оплатив следующий модуль. Автоматического списания и обязательной покупки нет."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
        illustration="/heroes/price.webp"
        illustrationAlt="3D иллюстрация ценника в фиолетовом цвете"
        illustrationWidth={1254}
        illustrationHeight={1254}
      />

      <PricingSection />

      <section className="page-shell-wide section-space">
        <div className="section-head-center mx-auto max-w-3xl">
          <h2 className="section-title">Посчитайте свой налоговый вычет</h2>
          <p className="section-description">
            Школа лицензирована Департаментом образования Москвы — обучение
            попадает под социальный вычет по ст. 219 НК&nbsp;РФ. Двигайте ползунок
            и смотрите предварительный расчёт. Фактическая сумма зависит от права
            на вычет, уплаченного НДФЛ и установленных законом лимитов.
          </p>
        </div>
        <div className="mt-10 sm:mt-14">
          <TaxDeductionCalculator />
        </div>
      </section>

      <FAQSection
        id="price-faq"
        title="О ценах и оплате"
        description="Если вашего вопроса нет — позвоните или оставьте заявку. Заявки обрабатываем ежедневно с 09:00 до 21:00 МСК, обычно отвечаем в течение 1–2 часов в этот период."
        items={pricingFaqs.length > 0 ? pricingFaqs : faqs.slice(0, 4)}
        schemaId="price-faq-schema"
      />
    </main>
  );
}
