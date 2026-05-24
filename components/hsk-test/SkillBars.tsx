import { SKILL_LABELS } from "@/lib/hsk-test/scoring";
import type { HskTestSkill } from "@/lib/hsk-test/types";

type SkillBarsProps = {
  skills: Record<HskTestSkill, number>;
};

const ORDER: HskTestSkill[] = ["vocabulary", "grammar", "reading", "listening"];

export default function SkillBars({ skills }: SkillBarsProps) {
  return (
    <div className="hsk-test-skills">
      {ORDER.map((skill) => {
        const pct = Math.round((skills[skill] ?? 0) * 100);
        return (
          <div className="hsk-test-skill-row" key={skill}>
            <div className="hsk-test-skill-row-head">
              <span className="hsk-test-skill-name">{SKILL_LABELS[skill]}</span>
              <span className="hsk-test-skill-pct">{pct}%</span>
            </div>
            <div className="hsk-test-skill-track" aria-hidden>
              <div
                className="hsk-test-skill-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
