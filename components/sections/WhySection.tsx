import {
  BrainCircuit,
  ChartSpline,
  ShieldCheck,
  Users,
  Video,
  GraduationCap,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { benefits } from "@/lib/site-data";

const icons = [
  GraduationCap,
  BrainCircuit,
  Video,
  ChartSpline,
  Users,
  ShieldCheck,
];

export default function WhySection() {
  return (
    <SectionShell
      id="preimushchestva"
      label="Почему ChinaChild"
      title="Преимущества, которые влияют и на результат, и на конверсию"
      description="Не абстрактные обещания, а конкретные сильные стороны школы: преподаватели, платформа, формат и прозрачность прогресса."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit, index) => {
          const Icon = icons[index];

          return (
            <Reveal key={benefit.title}>
              <article className="surface-card h-full rounded-[28px] p-6">
                <div className="inline-flex rounded-2xl bg-[#1A1A2E] p-3 text-white">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-xl font-extrabold tracking-[-0.03em]">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#4B5563]">
                  {benefit.description}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
