import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { processSteps } from "@/lib/site-data";

const stepStyles = [
  { card: "card-violet-soft", chip: "1 неделя" },
  { card: "card-cream", chip: "Маршрут" },
  { card: "card-lime-soft", chip: "Регулярно" },
  { card: "card-sky", chip: "1 раз в месяц" },
] as const;

export default function ProcessSection() {
  return (
    <SectionShell
      id="kak-prokhodit"
      title="Как мы приводим вас к цели"
      description="Маршрут одинаково чёткий и для ребёнка, и для взрослого: диагностика, программа, живая практика и измеримый прогресс."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {processSteps.map((step, index) => {
          const style = stepStyles[index] ?? stepStyles[0];
          return (
            <Reveal key={step.title}>
              <article className={`card-block h-full ${style.card}`}>
                <span className="tag-pill self-start">{style.chip}</span>
                <h3 className="mt-6 text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">
                  {step.description}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
