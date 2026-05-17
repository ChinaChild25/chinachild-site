// Shared content contract between chinachild-sandbox (platform) and chinachild-site (public).
// These types mirror lib/grammar and lib/vocabulary types from the sandbox repo but
// only carry the fields needed for public SEO rendering.

export type GrammarTag = {
  id: string;
  slug: string;
  labelRu: string;
  labelEn: string | null;
  groupKey: string;
  orderIndex: number;
  articleCount: number;
};

export type GrammarSection = {
  id: string;
  slug: string;
  titleRu: string;
  titleEn: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;
  sectionType: string;
  groupKey: string | null;
  orderIndex: number;
  articleCount: number;
};

export type GrammarArticleCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  difficultyHskVersion: string | null;
  difficultyHskLevel: string | null;
  isFeatured: boolean;
  featuredOrder: number | null;
  tags: GrammarTag[];
  sections: GrammarSection[];
};

export type GrammarBlock = {
  id: string;
  articleId: string;
  blockType:
    | "heading"
    | "paragraph"
    | "scheme"
    | "callout"
    | "examples"
    | "formula"
    | "list"
    | "related"
    | "vocabulary_links";
  content: unknown;
  orderIndex: number;
};

export type GrammarArticleDetail = GrammarArticleCard & {
  locale: string;
  blocks: GrammarBlock[];
};

export type GrammarTagGroup = {
  key: string;
  label: string;
  tags: GrammarTag[];
};

export type FeaturedGrammarTopic = {
  key: string;
  title: string;
  description: string;
  chips: string[];
  article: GrammarArticleCard | null;
};

export type GrammarHomeData = {
  featuredTopics: FeaturedGrammarTopic[];
  filters: GrammarTagGroup[];
  articles: GrammarArticleCard[];
  sections: GrammarSection[];
  totalArticles: number;
};

export type HskVersionId = "3.0" | "2.0";

export type HskDeckSummary = {
  id: string;
  slug: string;
  title: string;
  hskVersion: HskVersionId;
  hskLevel: string;
  displayCount: number | null;
  importedCount: number | null;
  description: string | null;
};

export type HskVersionSummary = {
  id: HskVersionId;
  label: string;
  description: string;
  totalPlanned: number;
  totalImported: number;
  decks: HskDeckSummary[];
};

export type WordPronunciation = {
  pinyinDisplay: string;
  pinyinNormalized: string;
  isPrimary: boolean;
};

export type WordSense = {
  definition: string;
  locale: string;
  orderIndex: number;
};

export type WordExample = {
  hanzi: string;
  pinyin: string | null;
  translationRu: string | null;
  orderIndex: number;
  audioUrl: string | null;
};

export type WordCharacterStroke = {
  hanzi: string;
  strokes: unknown;
  medians: unknown;
  rawSvg: string | null;
  viewportWidth: number;
  viewportHeight: number;
};

export type WordCard = {
  id: string;
  slug: string;
  simplified: string;
  traditional: string | null;
  defaultDisplay: string;
  baseTranslationRu: string | null;
  frequencyRank: number | null;
  primaryPinyin: string | null;
  primarySense: string | null;
  audioUrl: string | null;
};

export type WordDetail = WordCard & {
  pronunciations: WordPronunciation[];
  senses: WordSense[];
  examples: WordExample[];
  hskBadges: Array<{ version: HskVersionId; level: string; deckSlug: string }>;
  characters: WordCharacterStroke[];
};

export type DictionarySearchMatch = "hanzi" | "pinyin" | "meaning" | "sense";

export type DictionarySearchHit = WordCard & {
  matchedBy: DictionarySearchMatch;
  hskBadges: Array<{ version: HskVersionId; level: string }>;
};

export type DictionarySearchResult = {
  query: string;
  hits: DictionarySearchHit[];
  total: number;
  limit: number;
  hasHanzi: boolean;
};
