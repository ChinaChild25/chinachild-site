import Link from "next/link";
import type { GrammarBlock } from "@/lib/content/types";
import AudioButton from "@/components/content/AudioButton";

// Public grammar_blocks renderer. Each block type gets its own visual
// treatment so a published article reads like a real lesson, not a stack of
// identical beige cards.
//
// Content key mapping mirrors the platform fixtures actually in the DB:
//   heading / paragraph / callout — `content.text_ru` (fall back to `text`)
//   scheme                        — `content.label_ru` + `content.parts[]` (each `label`, optional `hint`)
//   examples                      — `content.items[]` with `hanzi`, `pinyin`, `translation_ru`, optional `literal`, optional `audio_url`
//   list                          — `content.text_ru` (intro) + `content.items[]` (strings); `style="mistakes"` styles it as common-mistakes
//   related                       — `content.label_ru` + `content.items[]` with `title` and optional `href`
//   vocabulary_links              — `content.terms[]` with `slug` and `label` (hanzi)
//   formula                       — `content.formula` + optional `content.text_ru`
//
// Visual language stays inside the chinachild-site palette. No new design
// system, no Laoshi clone. Empty data returns null — no large empty cards.

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function readText(content: AnyRecord): string {
  return (
    asString(content.text_ru) ||
    asString(content.text) ||
    asString(content.body) ||
    asString(content.title_ru) ||
    asString(content.title)
  );
}

