import {
  Calendar,
  ChartUp,
  Headphones,
  Heart3D,
  HskCoin,
  PercentMedal,
} from "@/components/decor/Decor";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { benefits } from "@/lib/site-data";

const slots = [
  { card: "card-violet-soft", icon: <HskCoin className="absolute -right-4 -top-4 h-32 w-32 opacity-90" /> },
  { card: "card-cream", icon: <Heart3D className="absolute -right-4 -top-4 h-28 w-28 opacity-95" /> },
  { card: "card-lime-soft", icon: <Headphones className="absolute -right-4 -top-2 h-28 w-28 opacity-90" /> },
  { card: "card-sky", icon: <Calendar className="absolute -right-4 -top-4 h-32 w-32 opacity-90" /> },
  { card: "card-peach-soft", icon: <ChartUp className="absolute -right-4 -bottom-2 h-32 w-36 opacity-95" /> },
  { card: "card-cream-soft", icon: <PercentMedal className="absolute -right-2 -top-4 h-32 w-28 opacity-95" value="13%" /> },
] as const;

export default function WhySection() {
  return (
    <SectionShell
      id="preimushchestva"
      title="Почему ChinaChild"
      description="Что вы получаете в школе: лицензия Москвы, мини-группы, преподаватели ведущих вузов и личный кабинет с записями уроков."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit, index) => {
          const slot = slots[index] ?? slots[0];
          return (
            <Reveal key={benefit.title}>
              <article className={`card-block relative h-full overflow-hidden ${slot.card}`}>
                <div className="text-sm font-semibold text-[#1b1b1b]/55">
                  0{index + 1}
                </div>
                <h3 className="relative z-10 mt-4 max-w-[80%] text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                  {benefit.title}
                </h3>
                <p className="relative z-10 mt-3 max-w-[90%] text-sm leading-7 text-[#4b4b4b]">
                  {benefit.description}
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
