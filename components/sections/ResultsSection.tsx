import { Calendar, PercentMedal, Stars } from "@/components/decor/Decor";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { results } from "@/lib/site-data";

const slots = [
  { card: "card-violet-soft", icon: <Calendar className="absolute -right-4 -bottom-4 h-32 w-32 opacity-90" /> },
  { card: "card-cream", icon: <Stars className="absolute -right-2 -bottom-2 h-28 w-36 opacity-95" /> },
  { card: "card-lime-soft", icon: <PercentMedal value="13%" className="absolute -right-4 -bottom-4 h-32 w-28 opacity-95" /> },
] as const;

export default function ResultsSection() {
  return (
    <SectionShell
      id="rezultaty"
      title="Что вы получаете в ChinaChild"
      description="Конкретные результаты, на которые ориентирована программа: разговорный уровень за полгода, мини-группы и налоговый вычет."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {results.map((item, index) => {
          const slot = slots[index] ?? slots[0];
          return (
            <Reveal key={item.title}>
              <article className={`card-block relative h-full min-h-[260px] overflow-hidden ${slot.card}`}>
                <div className="relative z-10 text-5xl font-bold tracking-[-0.04em] text-[#1b1b1b] sm:text-6xl">
                  {item.value}
                </div>
                <h3 className="relative z-10 mt-6 text-lg font-bold tracking-[-0.02em] text-[#1b1b1b]">
                  {item.title}
                </h3>
                <p className="relative z-10 mt-3 max-w-[80%] text-sm leading-7 text-[#4b4b4b]">
                  {item.description}
                </p>
                {slot.icon}
              </article>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
