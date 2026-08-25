import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { audienceSegments } from "@/lib/site-data";

const accentStyles = {
  violet: "card-violet-soft",
  cream: "card-cream",
  lime: "card-lime-soft",
  sky: "card-sky",
} as const;

export default function AudienceSection() {
  return (
    <SectionShell
      id="dlya-kogo"
      title="Кому подходит ChinaChild"
      description="Дети от 7 лет, подростки, студенты, взрослые с нуля и команды компаний — программа подбирается под возраст, темп и цель."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {audienceSegments.map((segment) => (
          <Reveal key={segment.href}>
            <Link
              href={segment.href}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${accentStyles[segment.accent]}`}
            >
              <span className="tag-pill self-start">{segment.badge}</span>
              <h3 className="mt-6 text-[1.5rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]">
                {segment.title}
              </h3>
              <p className="mt-3 text-sm font-medium text-[#262626]">
                {segment.audience}
              </p>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
                {segment.description}
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-[#262626]">
                {segment.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-2">
                    <span className="text-[#262626]/40">—</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6 text-sm font-medium text-[#262626] underline-offset-4 group-hover:underline">
                Подробнее →
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
