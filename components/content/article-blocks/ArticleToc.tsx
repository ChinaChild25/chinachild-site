/**
 * Article TOC — collapsible content navigator for long blog posts.
 *
 * Renders as a <details> so it's expanded by default on desktop (CSS) but
 * collapsible on mobile to keep the lead intro on screen. Anchor links use
 * fragment IDs emitted on the underlying <h2>/<h3> in the blog renderer —
 * shared slugify keeps IDs stable across renders.
 */

import { slugifyHeading } from "@/lib/blog";

export type TocItem = {
  level: 2 | 3;
  text: string;
};

type ArticleTocProps = {
  items: TocItem[];
};

export default function ArticleToc({ items }: ArticleTocProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Содержание статьи" className="article-toc">
      <details open className="article-toc__details">
        <summary className="article-toc__summary">
          <span className="article-toc__label">Содержание</span>
          <span aria-hidden className="article-toc__count">
            {items.length} {pluralize(items.length, ["раздел", "раздела", "разделов"])}
          </span>
        </summary>
        <ol className="article-toc__list">
          {items.map((item, index) => {
            const id = slugifyHeading(item.text);
            return (
              <li
                key={`${id}-${index}`}
                className={`article-toc__item article-toc__item--level-${item.level}`}
              >
                <a href={`#${id}`} className="article-toc__link">
                  {item.text}
                </a>
              </li>
            );
          })}
        </ol>
      </details>
    </nav>
  );
}

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
