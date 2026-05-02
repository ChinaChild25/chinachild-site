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
              <div className="text-[3rem] font-medium tracking-[-0.02em] text-[#1e1e1e] leading-[1.05] sm:text-[3.5rem]">
                {item.value}
              </div>
              <h3 className="mt-6 text-[1.125rem] font-medium tracking-[-0.01em] text-[#1e1e1e] leading-[1.2]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{item.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
