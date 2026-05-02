import LeadModal from "@/components/forms/LeadModal";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { PROMO_CODE } from "@/lib/site-config";
import { pricingTiers } from "@/lib/site-data";

const palette = [
  "card-cream-soft",
  "card-violet-soft",
  "card-lime-soft",
];

export default function PricingSection() {
  return (
    <SectionShell
      id="tseny"
      title="Гибкие тарифы и налоговый вычет"
      description={`Можно оплатить целиком или вернуть 13% через налоговый вычет. По промокоду ${PROMO_CODE} — выгода до 30%.`}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {pricingTiers.map((tier, index) => {
          const tone = palette[index] ?? palette[0];
          return (
            <Reveal key={tier.title} className="h-full">
              <article className={`card-block flex h-full flex-col ${tone}`}>
                {tier.featured ? (
                  <span className="tag-pill self-start">Популярный</span>
                ) : null}

                <h3 className="mt-6 text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1e1e1e]">
                  {tier.title}
                </h3>
                <p className="mt-2 text-sm text-[#6b6b6b]">{tier.format}</p>

                <div className="mt-6 text-[2.5rem] font-medium tracking-[-0.02em] leading-[1.05] text-[#1e1e1e]">
                  {tier.price}
                </div>

                <p className="mt-4 text-sm leading-[1.55] text-[#4b4b4b]">
                  {tier.description}
                </p>

                <ul className="mt-6 grid gap-2 text-sm text-[#1e1e1e]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-[#1e1e1e]/40">—</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <LeadModal
                    triggerClassName={buttonStyles({
                      variant: tier.featured ? "primary" : "secondary",
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
