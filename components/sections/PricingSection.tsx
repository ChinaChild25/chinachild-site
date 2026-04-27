import Link from "next/link";
import Badge from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { REGISTER_URL } from "@/lib/site-config";
import { pricingTiers } from "@/lib/site-data";

export default function PricingSection() {
  return (
    <SectionShell
      id="tseny"
      label="Цены"
      title="Форматы обучения под ваш бюджет и темп"
      description="Выделяем понятные тарифы и самый конверсионный сценарий для большинства семей и взрослых студентов — мини-группу."
    >
      <div className="grid gap-5 xl:grid-cols-3">
        {pricingTiers.map((tier) => (
          <Reveal key={tier.title}>
            <article
              className={`surface-card h-full rounded-[30px] p-7 ${
                tier.featured ? "bg-[#1A1A2E] text-white" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-[-0.04em]">
                    {tier.title}
                  </h3>
                  <p className={`mt-2 text-sm ${tier.featured ? "text-white/74" : "text-[#6B7280]"}`}>
                    {tier.format}
                  </p>
                </div>
                {tier.featured ? (
                  <Badge className="bg-[#FFE03D] text-[#1A1A2E]">Популярный</Badge>
                ) : null}
              </div>

              <div className="mt-6 text-4xl font-extrabold tracking-[-0.05em]">
                {tier.price}
              </div>
              <p className={`mt-4 text-sm leading-7 ${tier.featured ? "text-white/74" : "text-[#4B5563]"}`}>
                {tier.description}
              </p>

              <ul className={`mt-6 grid gap-3 text-sm ${tier.featured ? "text-white/84" : "text-[#1A1A2E]"}`}>
                {tier.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>

              <Link
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({
                  variant: tier.featured ? "secondary" : "primary",
                  className: tier.featured
                    ? "mt-8 bg-white text-[#1A1A2E]"
                    : "mt-8 bg-[#FF3D00] text-white hover:bg-[#f03a00]",
                })}
              >
                Оставить заявку
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
