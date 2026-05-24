import Link from "next/link";
import { hskTestLevels } from "@/lib/hsk-test/levels";

export default function LevelGrid({
  /** When true, link to the per-level SEO page; otherwise link to /chinese/hsk-test/level-N. */
  linkToLevelPage = true,
}: {
  linkToLevelPage?: boolean;
} = {}) {
  return (
    <div className="hsk-test-level-grid">
      {hskTestLevels.map((meta) => {
        const href = linkToLevelPage
          ? `/chinese/hsk-test/${meta.slug}`
          : `/chinese/hsk-test/${meta.slug}`;
        return (
          <Link
            key={meta.slug}
            href={href}
            className={`hsk-test-level-card ${meta.cardClass}`}
          >
            <h3 className="hsk-test-level-card-title">HSK {meta.level}</h3>
            <p className="hsk-test-level-card-blurb">{meta.blurb}</p>
            <div className="hsk-test-level-card-meta">
              <span className="hsk-test-level-card-chip">{meta.vocabSize}</span>
              <span className="hsk-test-level-card-chip">{meta.hanziCount}</span>
              <span className="hsk-test-level-card-chip">{meta.cefr}</span>
              <span className="hsk-test-level-card-chip">{meta.hours}</span>
            </div>
            <span className="hsk-test-level-card-cta">
              Пройти тест уровня {meta.level} →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
