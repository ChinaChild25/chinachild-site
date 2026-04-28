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
      description="Подростки от 12 лет, старшеклассники, взрослые с нуля и команды компаний — программа подбирается под темп и цель."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {audienceSegments.map((segment) => (
          <Reveal key={segment.href}>
            <Link
              href={segment.href}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${accentStyles[segment.accent]}`}
            >
              <span className="tag-pill self-start">{segment.badge}</span>
              <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                {segment.title}
              </h3>
              <p className="mt-3 text-sm font-semibold text-[#1b1b1b]">
                {segment.audience}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4b4b4b]">
                {segment.description}
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-[#1b1b1b]">
                {segment.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-2">
                    <span className="text-[#1b1b1b]/40">—</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                Подробнее →
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
