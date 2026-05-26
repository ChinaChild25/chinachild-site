type TLDRBoxProps = {
  points: string[];
  heading?: string;
};

/** Praktikum-style summary box: цельная пастельная подложка, без обводки,
 *  заголовок в обычном регистре жирным, маркеры — обычная точка. */
export default function TLDRBox({
  points,
  heading = "Коротко",
}: TLDRBoxProps) {
  if (points.length === 0) return null;

  return (
    <aside
      className="article-tldr"
      data-block="tldr"
      aria-label={heading}
    >
      <p className="article-tldr__label">{heading}</p>
      <ul className="article-tldr__list">
        {points.map((point, index) => (
          <li key={`${index}-${point.slice(0, 24)}`} className="article-tldr__item">
            {point}
          </li>
        ))}
      </ul>
    </aside>
  );
}
