import type { CSSProperties } from "react";
import type { BarItem, StepItem } from "@/lib/blog";
import styles from "./ArticleVisuals.module.css";

type BarChartProps = {
  title?: string;
  subtitle?: string;
  caption?: string;
  items: BarItem[];
};

/** :::bars — горизонтальная диаграмма одной серии. Значение подписано у
 *  каждого столбика, поэтому цвет не несёт смысла сам по себе. */
export function BarChart({ title, subtitle, caption, items }: BarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 0) || 1;
  return (
    <figure className={styles.block} data-block="bars">
      {title || subtitle ? (
        <div className={styles.head}>
          <div>
            {title ? <p className={styles.title}>{title}</p> : null}
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <ul className={styles.bars}>
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className={item.highlight ? `${styles.barRow} ${styles.barHighlight}` : styles.barRow}
          >
            <span className={styles.barLabel}>
              {item.label}
              {item.hint ? <span className={styles.barHint}>{item.hint}</span> : null}
            </span>
            <span className={styles.track}>
              <span
                className={styles.bar}
                style={{ "--w": `${(item.value / max) * 100}%` } as CSSProperties}
                aria-hidden="true"
              />
              <span className={styles.barValue}>{item.display ?? item.value.toLocaleString("ru-RU")}</span>
            </span>
          </li>
        ))}
      </ul>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}

type StepsProps = {
  title?: string;
  caption?: string;
  items: StepItem[];
};

/** :::steps — пронумерованные шаги плана. */
export function StepsBlock({ title, caption, items }: StepsProps) {
  return (
    <figure className={styles.block} data-block="steps">
      {title ? (
        <div className={styles.head}>
          <p className={styles.title}>{title}</p>
        </div>
      ) : null}
      <ol className={styles.steps}>
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className={styles.step}>
            <p className={styles.stepTitle}>{item.title}</p>
            {item.text ? <p className={styles.stepText}>{item.text}</p> : null}
          </li>
        ))}
      </ol>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
