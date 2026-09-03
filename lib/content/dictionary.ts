import "server-only";
import { getPublicSupabaseClient } from "@/lib/supabase/public-content";
import { fetchAudioUrls } from "@/lib/content/audio";
import { getPublicContentSnapshot } from "@/lib/content/public-snapshot";
import {
  escapeForPostgrestOr,
  normalizeQuery,
  type NormalizedQuery,
} from "@/lib/content/pinyin";
import type {
  DictionarySearchHit,
  DictionarySearchMatch,
  DictionarySearchResult,
  HskDeckSummary,
  HskVersionId,
  HskVersionSummary,
  WordCard,
  WordDetail,
} from "@/lib/content/types";

type DeckRow = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  hsk_version: string | null;
  hsk_level: string | null;
  display_count: number | null;
  imported_count: number | null;
  kind: string;
  source_type: string | null;
  source_label: string | null;
};

type DeckItemRow = {
  deck_id: string;
  term_id: string;
  order_index: number;
};

type TermRow = {
  id: string;
  slug: string;
  simplified: string;
  traditional: string | null;
  default_display: string;
  base_translation_ru: string | null;
  base_translation_en: string | null;
  frequency_rank: number | null;
  part_of_speech: string | null;
  metadata: Record<string, unknown> | null;
};

type PronunciationRow = {
  term_id: string;
  pinyin_display: string;
  pinyin_normalized: string;
  is_primary: boolean;
  order_index: number;
};

type SenseRow = {
  term_id: string;
  locale: string;
  definition: string;
  order_index: number;
};

type ExampleRow = {
  id?: string;
  term_id: string | null;
  hanzi: string;
  pinyin: string | null;
  translation_ru: string | null;
  order_index: number;
};

const META_VOCABULARY_EXAMPLE_PATTERNS = [
  /这个词/u,
  /(?:сегодня\s+)?мы\s+(?:выучили|изучаем|изучили|учим)\s+слово/ui,
];

/**
 * Rejects meta-learning placeholders such as “Сегодня мы выучили слово …”.
 * Dictionary examples must demonstrate the term in a real utterance instead
 * of merely naming it as the object of a lesson.
 */
export function isUsefulVocabularyExample(
  row: Pick<ExampleRow, "hanzi" | "translation_ru">,
): boolean {
  const text = `${row.hanzi ?? ""}\n${row.translation_ru ?? ""}`;
  return !META_VOCABULARY_EXAMPLE_PATTERNS.some((pattern) => pattern.test(text));
}

type CharacterRow = {
  id?: string;
  hanzi: string;
};

type AudioRow = {
  owner_id: string;
  owner_type: string;
  public_url: string | null;
};

type StrokeRow = {
  character_id: string;
  strokes: unknown;
  medians: unknown;
  raw_svg: string | null;
  viewport_width: number;
  viewport_height: number;
};

function isPublicTerm(row: Pick<TermRow, "metadata">): boolean {
  return row.metadata?.source !== "chinachild-demo";
}

// ---- Deck-only snapshot (cheap; loaded on dictionary hub pages) ----

async function loadDecks(): Promise<DeckRow[]> {
  const snapshot = await getPublicContentSnapshot();
  return snapshot.tables.vocabDecks as DeckRow[];
}

const getCachedDecks = loadDecks;

function normalizeHskVersionRaw(value: string | null): HskVersionId | null {
  if (!value) return null;
  if (value === "3.0" || value === "new-hsk" || value === "new_hsk") return "3.0";
  if (value === "2.0" || value === "hsk-2-0" || value === "hsk") return "2.0";
  return null;
}

function mapDeck(row: DeckRow): HskDeckSummary | null {
  const version = normalizeHskVersionRaw(row.hsk_version);
  if (!version || !row.hsk_level || !row.slug) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    hskVersion: version,
    hskLevel: row.hsk_level,
    displayCount: row.display_count,
    importedCount: row.imported_count,
    description: row.description,
  };
}

const HSK_LEVEL_ORDER_NEW = ["1", "2", "3", "4", "5", "6", "7-9"];
const HSK_LEVEL_ORDER_LEGACY = ["1", "2", "3", "4", "5", "6"];

