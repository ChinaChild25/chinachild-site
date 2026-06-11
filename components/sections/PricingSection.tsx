import PricingFlipCard from "@/components/sections/PricingFlipCard";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { PROMO_CODE } from "@/lib/site-config";
import { pricingTiers } from "@/lib/site-data";

export default function PricingSection() {
  return (
    <SectionShell
      id="tseny"
      title="Гибкие тарифы и налоговый вычет"
      description={`Можно оплатить целиком или вернуть 13% через налоговый вычет. По промокоду ${PROMO_CODE} — выгода до 30%.`}
    >
      <div className="grid gap-5 md:grid-cols-3 md:gap-7 lg:gap-9">
        {pricingTiers.map((tier) => (
          <Reveal key={tier.title}>
            <PricingFlipCard tier={tier} />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