export default function GrammarBlockRenderer({ blocks }: { blocks: GrammarBlock[] }) {
  if (blocks.length === 0) {
    return (
      <p className="text-sm text-[#6b6b6b]">
        Подробная разметка статьи пока не добавлена. Полная версия доступна в учебной платформе.
      </p>
    );
  }
  return (
    <div className="mx-auto min-w-0 max-w-[760px] space-y-8">
      {blocks.map((block) => (
        <BlockSwitch key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockSwitch({ block }: { block: GrammarBlock }) {
  const content = asRecord(block.content);
  switch (block.blockType) {
    case "heading":
      return <HeadingBlock content={content} />;
    case "paragraph":
      return <ParagraphBlock content={content} />;
    case "list":
      return <ListBlock content={content} />;
    case "scheme":
      return <SchemeBlock content={content} />;
    case "formula":
      return <FormulaBlock content={content} />;
    case "callout":
      return <CalloutBlock content={content} />;
    case "examples":
      return <ExamplesBlock content={content} />;
    case "related":
      return <RelatedBlock content={content} />;
    case "vocabulary_links":
      return <VocabularyLinksBlock content={content} />;
    default:
      return null;
  }
}

// ---------- Heading ----------
function HeadingBlock({ content }: { content: AnyRecord }) {
  const text = readText(content);
  const levelRaw = content.level;
  const level =
    typeof levelRaw === "number" && Number.isFinite(levelRaw)
      ? Math.min(6, Math.max(2, Math.trunc(levelRaw)))
      : 2;
  if (!text) return null;
  const sizes: Record<string, string> = {
    h2: "text-[1.6rem] sm:text-[1.85rem]",
    h3: "text-[1.25rem] sm:text-[1.35rem]",
    h4: "text-[1.1rem]",
    h5: "text-base font-semibold",
    h6: "text-sm font-semibold",
  };
  const Tag = (`h${level}`) as "h2" | "h3" | "h4" | "h5" | "h6";
  const sizeClass = sizes[`h${level}`] ?? sizes.h3;
  return (
    <Tag className={`mt-2 font-medium leading-[1.2] tracking-[-0.012em] text-[#1b1b1b] ${sizeClass}`}>
      {text}
    </Tag>
  );
}

// ---------- Paragraph ----------
function ParagraphBlock({ content }: { content: AnyRecord }) {
  const text = readText(content);
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-[1.05rem] leading-[1.7] text-[#2d2d2d]">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

// ---------- List ----------
function ListBlock({ content }: { content: AnyRecord }) {
  const items = asArray<unknown>(content.items).map((item) => asString(item)).filter(Boolean);
  if (items.length === 0) return null;
  const intro = readText(content);
  const ordered = content.style === "ordered" || content.ordered === true;
  const isMistakes = content.style === "mistakes" || content.style === "checklist";

  const listEl = ordered ? (
    <ol className="list-decimal space-y-1.5 pl-6 text-[1.05rem] leading-[1.65] text-[#2d2d2d]">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  ) : (
    <ul className="space-y-1.5 pl-1 text-[1.05rem] leading-[1.65] text-[#2d2d2d]">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span aria-hidden className="mt-[0.65rem] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a9a9a]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  if (isMistakes) {
    return (
      <aside className="rounded-[var(--radius-card-md)] border border-[#eadcd2] bg-[#fdf3ec] px-5 py-4">
        <p className="text-sm font-medium text-[#8a4a2a]">Частые ошибки</p>
        {intro ? <p className="mt-2 text-[15px] leading-[1.55] text-[#3a3a3a]">{intro}</p> : null}
        <div className="mt-3">{listEl}</div>
      </aside>
    );
  }

  return (
    <div className="space-y-3">
      {intro ? <p className="text-[1.05rem] leading-[1.7] text-[#2d2d2d]">{intro}</p> : null}
      {listEl}
    </div>
  );
}

// ---------- Scheme ----------
type SchemePart = { label: string; hint?: string };

function SchemeBlock({ content }: { content: AnyRecord }) {
  const partsRaw = asArray<AnyRecord>(content.parts);
  const parts: SchemePart[] = partsRaw
    .map((part) => ({
      label: asString(part.label) || asString(part.text),
      hint: asString(part.hint) || asString(part.note) || undefined,
    }))
    .filter((part) => part.label.length > 0);
  if (parts.length === 0) return null;

  const label = asString(content.label_ru) || asString(content.label) || "Схема";
  const caption = readText({ ...content, text_ru: content.caption ?? content.text_ru });

  return (
    <figure className="space-y-3">
      <p className="text-sm font-medium text-[#6b6b6b]">{label}</p>
      <div className="grammar-scheme-panel rounded-[var(--radius-card)] px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-stretch justify-center gap-x-2 gap-y-3 sm:gap-x-3">
          {parts.map((part, index) => (
            <div key={index} className="contents">
              <SchemePill part={part} />
              {index < parts.length - 1 ? <SchemeSeparator /> : null}
            </div>
          ))}
        </div>
      </div>
      {caption ? (
        <figcaption className="text-sm leading-[1.55] text-[#4b4b4b]">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

function SchemePill({ part }: { part: SchemePart }) {
  return (
    <div className="flex min-w-[6.5rem] flex-col items-center justify-center rounded-[14px] bg-white px-4 py-3 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05]">
      <p className="text-[15px] font-medium leading-snug text-[#1b1b1b] sm:text-base">
        {part.label}
      </p>
      {part.hint ? (
        <p className="mt-1 max-w-[10rem] text-[12px] leading-snug text-[#6b6b6b]">{part.hint}</p>
      ) : null}
    </div>
  );
}

function SchemeSeparator() {
  return (
    <span
      aria-hidden
      className="grammar-scheme-plus flex shrink-0 select-none items-center justify-center self-center text-2xl font-light"
    >
      +
    </span>
  );
}

// ---------- Formula ----------
function FormulaBlock({ content }: { content: AnyRecord }) {
  const formula = asString(content.formula);
  // The fixture sometimes uses "formula" with "+" separators, identical to a
  // scheme's parts list. Render as a compact scheme-like row but smaller.
  const note = readText(content);
  if (!formula && !note) return null;
  const parts = formula
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <figure className="space-y-3">
      <p className="text-sm font-medium text-[#6b6b6b]">Формула</p>
      <div className="grammar-scheme-panel grammar-formula-panel rounded-[var(--radius-card-md)] px-4 py-3 sm:px-5">
        {parts.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
            {parts.map((label, index) => (
              <span key={index} className="contents">
                <span className="inline-flex items-center rounded-[10px] bg-white px-3 py-1.5 text-sm font-medium text-[#1b1b1b] ring-1 ring-black/[0.05]">
                  {label}
                </span>
                {index < parts.length - 1 ? (
                  <span aria-hidden className="grammar-scheme-plus select-none text-lg">
                    +
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-[#4b4b4b]">{formula}</p>
        )}
      </div>
      {note ? <p className="text-sm leading-[1.55] text-[#4b4b4b]">{note}</p> : null}
    </figure>
  );
}

// ---------- Callout ----------
const CALLOUT_LABELS: Record<string, string> = {
  info: "Обрати внимание",
  tip: "Совет",
  warning: "Важно",
  rule: "Правило",
};

function CalloutBlock({ content }: { content: AnyRecord }) {
  const text = readText(content);
  if (!text) return null;
  const toneRaw = asString(content.tone).toLowerCase();
  const tone = CALLOUT_LABELS[toneRaw] ? toneRaw : "info";
  const title = asString(content.title) || CALLOUT_LABELS[tone] || "Обрати внимание";
  return (
    <aside className={`grammar-callout grammar-callout--${tone}`}>
      <p className="grammar-callout-title">{title}</p>
      <p className="grammar-callout-body">{text}</p>
    </aside>
  );
}

// ---------- Examples ----------
type ExampleEntry = {
  hanzi?: unknown;
  pinyin?: unknown;
  translation_ru?: unknown;
  translation?: unknown;
  literal?: unknown;
  ru?: unknown;
  term_slug?: unknown;
  termSlug?: unknown;
  audio_url?: unknown;
  audioUrl?: unknown;
  highlight_ranges?: unknown;
  highlights?: unknown;
};

type HighlightRange = { start?: unknown; end?: unknown };

function renderHighlightedHanzi(text: string, ranges: HighlightRange[]): React.ReactNode {
  if (ranges.length === 0) return text;
  const cleaned = ranges
    .map((range) => ({
      start: typeof range.start === "number" ? range.start : -1,
      end: typeof range.end === "number" ? range.end : -1,
    }))
    .filter((range) => range.start >= 0 && range.end > range.start && range.end <= text.length)
    .sort((a, b) => a.start - b.start);
  if (cleaned.length === 0) return text;
  const out: React.ReactNode[] = [];
  let cursor = 0;
  cleaned.forEach((range, index) => {
    if (range.start > cursor) out.push(text.slice(cursor, range.start));
    out.push(
      <mark
        key={`hl-${index}`}
        className="rounded-[4px] bg-[#fff1b8] px-[2px] py-[1px] text-[#1b1b1b]"
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function ExamplesBlock({ content }: { content: AnyRecord }) {
  const items = asArray<ExampleEntry>(content.items ?? content.examples);
  const cleanItems = items
    .map((item) => ({
      hanzi: asString(item.hanzi),
      pinyin: asString(item.pinyin),
      translation:
        asString(item.translation_ru) || asString(item.ru) || asString(item.translation),
      literal: asString(item.literal),
      termSlug: asString(item.term_slug) || asString(item.termSlug),
      audioUrl: asString(item.audio_url) || asString(item.audioUrl),
      highlights: asArray<HighlightRange>(item.highlight_ranges ?? item.highlights),
    }))
    .filter((item) => item.hanzi.length > 0);
  if (cleanItems.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-[#6b6b6b]">Примеры</h3>
      <ol className="space-y-3" role="list">
        {cleanItems.map((item, index) => (
          <li
            key={index}
            className="content-surface-card flex min-w-0 items-start justify-between gap-3 rounded-[var(--radius-card-md)] bg-white px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[1.45rem] font-medium leading-[1.3] text-[#1b1b1b] sm:text-[1.55rem]">
                {renderHighlightedHanzi(item.hanzi, item.highlights)}
              </p>
              {item.pinyin ? (
                <p className="mt-1.5 text-sm italic text-[#5a5a5a]">{item.pinyin}</p>
              ) : null}
              {item.translation ? (
                <p className="mt-2 text-[15px] leading-[1.55] text-[#3a3a3a]">{item.translation}</p>
              ) : null}
              {item.literal ? (
                <p className="mt-1 text-[13px] leading-[1.5] text-[#6b6b6b]">
                  Дословно: {item.literal}
                </p>
              ) : null}
              {item.termSlug ? (
                <Link
                  href={`/dictionary/word/${item.termSlug}`}
                  className="mt-3 inline-flex text-xs font-medium text-[#262626] underline-offset-4 hover:underline"
                >
                  Открыть слово в словаре →
                </Link>
              ) : null}
            </div>
            {item.audioUrl ? (
              <AudioButton
                src={item.audioUrl}
                ariaLabel="Прослушать пример"
                size="md"
                variant="primary"
                className="mt-1 shrink-0"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------- Related ----------
function RelatedBlock({ content }: { content: AnyRecord }) {
  const label = asString(content.label_ru) || asString(content.label) || "Изучить дальше";
  const linksRaw = asArray<AnyRecord>(content.items ?? content.links);
  const links = linksRaw.flatMap((link) => {
    const title = asString(link.title);
    const href =
      asString(link.href) ||
      (asString(link.slug) ? `/grammar/${asString(link.slug)}` : "");
    if (!title) return [];
    return [{ title, href }];
  });
  if (links.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-[#6b6b6b]">{label}</h3>
      <ul className="flex flex-wrap gap-2">
        {links.map((link, index) =>
          link.href ? (
            <li key={index}>
              <Link
                href={link.href}
                className="inline-flex items-center rounded-[14px] bg-white px-4 py-2.5 text-[15px] font-medium text-[#1b1b1b] ring-1 ring-black/[0.06] transition-colors hover:bg-[#f6f3eb]"
              >
                {link.title}
              </Link>
            </li>
          ) : (
            <li key={index}>
              <span className="inline-flex items-center rounded-[14px] bg-white px-4 py-2.5 text-[15px] font-medium text-[#1b1b1b] ring-1 ring-black/[0.06]">
                {link.title}
              </span>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

// ---------- Vocabulary links ----------
type VocabLinkEntry = {
  slug?: unknown;
  term_slug?: unknown;
  label?: unknown;
  hanzi?: unknown;
  display?: unknown;
  pinyin?: unknown;
  translation_ru?: unknown;
  ru?: unknown;
  meaning?: unknown;
};

function VocabularyLinksBlock({ content }: { content: AnyRecord }) {
  const termsRaw = asArray<VocabLinkEntry>(content.terms ?? content.items ?? content.links);
  const items = termsRaw.flatMap((entry) => {
    const slug = asString(entry.slug) || asString(entry.term_slug);
    const display =
      asString(entry.label) || asString(entry.hanzi) || asString(entry.display);
    if (!slug || !display) return [];
    return [
      {
        slug,
        display,
        pinyin: asString(entry.pinyin),
        translation:
          asString(entry.translation_ru) || asString(entry.ru) || asString(entry.meaning),
      },
    ];
  });
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-[#6b6b6b]">Слова из словаря</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/dictionary/word/${item.slug}`}
              className="flex items-baseline gap-3 rounded-[var(--radius-card-md)] border border-[#e8e3da] bg-white px-4 py-3 transition-colors hover:border-[#d8c79a]"
            >
              <span className="text-[1.2rem] font-medium leading-none text-[#1b1b1b]">
                {item.display}
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                {item.pinyin ? (
                  <span className="text-xs italic text-[#5a5a5a]">{item.pinyin}</span>
                ) : null}
                {item.translation ? (
                  <span className="truncate text-[13px] text-[#3a3a3a]">{item.translation}</span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
