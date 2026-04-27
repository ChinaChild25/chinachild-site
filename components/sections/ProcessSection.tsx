import { Calendar, ChartUp, PercentMedal, SpeechBubbles } from "@/components/decor/Decor";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { processSteps } from "@/lib/site-data";

const stepStyles = [
  { card: "card-violet-soft", chip: "Бесплатно", icon: <PercentMedal value="HSK" className="absolute -right-2 -bottom-4 h-32 w-28 opacity-95" /> },
  { card: "card-cream", chip: "Знакомство", icon: <SpeechBubbles className="absolute -right-2 -bottom-2 h-32 w-36 opacity-95" /> },
  { card: "card-lime-soft", chip: "Старт курса", icon: <Calendar className="absolute -right-2 -bottom-4 h-32 w-32 opacity-95" /> },
  { card: "card-sky", chip: "Регулярно", icon: <ChartUp className="absolute -right-2 -bottom-4 h-32 w-36 opacity-95" /> },
] as const;

export default function ProcessSection() {
  return (
    <SectionShell
      id="kak-prokhodit"
      title="Как мы приводим к разговорному уровню"
      description="Маршрут одинаково чёткий и для подростка, и для взрослого: бесплатный тест, пробное занятие, регистрация и регулярная практика."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {processSteps.map((step, index) => {
          const style = stepStyles[index] ?? stepStyles[0];
          return (
            <Reveal key={step.title}>
              <article className={`card-block relative h-full min-h-[300px] overflow-hidden ${style.card}`}>
                <span className="tag-pill self-start">{style.chip}</span>
                <div className="relative z-10 mt-6 text-sm font-semibold text-[#1b1b1b]/55">
                  Шаг {index + 1}
                </div>
                <h3 className="relative z-10 mt-2 text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                  {step.title}
                </h3>
                <p className="relative z-10 mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">
                  {step.description}
                </p>
                {style.icon}
              </article>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
