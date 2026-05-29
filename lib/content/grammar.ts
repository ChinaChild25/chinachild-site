import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache as nextCache } from "next/cache";
import { getPublicSupabaseClient } from "@/lib/supabase/public-content";
import { fetchAudioUrls } from "@/lib/content/audio";
import {
  normalizeTagGroupKey,
  TAG_GROUP_ORDER,
} from "@/lib/content/labels";
import type {
  FeaturedGrammarTopic,
  GrammarArticleCard,
  GrammarArticleDetail,
  GrammarBlock,
  GrammarHomeData,
  GrammarSection,
  GrammarTag,
  GrammarTagGroup,
} from "@/lib/content/types";

// Featured topic specs — mirror chinachild-sandbox/lib/grammar/server.ts.
// The slugs list lets us resolve the canonical article even if the fixture
// uses an alternate naming convention.
const FEATURED_TOPIC_SPECS = [
  {
    key: "word-order",
    title: "Базовый порядок слов",
    description:
      "С чего начинается простое китайское предложение и почему порядок слов важнее окончаний.",
    chips: ["HSK 1", "старт"],
    slugs: ["basic-sentence-structure"],
    fallbackOrder: 1,
  },
  {
    key: "numbers",
    title: "Числа в китайском",
    description:
      "Как устроены базовые числа и какие закономерности помогают быстрее читать суммы, даты и адреса.",
    chips: ["HSK 1", "старт"],
    slugs: ["chinese-numbers", "cardinal-numerals", "numbers-in-chinese"],
    fallbackOrder: 2,
  },
  {
    key: "measure-words",
    title: "Счётные слова",
    description:
      "Зачем между числом и предметом появляется счётное слово и как не терять его в фразе.",
    chips: ["HSK 1", "схема"],
    slugs: ["measure-words"],
    fallbackOrder: 3,
  },
  {
    key: "negative-sentences",
    title: "Отрицательные предложения",
    description:
      "Когда использовать 不, а когда 没, и как отрицание меняет смысл всей фразы.",
    chips: ["HSK 1", "схема"],
    slugs: ["negative-sentences", "bu-mei-negative-sentences"],
    fallbackOrder: 4,
  },
  {
    key: "time",
    title: "Время в китайском",
    description:
      "Как говорить о времени, расписании и последовательности действий без лишних форм.",
    chips: ["HSK 1", "фразы"],
    slugs: ["telling-time", "time-in-chinese"],
    fallbackOrder: 5,
  },
  {
    key: "addressing-people",
    title: "Обращения к людям",
    description:
      "Как выбирать вежливые обращения и не путать учебную фразу с живым разговором.",
    chips: ["старт", "речь"],
    slugs: ["addressing-people", "how-to-address-people"],
    fallbackOrder: 6,
  },
] as const;

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  locale: string;
  status: string;
  difficulty_hsk_version: string | null;
  difficulty_hsk_level: string | null;
  metadata: Record<string, unknown> | null;
};

type BlockRow = {
  id: string;
  article_id: string;
  block_type: GrammarBlock["blockType"];
  content: unknown;
  order_index: number;
};

type TagRow = {
  id: string;
  slug: string;
  label_ru: string;
  label_en: string | null;
  group_key: string;
  order_index: number;
};

type SectionRow = {
  id: string;
  slug: string;
  title_ru: string;
  title_en: string | null;
  description_ru: string | null;
  description_en: string | null;
  section_type: string;
  group_key: string | null;
  order_index: number;
};

type ArticleTagRow = { article_id: string; tag_id: string };
type ArticleSectionRow = { article_id: string; section_id: string };
type VocabTermSlugRow = { slug: string };
type SupabaseErrorLike = { message: string };
type RangeQuery<T> = {
  range: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: SupabaseErrorLike | null }>;
};
type QueryResult<T> = { data: T | null; error: SupabaseErrorLike | null };

