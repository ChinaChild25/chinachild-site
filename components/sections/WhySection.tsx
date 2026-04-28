import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { benefits } from "@/lib/site-data";

const palette = [
  "card-violet-soft",
  "card-cream",
  "card-lime-soft",
  "card-sky",
  "card-peach-soft",
  "card-cream-soft",
] as const;

export default function WhySection() {
  return (
    <SectionShell
      id="preimushchestva"
      title="Почему ChinaChild"
      description="Лицензия Москвы, мини-группы до 5 человек, преподаватели ведущих вузов и личный кабинет с записями уроков."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit, index) => (
          <Reveal key={benefit.title}>
            <article className={`card-block h-full ${palette[index % palette.length]}`}>
              <div className="text-sm font-semibold text-[#1b1b1b]/55">
                0{index + 1}
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">
                {benefit.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
