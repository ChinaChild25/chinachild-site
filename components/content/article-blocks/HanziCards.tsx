"use client";

import { useState, type CSSProperties } from "react";
import type { HanziCardItem } from "@/lib/blog";
import styles from "./ArticleVisuals.module.css";

type HanziCardsProps = {
  title?: string;
  subtitle?: string;
  caption?: string;
  columns?: number;
  quiz?: boolean;
  items: HanziCardItem[];
};

/** :::cards — сетка иероглифов с пиньинем и переводом. Ответы всегда есть в
 *  серверном HTML (индексируются); режим «Проверить себя» скрывает их на
 *  клиенте, и каждая карточка открывается нажатием. */
export default function HanziCards({ title, subtitle, caption, columns, quiz, items }: HanziCardsProps) {
  const [testing, setTesting] = useState(false);
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(() => new Set());
  const cols = columns ?? Math.min(6, items.length);
  const gridStyle = { "--cols": cols, "--cols-md": Math.min(cols, 3) } as CSSProperties;

  const toggleTesting = () => {
    setTesting((value) => !value);
    setRevealed(new Set());
  };

  const reveal = (index: number) => {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <figure className={styles.block} data-block="cards">
      {title || subtitle || quiz ? (
        <div className={styles.head}>
          <div>
            {title ? <p className={styles.title}>{title}</p> : null}
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          {quiz ? (
            <button type="button" className={styles.toggle} onClick={toggleTesting} aria-pressed={testing}>
              {testing ? "Показать все ответы" : "Проверить себя"}
            </button>
          ) : null}
        </div>
      ) : null}
      <ul className={styles.grid} style={gridStyle}>
        {items.map((item, index) => {
          const hidden = testing && !revealed.has(index);
          const className = [styles.card, item.highlight ? styles.cardHighlight : "", hidden ? styles.hidden : ""]
            .filter(Boolean)
            .join(" ");
          const content = (
            <>
              <span className={styles.hanzi} lang="zh-CN">
                {item.hanzi}
              </span>
              <span className={styles.answer}>
                {item.pinyin ? <span className={styles.pinyin}>{item.pinyin}</span> : null}
                {item.label ? <span className={styles.label}>{item.label}</span> : null}
                {item.note ? <span className={styles.note}>{item.note}</span> : null}
              </span>
              {hidden ? <span className={styles.hint}>нажмите, чтобы открыть</span> : null}
            </>
          );
          return (
            <li key={`${item.hanzi}-${index}`}>
              {testing ? (
                <button type="button" className={className} onClick={() => reveal(index)} aria-expanded={!hidden}>
                  {content}
                </button>
              ) : (
                <div className={className}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
