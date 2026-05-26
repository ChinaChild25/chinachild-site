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
    "Стоимость курсов китайского ChinaChild. Тарифы для мини-групп и индивидуальных занятий, помесячная оплата, налоговый вычет 13% (до 15 600 ₽), скидки и акции.",
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
        description="Прозрачные тарифы. Можно оплатить курс целиком, помесячно или вернуть 13% через налоговый вычет — мы лицензированы Москвой. По акции КИТАПР26 — выгода до 30%."
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
        illustration="/heroes/price.webp"
        illustrationAlt="3D иллюстрация ценника в фиолетовом цвете"
        illustrationWidth={1254}
        illustrationHeight={1254}
      />

      <PricingSection />

      <section className="page-shell-wide section-space">
        <TaxDeductionCalculator />
      </section>

      <FAQSection
        id="price-faq"
        title="О ценах и оплате"
        description="Если вашего вопроса нет — позвоните или оставьте заявку, ответим в течение рабочего дня."
        items={pricingFaqs.length > 0 ? pricingFaqs : faqs.slice(0, 4)}
        schemaId="price-faq-schema"
      />
    </main>
  );
}
