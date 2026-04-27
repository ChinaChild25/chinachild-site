import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { results } from "@/lib/site-data";

export default function ResultsSection() {
  return (
    <SectionShell
      id="rezultaty"
      label="Результаты"
      title="Показываем прогресс в цифрах, а не только в обещаниях"
      description="Такие блоки помогают SEO-странице отвечать на конкретные интенты: за сколько времени, в каком формате и с каким измеримым результатом идёт обучение."
    >
      <div className="stats-grid">
        {results.map((item) => (
          <Reveal key={item.title}>
            <article className="surface-card rounded-[28px] p-7">
              <div className="text-4xl font-extrabold tracking-[-0.05em] text-[#1A1A2E]">
                {item.value}
              </div>
              <h3 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-[#1A1A2E]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#4B5563]">
                {item.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