function sortDecks(version: HskVersionId, decks: HskDeckSummary[]): HskDeckSummary[] {
  const order = version === "3.0" ? HSK_LEVEL_ORDER_NEW : HSK_LEVEL_ORDER_LEGACY;
  const index = new Map(order.map((level, i) => [level, i]));
  return [...decks].sort((a, b) => {
    const ai = index.get(a.hskLevel) ?? 99;
    const bi = index.get(b.hskLevel) ?? 99;
    return ai - bi;
  });
}

export async function getPublicHskVersions(): Promise<HskVersionSummary[]> {
  const rows = await getCachedDecks();
  const decks = rows.map(mapDeck).filter((d): d is HskDeckSummary => Boolean(d));
  const groups: Record<HskVersionId, HskDeckSummary[]> = { "3.0": [], "2.0": [] };
  for (const deck of decks) groups[deck.hskVersion].push(deck);

  const summaries: HskVersionSummary[] = [];
  for (const versionId of ["3.0", "2.0"] as const) {
    const groupDecks = sortDecks(versionId, groups[versionId]);
    const totalPlanned = groupDecks.reduce((sum, d) => sum + (d.displayCount ?? 0), 0);
    const totalImported = groupDecks.reduce((sum, d) => sum + (d.importedCount ?? 0), 0);
    summaries.push({
      id: versionId,
      label: versionId === "3.0" ? "Новый HSK 3.0" : "HSK 2.0",
      description:
        versionId === "3.0"
          ? "Обновлённая шкала HSK 3.0 с уровнями 1–6 и продвинутым 7–9."
          : "Классическая шкала HSK 2.0 с уровнями 1–6.",
      totalPlanned,
      totalImported,
      decks: groupDecks,
    });
  }
  return summaries;
}

export async function getPublicHskLevels(version: HskVersionId): Promise<HskDeckSummary[]> {
  const rows = await getCachedDecks();
  const decks = rows
    .map(mapDeck)
    .filter((d): d is HskDeckSummary => d !== null && d.hskVersion === version);
  return sortDecks(version, decks);
}

export async function getPublicHskDeck(
  version: HskVersionId,
  level: string,
): Promise<HskDeckSummary | null> {
  const rows = await getCachedDecks();
  return (
    rows
      .map(mapDeck)
      .find(
        (d): d is HskDeckSummary =>
          d !== null && d.hskVersion === version && d.hskLevel === level,
      ) ?? null
  );
}

export function isIndexableHskDeck(
  deck: Pick<HskDeckSummary, "importedCount">,
): boolean {
  return (deck.importedCount ?? 0) > 0;
}

// ---- Level term listing ----

export type HskLevelTermsOptions = {
  query?: string;
  limit?: number;
};

export type HskLevelTerms = {
  deck: HskDeckSummary;
  terms: WordCard[];
  totalImported: number;
};

