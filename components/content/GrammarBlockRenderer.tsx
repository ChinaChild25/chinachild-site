import Link from "next/link";
import type { GrammarBlock } from "@/lib/content/types";

// Renders grammar_blocks rows. The `content` jsonb shape is the same one used
// by the platform's renderer; we read defensively because authors / fixtures
// may use slightly different keys.

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

export default function GrammarBlockRenderer({ blocks }: { blocks: GrammarBlock[] }) {
  if (blocks.length === 0) {
    return (
      <p className="text-sm text-[#9a9a9a]">
        Подробная разметка статьи пока не загружена. Полная версия доступна в учебной платформе.
      </p>
    );
  }
  return (
    <div className="prose-article mx-auto max-w-3xl space-y-6">
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

function HeadingBlock({ content }: { content: AnyRecord }) {
  const text = asString(content.text) || asString(content.title);
  const levelRaw = content.level;
  const level =
    typeof levelRaw === "number" && Number.isFinite(levelRaw)
      ? Math.min(6, Math.max(2, Math.trunc(levelRaw)))
      : 2;
  if (!text) return null;
  const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
  return <Tag className="font-medium tracking-[-0.01em] text-[#1b1b1b]">{text}</Tag>;
}

function ParagraphBlock({ content }: { content: AnyRecord }) {
  const text = asString(content.text) || asString(content.body);
  if (!text) return null;
  return <p>{text}</p>;
}

function ListBlock({ content }: { content: AnyRecord }) {
  const items = asArray<unknown>(content.items).map((item) => asString(item));
  const ordered = content.style === "ordered" || content.ordered === true;
  if (items.length === 0) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={ordered ? "list-decimal pl-6" : "list-disc pl-6"}>
      {items.map((item, index) => (
        <li key={index} className="my-1.5">
          {item}
        </li>
      ))}
    </Tag>
  );
}

function SchemeBlock({ content }: { content: AnyRecord }) {
  const slots = asArray<unknown>(content.slots).map((slot) => asRecord(slot));
  const caption = asString(content.caption);
  if (slots.length === 0) return null;
  return (
    <figure className="card-block card-cream-soft">
      <div className="flex flex-wrap items-center gap-2">
        {slots.map((slot, index) => (
          <span key={index} className="tag-pill bg-white">
            {asString(slot.label) || asString(slot.text)}
          </span>
        ))}
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm text-[#4b4b4b]">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

function FormulaBlock({ content }: { content: AnyRecord }) {
  const formula = asString(content.formula) || asString(content.text);
  const note = asString(content.note);
  if (!formula) return null;
  return (
    <figure className="card-block card-violet-soft">
      <p className="text-xl font-medium text-[#1b1b1b]">{formula}</p>
      {note ? <p className="mt-2 text-sm text-[#4b4b4b]">{note}</p> : null}
    </figure>
  );
}

function CalloutBlock({ content }: { content: AnyRecord }) {
  const tone = asString(content.tone) || "info";
  const title = asString(content.title);
  const text = asString(content.text) || asString(content.body);
  if (!text && !title) return null;
  const toneClass =
    tone === "warning" ? "card-peach-soft" : tone === "tip" ? "card-lime-soft" : "card-sky";
  return (
    <aside className={`card-block ${toneClass}`}>
      {title ? <p className="text-sm font-medium uppercase tracking-wide text-[#1b1b1b]">{title}</p> : null}
      {text ? <p className="mt-2 leading-7">{text}</p> : null}
    </aside>
  );
}

type ExampleEntry = {
  hanzi?: unknown;
  pinyin?: unknown;
  translation?: unknown;
  translation_ru?: unknown;
  ru?: unknown;
  term_slug?: unknown;
  termSlug?: unknown;
};

function ExamplesBlock({ content }: { content: AnyRecord }) {
  const items = asArray<ExampleEntry>(content.items ?? content.examples);
  if (items.length === 0) return null;
  return (
    <div className="card-block card-cream">
      <ol className="space-y-4">
        {items.map((item, index) => {
          const hanzi = asString(item.hanzi);
          const pinyin = asString(item.pinyin);
          const translation =
            asString(item.translation_ru) || asString(item.ru) || asString(item.translation);
          const termSlug = asString(item.term_slug) || asString(item.termSlug);
          return (
            <li key={index}>
              <p className="text-lg font-medium text-[#1b1b1b]">{hanzi}</p>
              {pinyin ? <p className="text-sm text-[#6b6b6b]">{pinyin}</p> : null}
              {translation ? (
                <p className="mt-1 text-sm leading-6 text-[#4b4b4b]">{translation}</p>
              ) : null}
              {termSlug ? (
                <Link
                  href={`/dictionary/word/${termSlug}`}
                  className="mt-2 inline-flex text-xs font-medium text-[#262626] underline-offset-4 hover:underline"
                >
                  Открыть слово в словаре →
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RelatedBlock({ content }: { content: AnyRecord }) {
  const links = asArray<AnyRecord>(content.links ?? content.items);
  if (links.length === 0) return null;
  return (
    <aside className="card-block card-sky">
      <h3 className="text-base font-medium text-[#1b1b1b]">Связанные статьи</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link, index) => {
          const slug = asString(link.slug);
          const title = asString(link.title);
          // Never surface a raw slug — skip the link if no human title is set.
          if (!slug || !title) return null;
          return (
            <li key={index}>
              <Link href={`/grammar/${slug}`} className="tag-pill bg-white hover:underline">
                {title}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function VocabularyLinksBlock({ content }: { content: AnyRecord }) {
  const links = asArray<AnyRecord>(content.links ?? content.items ?? content.terms);
  if (links.length === 0) return null;
  return (
    <aside className="card-block card-lime-soft">
      <h3 className="text-base font-medium text-[#1b1b1b]">Слова из словаря</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link, index) => {
          const slug = asString(link.slug) || asString(link.term_slug);
          // Prefer hanzi or human display label. Never surface the raw slug.
          const display =
            asString(link.display) || asString(link.hanzi) || asString(link.title);
          if (!slug || !display) return null;
          return (
            <li key={index}>
              <Link href={`/dictionary/word/${slug}`} className="tag-pill bg-white hover:underline">
                {display}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
