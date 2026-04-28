import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { PROMO_CODE, REGISTER_URL } from "@/lib/site-config";
import { pricingTiers } from "@/lib/site-data";

const palette = [
  { card: "card-cream-soft", buttonVariant: "primary" as const },
  { card: "card-violet", buttonVariant: "secondary" as const },
  { card: "card-lime-soft", buttonVariant: "primary" as const },
];

export default function PricingSection() {
  return (
    <SectionShell
      id="tseny"
      title="Гибкие тарифы и налоговый вычет"
      description={`Можно оплатить целиком, помесячно или вернуть 13% через налоговый вычет. По промокоду ${PROMO_CODE} — выгода до 30%.`}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {pricingTiers.map((tier, index) => {
          const style = palette[index] ?? palette[0];
          const isViolet = style.card === "card-violet";
          return (
            <Reveal key={tier.title}>
              <article className={`card-block flex h-full flex-col ${style.card}`}>
                {tier.featured ? (
                  <span className={`tag-pill self-start ${isViolet ? "tag-pill-ink" : ""}`}>
                    Популярный
                  </span>
                ) : null}

                <h3
                  className={`mt-6 text-2xl font-bold tracking-[-0.03em] ${
                    isViolet ? "text-white" : "text-[#1b1b1b]"
                  }`}
                >
                  {tier.title}
                </h3>
                <p className={`mt-2 text-sm ${isViolet ? "text-white/80" : "text-[#6b6b6b]"}`}>
                  {tier.format}
                </p>

                <div
                  className={`mt-6 text-4xl font-bold tracking-[-0.04em] ${
                    isViolet ? "text-white" : "text-[#1b1b1b]"
                  }`}
                >
                  {tier.price}
                </div>

                <p
                  className={`mt-4 text-sm leading-7 ${
                    isViolet ? "text-white/85" : "text-[#4b4b4b]"
                  }`}
                >
                  {tier.description}
                </p>

                <ul className={`mt-6 grid gap-2 text-sm ${isViolet ? "text-white" : "text-[#1b1b1b]"}`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className={isViolet ? "text-white/55" : "text-[#1b1b1b]/40"}>—</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Link
                    href={REGISTER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles({
                      variant: style.buttonVariant,
                      className: "w-full",
                    })}
                  >
                    Оставить заявку
                  </Link>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
