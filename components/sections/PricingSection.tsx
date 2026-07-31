import VioletSpotlightController from "@/components/effects/VioletSpotlightController";
import PricingFlipCard from "@/components/sections/PricingFlipCard";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { pricingTiers } from "@/lib/site-data";

export default function PricingSection() {
  return (
    <SectionShell
      id="tseny"
      title="Гибкие тарифы и налоговый вычет"
      description="Индивидуальный модуль оплачивается отдельно за один месяц. После него можно продолжить обучение, отдельно оплатив следующий модуль; автоматического списания и обязательной покупки нет. Налоговый вычет доступен при соблюдении условий закона."
      className="violet-spotlight"
    >
      <VioletSpotlightController />
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
