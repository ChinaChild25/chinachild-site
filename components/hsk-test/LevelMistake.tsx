/**
 * «Типичная ошибка на HSK N» — Praktikum hero-collage. A glossy dark device
 * (center.webp) is the anchor, with four compact pastel cards floating around
 * it at hand-placed positions, slight rotations and overlaps. The whole thing
 * is a fixed 2048×1148 artboard scaled with container-query units (cqw), so the
 * exact pixel spec holds at any width. Desktop = absolute collage; mobile = a
 * plain vertical stack (see `.hsk-mistake*` in globals.css).
 */
type Props = {
  level: number;
  mistake: {
    big: string;
    note: string;
    fix: string;
    tip: string;
    watch: string[];
  };
  typicalMistake: string;
};

const CJK_QUOTE_RE = /«[^»]*[\u3400-\u9fff][^»]*»/gu;

function keepCjkQuotesTogether(text: string) {
  const parts = [];
  let lastIndex = 0;

  for (const match of text.matchAll(CJK_QUOTE_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    parts.push(
      <span className="hsk-nowrap" key={`${match[0]}-${index}`}>
        {match[0]}
      </span>,
    );
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : text;
}

export default function LevelMistake({
  level,
  mistake,
  typicalMistake,
}: Props) {
  return (
    <div className="hsk-mistake">
      {/* left-top */}
      <article className="hsk-mistake-c hsk-mistake-c1">
        <span className="hsk-mistake-tag">Типичная ошибка</span>
        <p>{keepCjkQuotesTogether(typicalMistake)}</p>
      </article>

      {/* left-bottom */}
      <article className="hsk-mistake-c hsk-mistake-c3">
        <span className="hsk-mistake-tag">Совет</span>
        <p>{keepCjkQuotesTogether(mistake.tip)}</p>
      </article>

      {/* centre — glossy device, focal example on the black screen */}
      <div className="hsk-mistake-center">
        <div className="hsk-mistake-screen">
          <span className="hsk-mistake-eyebrow">Запомните</span>
          <p className="hsk-mistake-big" lang="zh">
            {mistake.big}
          </p>
          <p className="hsk-mistake-note">{keepCjkQuotesTogether(mistake.note)}</p>
        </div>
      </div>

      {/* right-top */}
      <article className="hsk-mistake-c hsk-mistake-c2">
        <span className="hsk-mistake-tag">Как не ошибиться</span>
        <p>{keepCjkQuotesTogether(mistake.fix)}</p>
      </article>

      {/* right-bottom (keyboard texture), overlaps the device */}
      <article className="hsk-mistake-c hsk-mistake-c4">
        <span className="hsk-mistake-tag">
          На что обратить внимание на&nbsp;уровне HSK&nbsp;{level}
        </span>
        <div className="hsk-mistake-pills">
          {mistake.watch.map((w) => (
            <span className="hsk-mistake-pill" key={w} lang="zh">
              {w}
            </span>
          ))}
        </div>
      </article>

      <aside className="hsk-mistake-expert">
        <div>
          <p className="hsk-mistake-expert-title">
            Разбор от носителя — Чжао Ли
          </p>
          <p className="hsk-mistake-expert-text">
            Помогает увидеть ошибку до экзамена
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/team/zhao-li-prepodavatel-kitajskogo.webp"
          alt=""
          aria-hidden
          width={172}
          height={172}
          className="hsk-mistake-expert-photo"
          loading="lazy"
          draggable={false}
        />
      </aside>
    </div>
  );
}
