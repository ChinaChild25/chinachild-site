import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { processSteps } from "@/lib/site-data";

const stepStyles = ["card-violet-soft", "card-cream", "card-lime-soft", "card-sky"] as const;

export default function ProcessSection() {
  return (
    <SectionShell
      id="kak-prokhodit"
      title="Как мы приводим к разговорному уровню"
      description="Четыре шага от бесплатного теста до регулярной практики в личном кабинете школы."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {processSteps.map((step, index) => (
          <Reveal key={step.title}>
            <article className={`card-block h-full ${stepStyles[index] ?? stepStyles[0]}`}>
              <div className="text-sm font-medium text-[#262626]/55">Шаг {index + 1}</div>
              <h3 className="mt-4 text-[1.25rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{step.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
