import Link from "next/link";
import { ChartUp, HskCoin, PercentMedal, Sparkle } from "@/components/decor/Decor";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { PROMO_CODE, REGISTER_URL } from "@/lib/site-config";
import { pricingTiers } from "@/lib/site-data";

const palette = [
  {
    card: "card-cream-soft",
    buttonVariant: "primary" as const,
    icon: <HskCoin className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 opacity-90" />,
  },
  {
    card: "card-violet",
    buttonVariant: "secondary" as const,
    icon: (
      <>
        <Sparkle className="pointer-events-none absolute right-8 top-12 h-6 w-6 opacity-60" />
        <PercentMedal
          value="−10%"
          className="pointer-events-none absolute -right-8 -bottom-8 h-36 w-32 opacity-95"
        />
      </>
    ),
  },
  {
    card: "card-lime-soft",
    buttonVariant: "primary" as const,
    icon: <ChartUp className="pointer-events-none absolute -right-2 -bottom-4 h-32 w-36 opacity-95" />,
  },
];

export default function PricingSection() {
  return (
    <SectionShell
      id="tseny"
      title="Гибкие тарифы и налоговый вычет"
      description={`Можно оплатить целиком, помесячно или вернуть 13% через налоговый вычет. По промокоду ${PROMO_CODE} в апреле — выгода до 30%.`}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {pricingTiers.map((tier, index) => {
          const style = palette[index] ?? palette[0];
          const isViolet = style.card === "card-violet";
          return (
            <Reveal key={tier.title}>
              <article className={`card-block relative flex h-full flex-col overflow-hidden ${style.card}`}>
                {tier.featured ? (
                  <span className={`tag-pill self-start ${isViolet ? "tag-pill-ink" : ""}`}>
                    Популярный
                  </span>
                ) : null}

                <h3
                  className={`relative z-10 mt-6 text-2xl font-bold tracking-[-0.03em] ${
                    isViolet ? "text-white" : "text-[#1b1b1b]"
                  }`}
                >
                  {tier.title}
                </h3>
                <p className={`relative z-10 mt-2 text-sm ${isViolet ? "text-white/80" : "text-[#6b6b6b]"}`}>
                  {tier.format}
                </p>

                <div
                  className={`relative z-10 mt-6 text-4xl font-bold tracking-[-0.04em] ${
                    isViolet ? "text-white" : "text-[#1b1b1b]"
                  }`}
                >
                  {tier.price}
                </div>

                <p
                  className={`relative z-10 mt-4 max-w-[88%] text-sm leading-7 ${
                    isViolet ? "text-white/85" : "text-[#4b4b4b]"
                  }`}
                >
                  {tier.description}
                </p>

                <ul className={`relative z-10 mt-6 grid gap-2 text-sm ${isViolet ? "text-white" : "text-[#1b1b1b]"}`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className={isViolet ? "text-white/55" : "text-[#1b1b1b]/40"}>—</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative z-10 mt-auto pt-8">
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
                {style.icon}
              </article>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
