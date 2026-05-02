import LeadModal from "@/components/forms/LeadModal";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { PROMO_CODE } from "@/lib/site-config";
import { pricingTiers } from "@/lib/site-data";

/** Цветной акцент-заголовок каждого тарифа — соответствует скриншоту:
 *  «Введение» — мятный, «Для начинающих» — жёлтый, «Индивидуальный» — фиолетовый. */
const titleAccent = ["#7DBF8E", "#FFD466", "#B8B0FF"] as const;

export default function PricingSection() {
  return (
    <SectionShell
      id="tseny"
      title="Гибкие тарифы и налоговый вычет"
      description={`Можно оплатить целиком или вернуть 13% через налоговый вычет. По промокоду ${PROMO_CODE} — выгода до 30%.`}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {pricingTiers.map((tier, index) => {
          const accent = titleAccent[index] ?? titleAccent[0];
          return (
            <Reveal key={tier.title}>
              <article className="card-block flex h-full flex-col bg-[#1e1e1e] text-white relative">
                {tier.featured ? (
                  <span
                    aria-label="Хит продаж"
                    className="absolute right-0 top-0 inline-flex items-center justify-center rounded-bl-[16px] rounded-tr-[20px] bg-[#FF6363] px-4 py-2 text-xs font-medium tracking-[0.02em] text-white"
                  >
                    ХИТ
                  </span>
                ) : null}

                <h3
                  className="text-[1.25rem] font-medium tracking-[-0.005em] leading-[1.2]"
                  style={{ color: accent }}
                >
                  {tier.title}
                </h3>

                <p className="mt-4 text-[1.125rem] font-normal leading-[1.3] text-white sm:text-[1.25rem]">
                  {tier.format}
                </p>

                <ul className="mt-6 grid list-decimal gap-2.5 pl-5 text-sm leading-[1.55] text-white/85 marker:text-white/55">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <div
                  className="mt-8 text-[2.25rem] font-medium tracking-[-0.02em] leading-[1.05] text-white sm:text-[2.5rem]"
                >
                  {tier.price}
                </div>

                <div className="mt-6 pt-2">
                  <LeadModal
                    triggerClassName={buttonStyles({
                      variant: "secondary",
                      className: "w-full",
                    })}
                    source={`pricing-${tier.title}`}
                  >
                    Оставить заявку
                  </LeadModal>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