type GrammarSnapshot = {
  articles: ArticleRow[];
  tags: TagRow[];
  sections: SectionRow[];
  articleTags: ArticleTagRow[];
  articleSections: ArticleSectionRow[];
};

const EMPTY_SNAPSHOT: GrammarSnapshot = {
  articles: [],
  tags: [],
  sections: [],
  articleTags: [],
  articleSections: [],
};

const SUPABASE_PAGE_SIZE = 1000;

async function fetchAllRows<T>(
  label: string,
  makeQuery: () => RangeQuery<T>,
): Promise<QueryResult<T[]>> {
  const rows: T[] = [];
  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await makeQuery().range(from, to);
    if (error) {
      console.warn(`[public-content/grammar] ${label} supabase error:`, error.message);
      return { data: null, error };
    }
    const page = data ?? [];
    rows.push(...page);
    if (page.length < SUPABASE_PAGE_SIZE) {
      return { data: rows, error: null };
    }
  }
}

async function fetchKnownVocabSlugs(slugs: string[]): Promise<Set<string>> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return new Set();
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  if (uniqueSlugs.length === 0) return new Set();

  const rows: VocabTermSlugRow[] = [];
  const chunkSize = 100;
  for (let index = 0; index < uniqueSlugs.length; index += chunkSize) {
    const chunk = uniqueSlugs.slice(index, index + chunkSize);
    const { data, error } = await supabase.from("vocab_terms").select("slug").in("slug", chunk);
    if (error) {
      console.warn("[public-content/grammar] vocab_terms supabase error:", error.message);
      return new Set();
    }
    rows.push(...((data ?? []) as VocabTermSlugRow[]));
  }
  return new Set(rows.map((row) => row.slug));
}

async function loadSnapshot(): Promise<GrammarSnapshot> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return EMPTY_SNAPSHOT;

  const [
    articlesRes,
    tagsRes,
    sectionsRes,
    articleTagsRes,
    articleSectionsRes,
  ] = await Promise.all([
    fetchAllRows<ArticleRow>("grammar_articles", () =>
      supabase
        .from("grammar_articles")
        .select(
          "id, slug, title, summary, locale, status, difficulty_hsk_version, difficulty_hsk_level, metadata",
        )
        .eq("status", "published")
        .order("created_at", { ascending: true }),
    ),
    fetchAllRows<TagRow>("grammar_tags", () =>
      supabase
        .from("grammar_tags")
        .select("id, slug, label_ru, label_en, group_key, order_index")
        .order("group_key", { ascending: true })
        .order("order_index", { ascending: true }),
    ),
    fetchAllRows<SectionRow>("grammar_sections", () =>
      supabase
        .from("grammar_sections")
        .select(
          "id, slug, title_ru, title_en, description_ru, description_en, section_type, group_key, order_index",
        )
        .order("order_index", { ascending: true }),
    ),
    fetchAllRows<ArticleTagRow>("grammar_article_tags", () =>
      supabase.from("grammar_article_tags").select("article_id, tag_id"),
    ),
    fetchAllRows<ArticleSectionRow>("grammar_article_sections", () =>
      supabase.from("grammar_article_sections").select("article_id, section_id"),
    ),
  ]);

  for (const res of [
    articlesRes,
    tagsRes,
    sectionsRes,
    articleTagsRes,
    articleSectionsRes,
  ]) {
    if (res.error) {
      // RLS / network errors should not crash the public site — degrade gracefully.
      return EMPTY_SNAPSHOT;
    }
  }

  return {
    articles: (articlesRes.data ?? []) as ArticleRow[],
    tags: (tagsRes.data ?? []) as TagRow[],
    sections: (sectionsRes.data ?? []) as SectionRow[],
    articleTags: (articleTagsRes.data ?? []) as ArticleTagRow[],
    articleSections: (articleSectionsRes.data ?? []) as ArticleSectionRow[],
  };
}

// 5-minute server cache so revisited pages do not refetch on every nav.
const getCachedSnapshot = nextCache(loadSnapshot, ["public-grammar-snapshot-v2"], {
  revalidate: 300,
  tags: ["public-grammar"],
});

