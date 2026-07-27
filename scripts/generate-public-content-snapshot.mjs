import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;
const outputPath = path.join(process.cwd(), ".generated", "public-content-snapshot.json");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.");
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { "X-Client-Info": "chinachild-site/build-snapshot" } },
});
let requestCount = 0;

async function fetchAll(label, makeQuery) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    requestCount += 1;
    const { data, error } = await makeQuery().range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${label}: ${error.message}`);
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

const entries = await Promise.all([
  fetchAll("vocab_decks", () =>
    supabase
      .from("vocab_decks")
      .select("id, slug, title, description, hsk_version, hsk_level, display_count, imported_count, kind, source_type, source_label")
      .in("kind", ["system", "imported"])
      .eq("source_type", "hsk")
      .order("hsk_version")
      .order("hsk_level")),
  fetchAll("vocab_deck_items", () =>
    supabase.from("vocab_deck_items").select("deck_id, term_id, order_index").order("deck_id").order("order_index")),
  fetchAll("vocab_terms", () =>
    supabase
      .from("vocab_terms")
      .select("id, slug, simplified, traditional, default_display, base_translation_ru, base_translation_en, frequency_rank, part_of_speech, metadata")
      .order("id")),
  fetchAll("vocab_pronunciations", () =>
    supabase.from("vocab_pronunciations").select("term_id, pinyin_display, pinyin_normalized, is_primary, order_index").order("term_id").order("order_index")),
  fetchAll("vocab_senses", () =>
    supabase.from("vocab_senses").select("term_id, locale, definition, order_index").order("term_id").order("order_index")),
  fetchAll("vocab_examples", () =>
    supabase.from("vocab_examples").select("id, term_id, hanzi, pinyin, translation_ru, order_index").order("term_id").order("order_index")),
  fetchAll("vocab_audio_assets", () =>
    supabase.from("vocab_audio_assets").select("owner_id, owner_type, public_url, storage_path").order("owner_type").order("owner_id")),
  fetchAll("vocab_characters", () =>
    supabase.from("vocab_characters").select("id, hanzi").order("id")),
  fetchAll("character_stroke_assets", () =>
    supabase.from("character_stroke_assets").select("character_id, strokes, medians, raw_svg, viewport_width, viewport_height").order("character_id")),
  fetchAll("grammar_articles", () =>
    supabase
      .from("grammar_articles")
      .select("id, slug, title, summary, locale, status, difficulty_hsk_version, difficulty_hsk_level, metadata")
      .eq("status", "published")
      .order("created_at")),
  fetchAll("grammar_blocks", () =>
    supabase.from("grammar_blocks").select("id, article_id, block_type, content, order_index").order("article_id").order("order_index")),
  fetchAll("grammar_tags", () =>
    supabase.from("grammar_tags").select("id, slug, label_ru, label_en, group_key, order_index").order("group_key").order("order_index")),
  fetchAll("grammar_sections", () =>
    supabase.from("grammar_sections").select("id, slug, title_ru, title_en, description_ru, description_en, section_type, group_key, order_index").order("order_index")),
  fetchAll("grammar_article_tags", () =>
    supabase.from("grammar_article_tags").select("article_id, tag_id").order("article_id")),
  fetchAll("grammar_article_sections", () =>
    supabase.from("grammar_article_sections").select("article_id, section_id").order("article_id")),
]);

const [
  vocabDecks, vocabDeckItems, rawVocabTerms, vocabPronunciations, vocabSenses,
  vocabExamples, vocabAudioAssets, vocabCharacters, characterStrokeAssets,
  grammarArticles, grammarBlocks, grammarTags, grammarSections,
  grammarArticleTags, grammarArticleSections,
] = entries;
const vocabTerms = rawVocabTerms.filter((row) => row.metadata?.source !== "chinachild-demo");
const snapshot = {
  version: 1,
  generatedAt: new Date().toISOString(),
  requestCount,
  publicWordCount: vocabTerms.length,
  tables: {
    vocabDecks, vocabDeckItems, vocabTerms, vocabPronunciations, vocabSenses,
    vocabExamples, vocabAudioAssets, vocabCharacters, characterStrokeAssets,
    grammarArticles, grammarBlocks, grammarTags, grammarSections,
    grammarArticleTags, grammarArticleSections,
  },
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(snapshot)}\n`);
console.log(`Public content snapshot: ${vocabTerms.length} words, ${grammarArticles.length} grammar articles, ${requestCount} paginated requests.`);