export async function getPublicHskLevelTerms(
  version: HskVersionId,
  level: string,
  options: HskLevelTermsOptions = {},
): Promise<HskLevelTerms | null> {
  const deck = await getPublicHskDeck(version, level);
  if (!deck) return null;
  const snapshot = await getPublicContentSnapshot();
  const limit = Math.max(1, Math.min(options.limit ?? 2000, 2000));
  const itemRows = (snapshot.tables.vocabDeckItems as DeckItemRow[])
    .filter((row) => row.deck_id === deck.id)
    .sort((a, b) => a.order_index - b.order_index)
    .slice(0, limit);
  if (itemRows.length === 0) return { deck, terms: [], totalImported: 0 };

  const termIds = new Set(itemRows.map((row) => row.term_id));
  const termRows = (snapshot.tables.vocabTerms as TermRow[]).filter((row) => termIds.has(row.id));
  const pronunciations = (snapshot.tables.vocabPronunciations as PronunciationRow[])
    .filter((row) => termIds.has(row.term_id));
  const senses = (snapshot.tables.vocabSenses as SenseRow[])
    .filter((row) => termIds.has(row.term_id));
  const termAudioMap = new Map(
    (snapshot.tables.vocabAudioAssets as AudioRow[])
      .filter((row) => row.owner_type === "term" && termIds.has(row.owner_id) && row.public_url)
      .map((row) => [row.owner_id, row.public_url as string]),
  );

  const termById = new Map(termRows.map((t) => [t.id, t]));
  const primaryPronByTermId = new Map<string, PronunciationRow>();
  for (const p of pronunciations) {
    const existing = primaryPronByTermId.get(p.term_id);
    if (!existing || (p.is_primary && !existing.is_primary) || p.order_index < existing.order_index) {
      primaryPronByTermId.set(p.term_id, p);
    }
  }
  const primarySenseByTermId = new Map<string, SenseRow>();
  for (const s of senses) {
    if (s.locale !== "ru") continue;
    const existing = primarySenseByTermId.get(s.term_id);
    if (!existing || s.order_index < existing.order_index) {
      primarySenseByTermId.set(s.term_id, s);
    }
  }

  const query = options.query?.trim().toLowerCase() ?? "";

  const wordCards: WordCard[] = itemRows
    .flatMap((row) => {
      const term = termById.get(row.term_id);
      if (!term) return [];
      const pron = primaryPronByTermId.get(term.id);
      const sense = primarySenseByTermId.get(term.id);
      const card: WordCard = {
        id: term.id,
        slug: term.slug,
        simplified: term.simplified,
        traditional: term.traditional,
        defaultDisplay: term.default_display,
        baseTranslationRu: term.base_translation_ru ?? sense?.definition ?? null,
        frequencyRank: term.frequency_rank,
        primaryPinyin: pron?.pinyin_display ?? null,
        primarySense: sense?.definition ?? term.base_translation_ru ?? null,
        audioUrl: termAudioMap.get(term.id) ?? null,
      };
      if (query) {
        const haystack = [
          card.simplified,
          card.traditional ?? "",
          card.defaultDisplay,
          card.primaryPinyin ?? "",
          card.baseTranslationRu ?? "",
          card.primarySense ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return [];
      }
      return [card];
    });

  return { deck, terms: wordCards, totalImported: termRows.length };
}

// ---- Single word detail ----

export async function getPublicWordSlugs(): Promise<string[]> {
  const snapshot = await getPublicContentSnapshot();
  return (snapshot.tables.vocabTerms as TermRow[]).map((row) => row.slug);
}

export async function getPopularWordSlugs(limit = 200): Promise<string[]> {
  const snapshot = await getPublicContentSnapshot();
  return [...(snapshot.tables.vocabTerms as TermRow[])]
    .sort((a, b) => (a.frequency_rank ?? Number.MAX_SAFE_INTEGER) - (b.frequency_rank ?? Number.MAX_SAFE_INTEGER))
    .slice(0, limit)
    .map((row) => row.slug);
}

export async function getPublicWordBySlug(slug: string): Promise<WordDetail | null> {
  const snapshot = await getPublicContentSnapshot();
  const term = (snapshot.tables.vocabTerms as TermRow[]).find((row) => row.slug === slug);
  if (!term) return null;
  const pronunciations = (snapshot.tables.vocabPronunciations as PronunciationRow[])
    .filter((row) => row.term_id === term.id)
    .sort((a, b) => a.order_index - b.order_index)
    .map((p) => ({
    pinyinDisplay: p.pinyin_display,
    pinyinNormalized: p.pinyin_normalized,
    isPrimary: p.is_primary,
  }));
  const senses = (snapshot.tables.vocabSenses as SenseRow[])
    .filter((s) => s.term_id === term.id && s.locale === "ru")
    .sort((a, b) => a.order_index - b.order_index)
    .map((s) => ({ definition: s.definition, locale: s.locale, orderIndex: s.order_index }));
  const exampleRows = (snapshot.tables.vocabExamples as ExampleRow[])
    .filter((row) => row.term_id === term.id && isUsefulVocabularyExample(row))
    .sort((a, b) => a.order_index - b.order_index);
  const audioRows = snapshot.tables.vocabAudioAssets as AudioRow[];
  const termAudio = audioRows.find(
    (row) => row.owner_type === "term" && row.owner_id === term.id,
  )?.public_url ?? null;
  const exampleAudioMap = new Map(
    audioRows
      .filter((row) => row.owner_type === "example" && row.public_url)
      .map((row) => [row.owner_id, row.public_url as string]),
  );
  const examples = exampleRows.map((e) => ({
    id: e.id ?? null,
    hanzi: e.hanzi,
    pinyin: e.pinyin,
    translationRu: e.translation_ru,
    orderIndex: e.order_index,
    audioUrl: e.id ? exampleAudioMap.get(e.id) ?? null : null,
  }));

  const deckIds = new Set(
    (snapshot.tables.vocabDeckItems as DeckItemRow[])
      .filter((row) => row.term_id === term.id)
      .map((row) => row.deck_id),
  );
  const hskBadges: WordDetail["hskBadges"] =
    (snapshot.tables.vocabDecks as DeckRow[])
      .filter((row) => deckIds.has(row.id))
      .map((row) => {
        const version = normalizeHskVersionRaw(row.hsk_version);
        if (!version || !row.hsk_level || !row.slug) return null;
        return { version, level: row.hsk_level, deckSlug: row.slug };
      })
      .filter((b): b is { version: HskVersionId; level: string; deckSlug: string } => Boolean(b));

  // Stroke data for each unique hanzi in the simplified form. Include every
  // character so the public page can render a clean static fallback when the
  // stored Hanzi Writer JSON is not available yet.
  const characters: WordDetail["characters"] = [];
  const uniqueHanzi = Array.from(new Set(Array.from(term.simplified)));
  if (uniqueHanzi.length > 0) {
    const charRows = (snapshot.tables.vocabCharacters as CharacterRow[])
      .filter((row) => uniqueHanzi.includes(row.hanzi));
    const strokesByCharId = new Map(
      (snapshot.tables.characterStrokeAssets as StrokeRow[])
        .map((row) => [row.character_id, row]),
    );
    for (const hanzi of uniqueHanzi) {
      const charRow = charRows.find((c) => c.hanzi === hanzi);
      const stroke = charRow?.id ? strokesByCharId.get(charRow.id) : undefined;
      characters.push({
        hanzi,
        strokes: stroke?.strokes ?? null,
        medians: stroke?.medians ?? null,
        rawSvg: stroke?.raw_svg ?? null,
        viewportWidth: stroke?.viewport_width ?? null,
        viewportHeight: stroke?.viewport_height ?? null,
      });
    }
  }

  return {
    id: term.id,
    slug: term.slug,
    simplified: term.simplified,
    traditional: term.traditional,
    defaultDisplay: term.default_display,
    baseTranslationRu: term.base_translation_ru ?? senses[0]?.definition ?? null,
    frequencyRank: term.frequency_rank,
    primaryPinyin: pronunciations.find((p) => p.isPrimary)?.pinyinDisplay ?? pronunciations[0]?.pinyinDisplay ?? null,
    primarySense: senses[0]?.definition ?? null,
    audioUrl: termAudio,
    pronunciations,
    senses,
    examples,
    hskBadges,
    characters,
  };
}

export async function getPublicDictionaryHomeData(): Promise<{
  versions: HskVersionSummary[];
}> {
  const versions = await getPublicHskVersions();
  return { versions };
}

// ---- Global dictionary search ----
//
// Mirrors the platform's authenticated `searchVocabulary` (see
// chinachild-sandbox/lib/vocabulary/server.ts) but uses the anon Supabase
// client, so search is fully server-rendered and works for unauthenticated
// SEO traffic. Searches hanzi, pinyin (tone marks + tones-off + tone numbers),
// Russian + English meanings, and sense definitions.

const DEFAULT_SEARCH_LIMIT = 24;
const MAX_SEARCH_LIMIT = 50;

export async function searchPublicDictionary(
  rawQuery: string,
  limit = DEFAULT_SEARCH_LIMIT,
): Promise<DictionarySearchResult> {
  const cleanLimit = Math.max(1, Math.min(limit, MAX_SEARCH_LIMIT));
  const trimmedQuery = rawQuery.trim();
  const emptyResult: DictionarySearchResult = {
    query: trimmedQuery,
    hits: [],
    total: 0,
    limit: cleanLimit,
    hasHanzi: false,
  };
  if (trimmedQuery.length === 0) return emptyResult;

  const supabase = getPublicSupabaseClient();
  if (!supabase) return emptyResult;

  const normalized = normalizeQuery(trimmedQuery);
  const text = escapeForPostgrestOr(normalized.normalized);
  const toneNumbers = escapeForPostgrestOr(normalized.pinyinToneNumbers);
  const noTone = escapeForPostgrestOr(normalized.pinyinNoTone);
  if (!text && !toneNumbers && !noTone) {
    return { ...emptyResult, hasHanzi: normalized.hasHanzi };
  }

  const matchedTermIds = new Map<string, DictionarySearchMatch>();

  // 1) Direct term fields — hanzi, default_display, Russian + English meanings.
  if (text) {
    const filters = [
      `simplified.ilike.%${text}%`,
      `traditional.ilike.%${text}%`,
      `default_display.ilike.%${text}%`,
      `search_hanzi.ilike.%${text}%`,
      `base_translation_ru.ilike.%${text}%`,
      `base_translation_en.ilike.%${text}%`,
    ].join(",");
    const { data, error } = await supabase
      .from("vocab_terms")
      .select("id, metadata")
      .or(filters)
      .limit(cleanLimit);
    if (!error && data) {
      for (const row of (data as Array<Pick<TermRow, "id" | "metadata">>).filter(isPublicTerm)) {
        matchedTermIds.set(row.id, normalized.hasHanzi ? "hanzi" : "meaning");
      }
    }
  }

  // 2) Pinyin (tone marks, no tones, tone numbers).
  if (text || toneNumbers || noTone) {
    const pronFilters = [
      text && `pinyin_display.ilike.%${text}%`,
      toneNumbers && `pinyin_display.ilike.%${toneNumbers}%`,
      toneNumbers && `tone_numbers.ilike.%${toneNumbers}%`,
      noTone && `pinyin_normalized.ilike.%${noTone}%`,
    ].filter(Boolean).join(",");
    if (pronFilters.length > 0) {
      const { data, error } = await supabase
        .from("vocab_pronunciations")
        .select("term_id")
        .or(pronFilters)
        .limit(cleanLimit);
      if (!error && data) {
        for (const row of data as Array<{ term_id: string }>) {
          if (!matchedTermIds.has(row.term_id)) matchedTermIds.set(row.term_id, "pinyin");
        }
      }
    }
  }

  // 3) Sense definitions (Russian) — only for non-hanzi queries.
  if (text && !normalized.hasHanzi) {
    const { data, error } = await supabase
      .from("vocab_senses")
      .select("term_id")
      .ilike("definition", `%${text}%`)
      .limit(cleanLimit);
    if (!error && data) {
      for (const row of data as Array<{ term_id: string }>) {
        if (!matchedTermIds.has(row.term_id)) matchedTermIds.set(row.term_id, "sense");
      }
    }
  }

  const termIds = [...matchedTermIds.keys()].slice(0, cleanLimit);
  if (termIds.length === 0) {
    return { ...emptyResult, hasHanzi: normalized.hasHanzi };
  }

  const [termsRes, pronRes, sensesRes, badgesRes, termAudioMap] = await Promise.all([
    supabase
      .from("vocab_terms")
      .select(
        "id, slug, simplified, traditional, default_display, base_translation_ru, base_translation_en, frequency_rank, part_of_speech, metadata",
      )
      .in("id", termIds),
    supabase
      .from("vocab_pronunciations")
      .select("term_id, pinyin_display, pinyin_normalized, is_primary, order_index")
      .in("term_id", termIds),
    supabase
      .from("vocab_senses")
      .select("term_id, locale, definition, order_index")
      .in("term_id", termIds)
      .eq("locale", "ru"),
    fetchHskBadgesForTerms(termIds, normalized),
    fetchAudioUrls("term", termIds),
  ]);

  const termsRawUnfiltered = (termsRes.data ?? []) as Array<{
    id: string;
    slug: string;
    simplified: string;
    traditional: string | null;
    default_display: string;
    base_translation_ru: string | null;
    base_translation_en: string | null;
    frequency_rank: number | null;
    part_of_speech: string | null;
    metadata: Record<string, unknown> | null;
  }>;
  const termsRaw = termsRawUnfiltered.filter(isPublicTerm);
  const termById = new Map(termsRaw.map((t) => [t.id, t]));
  const primaryPron = new Map<string, { pinyin_display: string; is_primary: boolean; order_index: number }>();
  for (const p of (pronRes.data ?? []) as Array<{
    term_id: string;
    pinyin_display: string;
    pinyin_normalized: string;
    is_primary: boolean;
    order_index: number;
  }>) {
    const existing = primaryPron.get(p.term_id);
    if (!existing || (p.is_primary && !existing.is_primary) || p.order_index < existing.order_index) {
      primaryPron.set(p.term_id, p);
    }
  }
  const primarySense = new Map<string, { definition: string; order_index: number }>();
  for (const s of (sensesRes.data ?? []) as Array<{
    term_id: string;
    locale: string;
    definition: string;
    order_index: number;
  }>) {
    const existing = primarySense.get(s.term_id);
    if (!existing || s.order_index < existing.order_index) {
      primarySense.set(s.term_id, s);
    }
  }

  const hits: DictionarySearchHit[] = termIds.flatMap((id) => {
    const term = termById.get(id);
    if (!term) return [];
    const pron = primaryPron.get(id);
    const sense = primarySense.get(id);
    return [
      {
        id: term.id,
        slug: term.slug,
        simplified: term.simplified,
        traditional: term.traditional,
        defaultDisplay: term.default_display,
        baseTranslationRu: term.base_translation_ru ?? sense?.definition ?? null,
        frequencyRank: term.frequency_rank,
        primaryPinyin: pron?.pinyin_display ?? null,
        primarySense: sense?.definition ?? term.base_translation_ru ?? null,
        audioUrl: termAudioMap.get(id) ?? null,
        matchedBy: matchedTermIds.get(id) ?? "meaning",
        hskBadges: badgesRes.get(id) ?? [],
      },
    ];
  });

  return {
    query: trimmedQuery,
    hits,
    total: hits.length,
    limit: cleanLimit,
    hasHanzi: normalized.hasHanzi,
  };
}

async function fetchHskBadgesForTerms(
  termIds: string[],
  _normalized: NormalizedQuery,
): Promise<Map<string, Array<{ version: HskVersionId; level: string }>>> {
  const supabase = getPublicSupabaseClient();
  const result = new Map<string, Array<{ version: HskVersionId; level: string }>>();
  if (!supabase || termIds.length === 0) return result;

  const { data: items, error: itemsError } = await supabase
    .from("vocab_deck_items")
    .select("deck_id, term_id")
    .in("term_id", termIds);
  if (itemsError || !items || items.length === 0) return result;

  const deckIds = [...new Set((items as Array<{ deck_id: string; term_id: string }>).map((i) => i.deck_id))];
  const { data: decks, error: decksError } = await supabase
    .from("vocab_decks")
    .select("id, hsk_version, hsk_level, kind")
    .in("id", deckIds)
    .in("kind", ["system", "imported"]);
  if (decksError || !decks) return result;

  const versionByDeck = new Map<string, { version: HskVersionId; level: string }>();
  for (const deck of decks as Array<{ id: string; hsk_version: string | null; hsk_level: string | null }>) {
    const version = normalizeHskVersionRaw(deck.hsk_version);
    if (!version || !deck.hsk_level) continue;
    versionByDeck.set(deck.id, { version, level: deck.hsk_level });
  }

  for (const item of items as Array<{ deck_id: string; term_id: string }>) {
    const badge = versionByDeck.get(item.deck_id);
    if (!badge) continue;
    const list = result.get(item.term_id) ?? [];
    if (!list.some((b) => b.version === badge.version && b.level === badge.level)) {
      list.push(badge);
    }
    result.set(item.term_id, list);
  }
  return result;
}