async function loadArticleBlocks(articleId: string): Promise<BlockRow[]> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return [];
  const res = await fetchAllRows<BlockRow>("grammar_blocks", () =>
    supabase
      .from("grammar_blocks")
      .select("id, article_id, block_type, content, order_index")
      .eq("article_id", articleId)
      .order("order_index", { ascending: true }),
  );
  return (res.data ?? []) as BlockRow[];
}

async function loadPublishedArticleBlocks(articleIds: string[]): Promise<BlockRow[]> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return [];
  const uniqueIds = Array.from(new Set(articleIds.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const blocks: BlockRow[] = [];
  const chunkSize = 100;
  for (let index = 0; index < uniqueIds.length; index += chunkSize) {
    const chunk = uniqueIds.slice(index, index + chunkSize);
    const res = await fetchAllRows<BlockRow>("grammar_blocks", () =>
      supabase
        .from("grammar_blocks")
        .select("id, article_id, block_type, content, order_index")
        .in("article_id", chunk)
        .order("article_id", { ascending: true })
        .order("order_index", { ascending: true }),
    );
    blocks.push(...((res.data ?? []) as BlockRow[]));
  }
  return blocks;
}

const getCachedArticleBlocks = nextCache(loadArticleBlocks, ["public-grammar-article-blocks-v1"], {
  revalidate: 300,
  tags: ["public-grammar"],
});

const getCachedPublishedArticleBlocks = nextCache(
  loadPublishedArticleBlocks,
  ["public-grammar-published-blocks-v1"],
  {
    revalidate: 300,
    tags: ["public-grammar"],
  },
);

function readMetadata(article: ArticleRow): Record<string, unknown> {
  if (!article.metadata || typeof article.metadata !== "object" || Array.isArray(article.metadata)) {
    return {};
  }
  return article.metadata;
}

function articlePriority(article: ArticleRow): number {
  const meta = readMetadata(article);
  const priority = meta.priority ?? meta.featured_order;
  return typeof priority === "number" && Number.isFinite(priority) ? priority : 999;
}

function isFeatured(article: ArticleRow): boolean {
  const meta = readMetadata(article);
  return meta.is_featured === true || typeof meta.featured_order === "number";
}

function tagsForArticle(snap: GrammarSnapshot, articleId: string): TagRow[] {
  const tagIds = snap.articleTags
    .filter((rel) => rel.article_id === articleId)
    .map((rel) => rel.tag_id);
  const byId = new Map(snap.tags.map((tag) => [tag.id, tag]));
  return tagIds.flatMap((id) => {
    const tag = byId.get(id);
    return tag ? [tag] : [];
  });
}

function sectionsForArticle(snap: GrammarSnapshot, articleId: string): SectionRow[] {
  const sectionIds = snap.articleSections
    .filter((rel) => rel.article_id === articleId)
    .map((rel) => rel.section_id);
  const byId = new Map(snap.sections.map((section) => [section.id, section]));
  return sectionIds.flatMap((id) => {
    const section = byId.get(id);
    return section ? [section] : [];
  });
}

function articleCountsByTagId(snap: GrammarSnapshot): Map<string, number> {
  const counts = new Map<string, number>();
  const publishedIds = new Set(snap.articles.map((a) => a.id));
  for (const rel of snap.articleTags) {
    if (!publishedIds.has(rel.article_id)) continue;
    counts.set(rel.tag_id, (counts.get(rel.tag_id) ?? 0) + 1);
  }
  return counts;
}

function articleCountsBySectionId(snap: GrammarSnapshot): Map<string, number> {
  const counts = new Map<string, number>();
  const publishedIds = new Set(snap.articles.map((a) => a.id));
  for (const rel of snap.articleSections) {
    if (!publishedIds.has(rel.article_id)) continue;
    counts.set(rel.section_id, (counts.get(rel.section_id) ?? 0) + 1);
  }
  return counts;
}

function mapTag(row: TagRow, counts: Map<string, number>): GrammarTag {
  return {
    id: row.id,
    slug: row.slug,
    labelRu: row.label_ru,
    labelEn: row.label_en,
    groupKey: row.group_key,
    orderIndex: row.order_index,
    articleCount: counts.get(row.id) ?? 0,
  };
}

function mapSection(row: SectionRow, counts: Map<string, number>): GrammarSection {
  return {
    id: row.id,
    slug: row.slug,
    titleRu: row.title_ru,
    titleEn: row.title_en,
    descriptionRu: row.description_ru,
    descriptionEn: row.description_en,
    sectionType: row.section_type,
    groupKey: row.group_key,
    orderIndex: row.order_index,
    articleCount: counts.get(row.id) ?? 0,
  };
}

function mapArticleCard(article: ArticleRow, snap: GrammarSnapshot): GrammarArticleCard {
  const tagCounts = articleCountsByTagId(snap);
  const sectionCounts = articleCountsBySectionId(snap);
  const meta = readMetadata(article);
  const featuredOrderRaw = meta.featured_order;
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    difficultyHskVersion: article.difficulty_hsk_version,
    difficultyHskLevel: article.difficulty_hsk_level,
    isFeatured: isFeatured(article),
    featuredOrder:
      typeof featuredOrderRaw === "number" && Number.isFinite(featuredOrderRaw)
        ? featuredOrderRaw
        : null,
    tags: tagsForArticle(snap, article.id).map((tag) => mapTag(tag, tagCounts)),
    sections: sectionsForArticle(snap, article.id).map((section) =>
      mapSection(section, sectionCounts),
    ),
  };
}

