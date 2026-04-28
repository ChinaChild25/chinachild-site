import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { results } from "@/lib/site-data";

const palette = ["card-violet-soft", "card-cream", "card-lime-soft"] as const;

export default function ResultsSection() {
  return (
    <SectionShell
      id="rezultaty"
      title="Что вы получаете в ChinaChild"
      description="Конкретные результаты программы: разговорный уровень за полгода, мини-группы и налоговый вычет 13%."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {results.map((item, index) => (
          <Reveal key={item.title}>
            <article className={`card-block h-full ${palette[index % palette.length]}`}>
              <div className="text-5xl font-bold tracking-[-0.04em] text-[#1b1b1b] sm:text-6xl">
                {item.value}
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-[-0.02em] text-[#1b1b1b]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">{item.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
