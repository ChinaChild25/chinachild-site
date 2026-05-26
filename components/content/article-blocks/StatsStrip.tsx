import type { StatItem } from "@/lib/blog";

type StatsStripProps = {
  items: StatItem[];
};

/** Praktikum-style stat row: цельная подложка (cream/sky-soft), без обводок,
 *  без вертикальных дивайдеров — просто крупные цифры и подписи. */
export default function StatsStrip({ items }: StatsStripProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="article-stats"
      data-block="stats"
      data-count={items.length}
      aria-label="Ключевые цифры"
    >
      <dl className="article-stats__grid">
        {items.map((stat, index) => (
          <div
            key={`${stat.label}-${index}`}
            className="article-stats__item"
          >
            <dt className="sr-only">{stat.label}</dt>
            <dd className="article-stats__value">
              <span className="article-stats__number">{stat.value}</span>
              {stat.unit ? (
                <span className="article-stats__unit">{stat.unit}</span>
              ) : null}
            </dd>
            <p className="article-stats__label" aria-hidden="true">
              {stat.label}
            </p>
          </div>
        ))}
      </dl>
    </section>
  );
}