function sortArticlesForLibrary(articles: ArticleRow[]): ArticleRow[] {
  return [...articles].sort((a, b) => {
    const aFeatured = isFeatured(a);
    const bFeatured = isFeatured(b);
    if (aFeatured !== bFeatured) return Number(bFeatured) - Number(aFeatured);
    const priorityDiff = articlePriority(a) - articlePriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    const aLevel = Number.parseInt(a.difficulty_hsk_level ?? "", 10);
    const bLevel = Number.parseInt(b.difficulty_hsk_level ?? "", 10);
    if (Number.isFinite(aLevel) && Number.isFinite(bLevel) && aLevel !== bLevel) {
      return aLevel - bLevel;
    }
    return a.title.localeCompare(b.title, "ru");
  });
}

function groupTags(tags: GrammarTag[]): GrammarTagGroup[] {
  const buckets = new Map<string, GrammarTag[]>();
  for (const tag of tags) {
    const key = normalizeTagGroupKey(tag.groupKey);
    buckets.set(key, [...(buckets.get(key) ?? []), tag]);
  }
  return TAG_GROUP_ORDER.flatMap((group) => {
    const groupTags = buckets.get(group.key) ?? [];
    if (groupTags.length === 0) return [];
    return [
      {
        key: group.key,
        label: group.label,
        tags: groupTags.sort(
          (a, b) => a.orderIndex - b.orderIndex || a.labelRu.localeCompare(b.labelRu, "ru"),
        ),
      },
    ];
  });
}

function buildFeaturedTopics(snap: GrammarSnapshot): FeaturedGrammarTopic[] {
  const articleBySlug = new Map(snap.articles.map((a) => [a.slug, a]));
  return FEATURED_TOPIC_SPECS.map((spec) => {
    const article = spec.slugs.flatMap((slug) => {
      const row = articleBySlug.get(slug);
      return row ? [mapArticleCard(row, snap)] : [];
    })[0] ?? null;
    return {
      key: spec.key,
      title: spec.title,
      description: spec.description,
      chips: [...spec.chips],
      article,
    };
  });
}

export type GrammarHomeParams = {
  query?: string;
  tagSlugs?: string[];
  sectionSlugs?: string[];
  limit?: number;
};

