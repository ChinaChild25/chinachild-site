import type { HskVersionId } from "@/lib/content/types";

// Russian labels for tag groups — never expose raw slugs like "parts-of-speech".
export const TAG_GROUP_ORDER: ReadonlyArray<{ key: string; label: string }> = [
  { key: "hsk", label: "HSK" },
  { key: "new_hsk", label: "Новый HSK" },
  { key: "parts_of_speech", label: "Части речи" },
  { key: "sentence", label: "Предложение" },
  { key: "phrases", label: "Фразы" },
  { key: "other", label: "Другое" },
];

const TAG_GROUP_BY_KEY = new Map(TAG_GROUP_ORDER.map((g) => [g.key, g.label]));

export function normalizeTagGroupKey(groupKey: string | null | undefined): string {
  const value = (groupKey ?? "").toLowerCase().trim();
  if (value === "hsk" || value === "hsk-2-0" || value === "hsk_2_0" || value === "2.0") return "hsk";
  if (value === "new_hsk" || value === "new-hsk" || value === "newhsk" || value === "3.0") return "new_hsk";
  if (
    value === "parts_of_speech" ||
    value === "parts-of-speech" ||
    value === "partsofspeech" ||
    value === "particles"
  )
    return "parts_of_speech";
  if (value === "sentence" || value === "syntax") return "sentence";
  if (value === "phrases" || value === "phrase") return "phrases";
  return "other";
}

export function tagGroupLabel(groupKey: string | null | undefined): string {
  return TAG_GROUP_BY_KEY.get(normalizeTagGroupKey(groupKey)) ?? "Другое";
}

export function hskVersionLabel(version: HskVersionId | string | null | undefined): string {
  const v = (version ?? "").toString();
  if (v === "3.0" || v === "new-hsk" || v === "new_hsk") return "Новый HSK 3.0";
  if (v === "2.0" || v === "hsk-2-0" || v === "hsk") return "HSK 2.0";
  return "HSK";
}

export function hskVersionShortLabel(version: HskVersionId | string | null | undefined): string {
  const v = (version ?? "").toString();
  if (v === "3.0") return "Новый HSK";
  if (v === "2.0") return "HSK";
  return "HSK";
}

export function formatHskBadge(
  version: HskVersionId | string | null | undefined,
  level: string | null | undefined,
): string | null {
  if (!level) return null;
  const v = (version ?? "").toString();
  if (v === "3.0") return `Новый HSK ${level}`;
  if (v === "2.0") return `HSK ${level}`;
  return `HSK ${level}`;
}

export function normalizeHskVersionParam(value: string): HskVersionId | null {
  const v = value.toLowerCase();
  if (v === "new-hsk" || v === "new_hsk" || v === "3" || v === "3.0") return "3.0";
  if (v === "hsk" || v === "2" || v === "2.0") return "2.0";
  return null;
}

export function hskVersionSlug(version: HskVersionId): string {
  return version === "3.0" ? "new-hsk" : "hsk";
}

// Russian pluralization for word/article/term counts.
function pluralizeRu(
  count: number,
  forms: { one: string; few: string; many: string },
): string {
  const mod100 = Math.abs(count) % 100;
  const mod10 = mod100 % 10;
  if (mod100 >= 11 && mod100 <= 14) return forms.many;
  if (mod10 === 1) return forms.one;
  if (mod10 >= 2 && mod10 <= 4) return forms.few;
  return forms.many;
}

export function formatWordCountRu(count: number): string {
  const form = pluralizeRu(count, { one: "слово", few: "слова", many: "слов" });
  return `${count} ${form}`;
}

export function formatArticleCountRu(count: number): string {
  const form = pluralizeRu(count, {
    one: "статья",
    few: "статьи",
    many: "статей",
  });
  return `${count} ${form}`;
}

export function formatExampleCountRu(count: number): string {
  const form = pluralizeRu(count, {
    one: "пример",
    few: "примера",
    many: "примеров",
  });
  return `${count} ${form}`;
}
