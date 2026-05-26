import type { MistakeItem } from "@/lib/blog";

type MistakesBlockProps = {
  items: MistakeItem[];
  heading?: string;
  intro?: string;
};

/** Run-in numbered list, Praktikum-style:
 *  «1. Заголовок ошибки. Описание идёт сразу после жирного заголовка
 *  в одном абзаце.» Без сетки карточек, без обводки, без бэйджей.  */
export default function MistakesBlock({
  items,
  heading,
  intro,
}: MistakesBlockProps) {
  if (items.length === 0) return null;

  return (
    <section className="article-mistakes" data-block="mistakes">
      {(heading || intro) && (
        <header className="article-mistakes__head">
          {heading ? <h2 className="article-mistakes__title">{heading}</h2> : null}
          {intro ? <p className="article-mistakes__intro">{intro}</p> : null}
        </header>
      )}
      <ol className="article-mistakes__list">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="article-mistakes__item">
            <span className="article-mistakes__num" aria-hidden="true">
              {index + 1}.
            </span>
            <p className="article-mistakes__text">
              <strong className="article-mistakes__item-title">
                {item.title}.
              </strong>{" "}
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