function articleHaystack(snap: GrammarSnapshot, article: ArticleRow): string {
  const tags = tagsForArticle(snap, article.id);
  const sections = sectionsForArticle(snap, article.id);
  return [
    article.title,
    article.summary ?? "",
    article.difficulty_hsk_version ?? "",
    article.difficulty_hsk_level ?? "",
    ...tags.flatMap((t) => [t.label_ru, t.label_en ?? "", t.slug]),
    ...sections.flatMap((s) => [s.title_ru, s.title_en ?? "", s.slug]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export async function getPublicGrammarHomeData(
  params: GrammarHomeParams = {},
): Promise<GrammarHomeData> {
  const snap = await getCachedSnapshot();
  const limit = Math.max(1, Math.min(params.limit ?? 21, 105));
  const tagSlugs = new Set(params.tagSlugs?.filter(Boolean) ?? []);
  const sectionSlugs = new Set(params.sectionSlugs?.filter(Boolean) ?? []);
  const query = params.query?.trim().toLowerCase() ?? "";

  const filtered = sortArticlesForLibrary(snap.articles).filter((article) => {
    if (query && !articleHaystack(snap, article).includes(query)) return false;
    if (tagSlugs.size > 0) {
      const articleTagSlugs = new Set(tagsForArticle(snap, article.id).map((t) => t.slug));
      if (![...tagSlugs].some((slug) => articleTagSlugs.has(slug))) return false;
    }
    if (sectionSlugs.size > 0) {
      const articleSectionSlugs = new Set(
        sectionsForArticle(snap, article.id).map((s) => s.slug),
      );
      if (![...sectionSlugs].every((slug) => articleSectionSlugs.has(slug))) return false;
    }
    return true;
  });

  const tagCounts = articleCountsByTagId(snap);
  const sectionCounts = articleCountsBySectionId(snap);

  return {
    featuredTopics: buildFeaturedTopics(snap),
    filters: groupTags(snap.tags.map((tag) => mapTag(tag, tagCounts)).filter((tag) => tag.articleCount > 0)),
    articles: filtered.slice(0, limit).map((article) => mapArticleCard(article, snap)),
    sections: snap.sections
      .map((section) => mapSection(section, sectionCounts))
      .filter((section) => section.articleCount > 0),
    totalArticles: filtered.length,
  };
}

export async function getPublicGrammarArticles(): Promise<GrammarArticleCard[]> {
  const snap = await getCachedSnapshot();
  return sortArticlesForLibrary(snap.articles).map((article) => mapArticleCard(article, snap));
}

export async function getPublicGrammarSlugs(): Promise<string[]> {
  const snap = await getCachedSnapshot();
  return snap.articles.map((article) => article.slug);
}

/**
 * Computes the stable synthetic uuid used as `owner_id` for grammar-example
 * audio rows in `vocab_audio_assets`. Must match the algorithm in
 * `chinachild-sandbox/scripts/backfill-learning-audio.ts`.
 */
function grammarExampleOwnerId(articleId: string, blockId: string, index: number): string {
  const key = `grammar_example|${articleId}|${blockId}|${index}`;
  const hex = createHash("sha256").update(key).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

type GrammarBlockContent = { items?: Array<Record<string, unknown>>; [key: string]: unknown };

function looksLikeRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function grammarSlugFromItem(value: unknown): string | null {
  if (!looksLikeRecord(value)) return null;
  const directSlug = stringValue(value.slug);
  if (directSlug) return directSlug;
  const href = stringValue(value.href);
  return href?.match(/^\/grammar\/([^/?#]+)$/u)?.[1] ?? null;
}

function filterRelatedBlockContent(
  content: unknown,
  publishedSlugs: ReadonlySet<string>,
): unknown {
  if (!looksLikeRecord(content)) return content;
  const rawItems = Array.isArray(content.items)
    ? content.items
    : Array.isArray(content.links)
      ? content.links
      : null;
  if (!rawItems) return content;
  const items = rawItems.filter((item) => {
    const slug = grammarSlugFromItem(item);
    return slug ? publishedSlugs.has(slug) : false;
  });
  if (Array.isArray(content.items)) return { ...content, items };
  return { ...content, links: items };
}

function vocabSlugFromItem(value: unknown): string | null {
  if (!looksLikeRecord(value)) return null;
  return stringValue(value.slug) ?? stringValue(value.term_slug);
}

function vocabSlugsFromBlockContent(content: unknown): string[] {
  if (!looksLikeRecord(content)) return [];
  const items = Array.isArray(content.terms)
    ? content.terms
    : Array.isArray(content.items)
      ? content.items
      : Array.isArray(content.links)
        ? content.links
        : [];
  return items.flatMap((item) => {
    const slug = vocabSlugFromItem(item);
    return slug ? [slug] : [];
  });
}

function filterVocabularyLinksBlockContent(
  content: unknown,
  knownVocabSlugs: ReadonlySet<string>,
): unknown {
  if (!looksLikeRecord(content)) return content;
  const key = Array.isArray(content.terms)
    ? "terms"
    : Array.isArray(content.items)
      ? "items"
      : Array.isArray(content.links)
        ? "links"
        : null;
  if (!key) return content;
  const items = (content[key] as unknown[]).filter((item) => {
    const slug = vocabSlugFromItem(item);
    return slug ? knownVocabSlugs.has(slug) : false;
  });
  return { ...content, [key]: items };
}

export async function getPublicGrammarArticleBySlug(
  slug: string,
): Promise<GrammarArticleDetail | null> {
  const snap = await getCachedSnapshot();
  const article = snap.articles.find((candidate) => candidate.slug === slug);
  if (!article) return null;
  const card = mapArticleCard(article, snap);

  const articleBlocks = (await getCachedArticleBlocks(article.id)).sort(
    (a, b) => a.order_index - b.order_index,
  );

  // Compute stable owner ids for every grammar example item in this article
  // and look up cached audio URLs in one round-trip.
  const exampleAudioKeys: Array<{ blockId: string; index: number; ownerId: string }> = [];
  for (const block of articleBlocks) {
    if (block.block_type !== "examples") continue;
    const content = looksLikeRecord(block.content) ? (block.content as GrammarBlockContent) : null;
    const items = Array.isArray(content?.items) ? content!.items! : [];
    items.forEach((_, index) => {
      exampleAudioKeys.push({
        blockId: block.id,
        index,
        ownerId: grammarExampleOwnerId(article.id, block.id, index),
      });
    });
  }
  const audioByOwnerId = await fetchAudioUrls(
    "grammar_example",
    exampleAudioKeys.map((entry) => entry.ownerId),
  );
  const audioByBlockIndex = new Map<string, string>(); // key = `${blockId}|${index}`
  for (const entry of exampleAudioKeys) {
    const url = audioByOwnerId.get(entry.ownerId);
    if (url) audioByBlockIndex.set(`${entry.blockId}|${entry.index}`, url);
  }
  const publishedSlugs = new Set(snap.articles.map((candidate) => candidate.slug));
  const vocabSlugs = articleBlocks.flatMap((block) =>
    block.block_type === "vocabulary_links" ? vocabSlugsFromBlockContent(block.content) : [],
  );
  const knownVocabSlugs = await fetchKnownVocabSlugs(vocabSlugs);

  return {
    ...card,
    locale: article.locale,
    blocks: articleBlocks.map((block) => {
      let content: unknown = block.content;
      if (block.block_type === "examples" && looksLikeRecord(content)) {
        const original = content as GrammarBlockContent;
        const items = Array.isArray(original.items) ? original.items : [];
        const itemsWithAudio = items.map((item, index) => {
          const url = audioByBlockIndex.get(`${block.id}|${index}`);
          if (!url) return item;
          return { ...item, audio_url: url };
        });
        content = { ...original, items: itemsWithAudio };
      }
      if (block.block_type === "related") {
        content = filterRelatedBlockContent(content, publishedSlugs);
      }
      if (block.block_type === "vocabulary_links") {
        content = filterVocabularyLinksBlockContent(content, knownVocabSlugs);
      }
      return {
        id: block.id,
        articleId: block.article_id,
        blockType: block.block_type,
        content,
        orderIndex: block.order_index,
      };
    }),
  };
}

export async function getPublicGrammarTags(): Promise<GrammarTagGroup[]> {
  const snap = await getCachedSnapshot();
  const counts = articleCountsByTagId(snap);
  return groupTags(snap.tags.map((tag) => mapTag(tag, counts)).filter((tag) => tag.articleCount > 0));
}

export async function getPublicGrammarTagBySlug(slug: string): Promise<{
  tag: GrammarTag | null;
  articles: GrammarArticleCard[];
}> {
  const snap = await getCachedSnapshot();
  const counts = articleCountsByTagId(snap);
  const tagRow = snap.tags.find((t) => t.slug === slug);
  if (!tagRow) return { tag: null, articles: [] };
  const tag = mapTag(tagRow, counts);
  if (tag.articleCount === 0) return { tag: null, articles: [] };
  const articleIds = new Set(
    snap.articleTags.filter((rel) => rel.tag_id === tag.id).map((rel) => rel.article_id),
  );
  const articles = sortArticlesForLibrary(snap.articles)
    .filter((article) => articleIds.has(article.id))
    .map((article) => mapArticleCard(article, snap));
  return { tag, articles };
}

export async function getPublicGrammarSections(): Promise<GrammarSection[]> {
  const snap = await getCachedSnapshot();
  const counts = articleCountsBySectionId(snap);
  return snap.sections
    .map((section) => mapSection(section, counts))
    .filter((section) => section.articleCount > 0);
}

/**
 * Returns up to `limit` published grammar articles that mention the given
 * vocabulary term in their blocks (by slug, simplified hanzi, or display
 * form). Used to render "Связанные правила" on the public word detail page.
 */
export async function getPublicGrammarRelatedForTerm(
  term: { slug: string; simplified: string; defaultDisplay?: string },
  limit = 4,
): Promise<Array<Pick<GrammarArticleCard, "id" | "slug" | "title" | "summary">>> {
  const snap = await getCachedSnapshot();
  const needles = [term.slug, term.simplified, term.defaultDisplay ?? ""]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  if (needles.length === 0 || snap.articles.length === 0) return [];

  const publishedBlocks = await getCachedPublishedArticleBlocks(
    snap.articles.map((article) => article.id),
  );
  const blocksByArticle = new Map<string, string[]>();
  for (const block of publishedBlocks) {
    const serialised = JSON.stringify(block.content).toLowerCase();
    const list = blocksByArticle.get(block.article_id) ?? [];
    list.push(serialised);
    blocksByArticle.set(block.article_id, list);
  }
  return snap.articles
    .filter((article) => {
      const blocks = blocksByArticle.get(article.id) ?? [];
      const haystack = [
        article.title,
        article.summary ?? "",
        ...blocks,
      ]
        .join(" ")
        .toLowerCase();
      return needles.some((needle) => haystack.includes(needle));
    })
    .slice(0, limit)
    .map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
    }));
}

export async function getPublicGrammarSectionBySlug(slug: string): Promise<{
  section: GrammarSection | null;
  articles: GrammarArticleCard[];
}> {
  const snap = await getCachedSnapshot();
  const counts = articleCountsBySectionId(snap);
  const sectionRow = snap.sections.find((s) => s.slug === slug);
  if (!sectionRow) return { section: null, articles: [] };
  const section = mapSection(sectionRow, counts);
  if (section.articleCount === 0) return { section: null, articles: [] };
  const articleIds = new Set(
    snap.articleSections.filter((rel) => rel.section_id === section.id).map((rel) => rel.article_id),
  );
  const articles = sortArticlesForLibrary(snap.articles)
    .filter((article) => articleIds.has(article.id))
    .map((article) => mapArticleCard(article, snap));
  return { section, articles };
}
