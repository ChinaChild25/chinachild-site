import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { audienceSegments } from "@/lib/site-data";

const accentStyles = {
  red: "bg-[#fff0eb]",
  blue: "bg-[#eef0ff]",
  yellow: "bg-[#fffbe1]",
  green: "bg-[#edf9f3]",
} as const;

export default function AudienceSection() {
  return (
    <SectionShell
      id="dlya-kogo"
      label="Сегменты"
      title="Китайский онлайн под разные цели и возраст"
      description="Это SEO-ядро страницы: каждый сегмент ведёт на отдельный посадочный лендинг, чтобы собирать трафик под возраст, мотивацию и формат обучения."
    >
      <div className="mobile-scroll lg:grid lg:grid-cols-4">
        {audienceSegments.map((segment) => (
          <Reveal key={segment.href}>
            <Link
              href={segment.href}
              className={`block h-full rounded-[28px] border border-[rgba(26,26,46,0.08)] p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(26,26,46,0.08)] ${accentStyles[segment.accent]}`}
            >
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#1A1A2E]">
                {segment.badge}
              </div>
              <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-[#1A1A2E]">
                {segment.title}
              </h3>
              <p className="mt-3 text-sm font-semibold text-[#1A1A2E]">
                {segment.audience}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#4B5563]">
                {segment.description}
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-[#1A1A2E]">
                {segment.outcomes.map((outcome) => (
                  <li key={outcome}>• {outcome}</li>
                ))}
              </ul>
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
