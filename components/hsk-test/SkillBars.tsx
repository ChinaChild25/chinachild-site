import { SKILL_LABELS } from "@/lib/hsk-test/scoring";
import type { HskTestSkill } from "@/lib/hsk-test/types";

type SkillBarsProps = {
  skills: Record<HskTestSkill, number>;
};

const ORDER: HskTestSkill[] = ["vocabulary", "grammar", "reading", "listening"];

/**
 * Vertical bar chart of per-skill scores — mirrors the Praktikum result chart
 * («Вот какие направления вам подходят»): the strongest skill is highlighted,
 * the rest read as muted striped bars. Heights are 0–100% of the track.
 */
export default function SkillBars({ skills }: SkillBarsProps) {
  const entries = ORDER.map((skill) => ({
    skill,
    pct: Math.round((skills[skill] ?? 0) * 100),
  }));
  const topPct = Math.max(...entries.map((e) => e.pct));

  return (
    <div className="hsk-chart" role="img" aria-label="Результат по навыкам">
      <span className="hsk-chart-axis">100%</span>
      <div className="hsk-chart-bars">
        {ORDER.map((skill) => {
          const pct = entries.find((e) => e.skill === skill)!.pct;
          const isTop = pct > 0 && pct === topPct;
          return (
            <div className="hsk-chart-col" key={skill}>
              <span className="hsk-chart-pct">{pct}%</span>
              <div className="hsk-chart-track">
                <div
                  className={`hsk-chart-fill${isTop ? " hsk-chart-fill-top" : ""}`}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
              </div>
              <span className="hsk-chart-name">{SKILL_LABELS[skill]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
