import TestArt from "./TestArt";

/**
 * Static, non-interactive mock of the result page — the «вот так выглядит
 * результат» preview, recreating the Praktikum «Вот так будут выглядеть
 * результаты» card-stack mockup (mini header, «Вам на X% подходит уровень»,
 * level name, button, photo + shapes, info strip).
 *
 * Purely decorative: no real data, no links.
 */
export default function ResultPreview() {
  return (
    <div className="hsk-preview" aria-hidden>
      <div className="hsk-preview-card">
        <div className="hsk-preview-top">
          <span className="hsk-preview-brand">ChinaChild</span>
          <div className="hsk-preview-dots">
            <span />
            <span />
            <span />
            <span className="hsk-preview-avatar" />
          </div>
        </div>

        <div className="hsk-preview-hero">
          <div className="hsk-preview-text">
            <span className="hsk-preview-eyebrow">Вам на 92% подходит уровень</span>
            <span className="hsk-preview-level">HSK 4</span>
            <span className="hsk-preview-btn">Подробнее об уровне</span>
          </div>
          <div className="hsk-preview-figure">
            <TestArt name="result-photo" className="hsk-preview-photo" />
            <TestArt name="result-shapes" className="hsk-preview-shapes" />
          </div>
        </div>

        <div className="hsk-preview-info">
          Тест показал ваш уровень и разбор по навыкам — мы собрали всё в
          понятный результат с рекомендацией, что учить дальше.
        </div>

        <div className="hsk-preview-skills">
          <div className="hsk-preview-skill-list">
            <span className="hsk-preview-skill-head">Разбор по навыкам</span>
            {SKILLS.map((s) => (
              <div className="hsk-preview-skill-row" key={s.name}>
                <span className="hsk-preview-skill-name">{s.name}</span>
                <span className="hsk-preview-skill-bar">
                  <span style={{ width: `${s.pct}%` }} />
                </span>
              </div>
            ))}
          </div>
          <div className="hsk-preview-skill-detail">
            <span className="hsk-preview-skill-score">8,2 из 10</span>
            <p className="hsk-preview-skill-text">
              Сильная лексика и грамматика — вы уверенно узнаёте иероглифы и
              собираете фразы. Чтение и понимание на слух чуть отстают: их и
              будем подтягивать на курсе.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const SKILLS = [
  { name: "Лексика", pct: 92 },
  { name: "Грамматика", pct: 84 },
  { name: "Чтение", pct: 70 },
  { name: "Понимание на слух", pct: 58 },
];
