import Link from "next/link";
import { GlobeCharacter, Headphones, PersonWaving, PuzzleHands } from "@/components/decor/Decor";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { audienceSegments } from "@/lib/site-data";

const accentStyles = {
  violet: { card: "card-violet-soft", icon: <GlobeCharacter className="absolute -right-2 -bottom-4 h-36 w-36 opacity-95" /> },
  cream: { card: "card-cream", icon: <PersonWaving className="absolute -right-4 -bottom-2 h-44 w-36 opacity-95" /> },
  lime: { card: "card-lime-soft", icon: <PuzzleHands className="absolute -right-2 -bottom-2 h-32 w-44 opacity-95" /> },
  sky: { card: "card-sky", icon: <Headphones className="absolute -right-2 -bottom-2 h-32 w-32 opacity-95" /> },
} as const;

export default function AudienceSection() {
  return (
    <SectionShell
      id="dlya-kogo"
      title="Кому подходит ChinaChild"
      description="Подростки от 12 лет, старшеклассники, взрослые с нуля и команды компаний — программа подбирается под темп и цель."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {audienceSegments.map((segment) => {
          const slot = accentStyles[segment.accent];
          return (
            <Reveal key={segment.href}>
              <Link
                href={segment.href}
                className={`card-block group relative flex h-full min-h-[420px] flex-col overflow-hidden transition hover:-translate-y-1 ${slot.card}`}
              >
                <span className="tag-pill self-start">{segment.badge}</span>
                <h3 className="relative z-10 mt-6 text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                  {segment.title}
                </h3>
                <p className="relative z-10 mt-3 text-sm font-semibold text-[#1b1b1b]">
                  {segment.audience}
                </p>
                <p className="relative z-10 mt-3 max-w-[90%] text-sm leading-6 text-[#4b4b4b]">
                  {segment.description}
                </p>
                <ul className="relative z-10 mt-6 grid gap-2 text-sm text-[#1b1b1b]">
                  {segment.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-2">
                      <span className="text-[#1b1b1b]/40">—</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
                <div className="relative z-10 mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                  Подробнее →
                </div>
                {slot.icon}
              </Link>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
