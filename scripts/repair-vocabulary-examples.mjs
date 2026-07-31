#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SNAPSHOT_PATH = path.join(
  process.cwd(),
  ".generated",
  "public-content-snapshot.json",
);
const OUTPUT_DIR = path.join(
  process.cwd(),
  ".generated",
  "vocabulary-example-repair",
);
const SAMPLE_SIZE = Number(process.env.SAMPLE_SIZE || "10");
const MODEL = process.env.VOCAB_EXAMPLE_MODEL || "gpt-5.6-terra";
const MODE = process.env.REPAIR_MODE || "sample";
const BATCH_SIZE = Number(process.env.VOCAB_EXAMPLE_BATCH_SIZE || "20");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const STATE_PATH = path.join(OUTPUT_DIR, "state.json");
const PLATFORM_EXAMPLES_PATH =
  process.env.PLATFORM_EXAMPLES_PATH ||
  path.resolve(
    process.cwd(),
    "..",
    "chinachild-my",
    "data",
    "vocabulary",
    "production",
    "examples.json",
  );

const META_EXAMPLE_PATTERNS = [
  /这个词/u,
  /我们今天(?:学习|学了)/u,
  /(?:сегодня\s+)?мы\s+(?:выучили|изучаем|изучили|учим)\s+слово/ui,
];

const SCENARIOS = [
  "дом и повседневные дела",
  "магазин или покупка",
  "транспорт и дорога",
  "учёба или работа",
  "планы и договорённости",
  "погода и прогулка",
  "здоровье и самочувствие",
  "семья и друзья",
  "поездка или гостиница",
  "телефон и интернет",
  "еда и кафе",
  "простое наблюдение или мнение",
];

if (!Number.isInteger(SAMPLE_SIZE) || SAMPLE_SIZE < 1 || SAMPLE_SIZE > 40) {
  throw new Error("SAMPLE_SIZE must be an integer from 1 to 40.");
}
if (!Number.isInteger(BATCH_SIZE) || BATCH_SIZE < 1 || BATCH_SIZE > 40) {
  throw new Error("VOCAB_EXAMPLE_BATCH_SIZE must be an integer from 1 to 40.");
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY are required.",
  );
}

function isMetaExample(row) {
  const text = `${row.hanzi ?? ""}\n${row.translation_ru ?? ""}`;
  return META_EXAMPLE_PATTERNS.some((pattern) => pattern.test(text));
}

function extractResponseText(response) {
  if (typeof response.output_text === "string" && response.output_text) {
    return response.output_text;
  }
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }
  throw new Error("OpenAI response did not contain output_text.");
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function createResponseSchema(itemCount) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      examples: {
        type: "array",
        minItems: itemCount,
        maxItems: itemCount,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            hanzi: { type: "string" },
            pinyin: { type: "string" },
            translation_ru: { type: "string" },
          },
          required: ["id", "hanzi", "pinyin", "translation_ru"],
        },
      },
    },
    required: ["examples"],
  };
}

function generationInput(items) {
  return items.map((item) => ({
    id: item.id,
    target_word: item.word,
    target_pinyin: item.pinyin,
    supplied_meaning_ru: item.meaning_ru,
    part_of_speech: item.part_of_speech,
    hsk_level: item.hsk_level,
  }));
}

function createResponseBody(items, developerPrompt, userInput) {
  return {
    model: MODEL,
    store: false,
    reasoning: { effort: "low" },
    input: [
      { role: "developer", content: developerPrompt },
      { role: "user", content: JSON.stringify(userInput) },
    ],
    text: {
      verbosity: "low",
      format: {
        type: "json_schema",
        name: "vocabulary_example_batch",
        strict: true,
        schema: createResponseSchema(items.length),
      },
    },
    max_output_tokens: Math.max(3000, items.length * 500),
  };
}

async function openAIJson(url, init = {}) {
  const response = await fetch(`https://api.openai.com${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(
      `OpenAI ${url} ${response.status}: ${(await response.text()).slice(0, 1000)}`,
    );
  }
  return response.json();
}

async function readState() {
  try {
    return JSON.parse(await readFile(STATE_PATH, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

async function writeState(state) {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

async function submitBatch(stage, requests) {
  const jsonl = requests
    .map((request, index) =>
      JSON.stringify({
        custom_id: `${stage}-${String(index).padStart(4, "0")}`,
        method: "POST",
        url: "/v1/responses",
        body: request,
      }),
    )
    .join("\n");
  const inputPath = path.join(OUTPUT_DIR, `${stage}-input.jsonl`);
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(inputPath, `${jsonl}\n`);

  const form = new FormData();
  form.set("purpose", "batch");
  form.set("file", new Blob([jsonl], { type: "application/jsonl" }), `${stage}.jsonl`);
  const file = await openAIJson("/v1/files", { method: "POST", body: form });
  const batch = await openAIJson("/v1/batches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input_file_id: file.id,
      endpoint: "/v1/responses",
      completion_window: "24h",
      metadata: {
        job: "chinachild-vocabulary-example-repair",
        stage,
      },
    }),
  });
  const state = await readState();
  state[stage] = {
    batch_id: batch.id,
    input_file_id: file.id,
    status: batch.status,
    submitted_at: new Date().toISOString(),
    request_count: requests.length,
    model: MODEL,
  };
  await writeState(state);
  return batch;
}

async function downloadBatchResults(stage) {
  const state = await readState();
  const stageState = state[stage];
  if (!stageState?.batch_id) {
    throw new Error(`No ${stage} batch in ${STATE_PATH}.`);
  }
  const batch = await openAIJson(`/v1/batches/${stageState.batch_id}`);
  stageState.status = batch.status;
  stageState.counts = batch.request_counts;
  stageState.output_file_id = batch.output_file_id;
  stageState.error_file_id = batch.error_file_id;
  stageState.checked_at = new Date().toISOString();
  await writeState(state);
  console.log(
    `${stage} batch ${batch.id}: ${batch.status}; ` +
      `${batch.request_counts?.completed ?? 0}/${batch.request_counts?.total ?? 0} completed, ` +
      `${batch.request_counts?.failed ?? 0} failed.`,
  );
  console.log(
    JSON.stringify(
      {
        created_at: batch.created_at,
        in_progress_at: batch.in_progress_at,
        expires_at: batch.expires_at,
        finalizing_at: batch.finalizing_at,
        completed_at: batch.completed_at,
        expired_at: batch.expired_at,
        cancelling_at: batch.cancelling_at,
        cancelled_at: batch.cancelled_at,
        errors: batch.errors ?? null,
      },
      null,
      2,
    ),
  );
  if (batch.status !== "completed") return null;
  if (!batch.output_file_id) throw new Error(`${stage} batch has no output file.`);

  const response = await fetch(
    `https://api.openai.com/v1/files/${batch.output_file_id}/content`,
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } },
  );
  if (!response.ok) {
    throw new Error(
      `OpenAI batch output ${response.status}: ${(await response.text()).slice(0, 1000)}`,
    );
  }
  const lines = (await response.text()).trim().split("\n").filter(Boolean);
  const examples = [];
  for (const line of lines) {
    const result = JSON.parse(line);
    if (result.error) {
      throw new Error(`${result.custom_id}: ${JSON.stringify(result.error)}`);
    }
    if (!result.response?.body) {
      throw new Error(`${result.custom_id}: missing response body`);
    }
    const parsed = JSON.parse(extractResponseText(result.response.body));
    examples.push(...parsed.examples);
  }
  return examples;
}

async function waitForBatchResults(stage) {
  const maxMinutes = Number(process.env.BATCH_WAIT_MAX_MINUTES || "120");
  if (!Number.isInteger(maxMinutes) || maxMinutes < 1 || maxMinutes > 720) {
    throw new Error("BATCH_WAIT_MAX_MINUTES must be an integer from 1 to 720.");
  }
  for (let minute = 0; minute <= maxMinutes; minute += 1) {
    const examples = await downloadBatchResults(stage);
    if (examples) return examples;
    if (minute === maxMinutes) {
      throw new Error(`${stage} batch did not complete within ${maxMinutes} minutes.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 60_000));
  }
  throw new Error(`${stage} batch wait ended unexpectedly.`);
}

async function updatePlatformSource(targets, finalExamples) {
  const source = JSON.parse(await readFile(PLATFORM_EXAMPLES_PATH, "utf8"));
  const sourceByKey = new Map(
    source.examples
      .filter((example) => example.source_key)
      .map((example) => [example.source_key, example]),
  );
  const finalById = new Map(finalExamples.map((example) => [example.id, example]));
  const missing = [];
  for (const target of targets) {
    const sourceExample = sourceByKey.get(target.source_key);
    const finalExample = finalById.get(target.id);
    if (!sourceExample || !finalExample) {
      missing.push({
        id: target.id,
        source_key: target.source_key,
        source: Boolean(sourceExample),
        final: Boolean(finalExample),
      });
      continue;
    }
    sourceExample.hanzi = finalExample.hanzi;
    sourceExample.pinyin = finalExample.pinyin;
    sourceExample.translation_ru = finalExample.translation_ru;
  }
  if (missing.length > 0) {
    throw new Error(
      `Platform source mapping incomplete for ${missing.length} example(s): ` +
        JSON.stringify(missing.slice(0, 10)),
    );
  }

  const backupPath = path.join(OUTPUT_DIR, "platform-examples.before.json");
  await writeFile(
    backupPath,
    await readFile(PLATFORM_EXAMPLES_PATH, "utf8"),
  );
  const temporaryPath = `${PLATFORM_EXAMPLES_PATH}.repair-tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(source, null, 2)}\n`);
  await rename(temporaryPath, PLATFORM_EXAMPLES_PATH);
  return backupPath;
}

async function applyDatabaseRepair(targets, finalExamples) {
  const finalById = new Map(finalExamples.map((example) => [example.id, example]));
  const rawById = new Map(rawExamples.map((example) => [example.id, example]));
  const stale = targets.filter((target) => {
    const current = rawById.get(target.id);
    return (
      !current ||
      current.hanzi !== target.original.hanzi ||
      current.pinyin !== target.original.pinyin ||
      current.translation_ru !== target.original.translation_ru
    );
  });
  if (stale.length > 0) {
    throw new Error(
      `Production rows changed since generation for ${stale.length} target(s).`,
    );
  }

  const audioBackup = [];
  for (const ids of chunk(targets.map((target) => target.id), 100)) {
    const { data, error } = await supabase
      .from("vocab_audio_assets")
      .select("*")
      .eq("owner_type", "example")
      .in("owner_id", ids);
    if (error) throw new Error(`Audio backup read failed: ${error.message}`);
    audioBackup.push(...(data ?? []));
  }
  await writeFile(
    path.join(OUTPUT_DIR, "audio-assets.before.json"),
    `${JSON.stringify(audioBackup, null, 2)}\n`,
  );
  await writeFile(
    path.join(OUTPUT_DIR, "vocab-examples.before.json"),
    `${JSON.stringify(
      targets.map((target) => rawById.get(target.id)),
      null,
      2,
    )}\n`,
  );

  for (const targetChunk of chunk(targets, 100)) {
    const rows = targetChunk.map((target) => {
      const finalExample = finalById.get(target.id);
      if (!finalExample) throw new Error(`Missing final example ${target.id}`);
      return {
        id: target.id,
        hanzi: finalExample.hanzi,
        pinyin: finalExample.pinyin,
        translation_ru: finalExample.translation_ru,
      };
    });
    const { error } = await supabase
      .from("vocab_examples")
      .upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`Vocabulary example update failed: ${error.message}`);
  }

  for (const targetChunk of chunk(targets, 100)) {
    const ids = targetChunk.map((target) => target.id);
    const { data, error } = await supabase
      .from("vocab_examples")
      .select("id, hanzi, pinyin, translation_ru")
      .in("id", ids);
    if (error) throw new Error(`Vocabulary verification failed: ${error.message}`);
    const verifiedById = new Map((data ?? []).map((row) => [row.id, row]));
    for (const target of targetChunk) {
      const expected = finalById.get(target.id);
      const actual = verifiedById.get(target.id);
      if (
        !actual ||
        actual.hanzi !== expected.hanzi ||
        actual.pinyin !== expected.pinyin ||
        actual.translation_ru !== expected.translation_ru
      ) {
        throw new Error(`Vocabulary verification mismatch for ${target.id}`);
      }
    }
  }

  for (const ids of chunk(targets.map((target) => target.id), 100)) {
    const { error } = await supabase
      .from("vocab_audio_assets")
      .delete()
      .eq("owner_type", "example")
      .in("owner_id", ids);
    if (error) throw new Error(`Old example audio invalidation failed: ${error.message}`);
  }
  return audioBackup.length;
}

function validateGeneratedExamples(inputs, generated) {
  const inputById = new Map(inputs.map((item) => [item.id, item]));
  const errors = [];
  const seenIds = new Set();
  const seenHanzi = new Set();

  for (const example of generated) {
    const input = inputById.get(example.id);
    if (!input) {
      errors.push(`${example.id}: unexpected id`);
      continue;
    }
    if (seenIds.has(example.id)) errors.push(`${example.id}: duplicate id`);
    seenIds.add(example.id);

    if (!example.hanzi.includes(input.word)) {
      errors.push(`${example.id}: sentence does not contain “${input.word}”`);
    }
    if (META_EXAMPLE_PATTERNS.some((pattern) => pattern.test(example.hanzi))) {
      errors.push(`${example.id}: meta-learning sentence`);
    }
    if (seenHanzi.has(example.hanzi)) {
      errors.push(`${example.id}: duplicate sentence`);
    }
    seenHanzi.add(example.hanzi);
    if (!/[\u3400-\u9fff]/u.test(example.hanzi)) {
      errors.push(`${example.id}: sentence has no Hanzi`);
    }
    if (/[\u3400-\u9fff]/u.test(example.pinyin)) {
      errors.push(`${example.id}: pinyin contains Hanzi`);
    }
    if (!/[а-яё]/iu.test(example.translation_ru)) {
      errors.push(`${example.id}: translation has no Cyrillic text`);
    }
  }

  for (const input of inputs) {
    if (!seenIds.has(input.id)) errors.push(`${input.id}: missing result`);
  }
  return errors;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const snapshot = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8")).tables;
const termsById = new Map(snapshot.vocabTerms.map((term) => [term.id, term]));
const primaryPinyinByTermId = new Map();
for (const pronunciation of snapshot.vocabPronunciations) {
  const current = primaryPinyinByTermId.get(pronunciation.term_id);
  if (
    !current ||
    (pronunciation.is_primary && !current.is_primary) ||
    pronunciation.order_index < current.order_index
  ) {
    primaryPinyinByTermId.set(pronunciation.term_id, pronunciation);
  }
}
const primarySenseByTermId = new Map();
for (const sense of snapshot.vocabSenses) {
  if (sense.locale !== "ru") continue;
  const current = primarySenseByTermId.get(sense.term_id);
  if (!current || sense.order_index < current.order_index) {
    primarySenseByTermId.set(sense.term_id, sense);
  }
}

const rawExamples = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("vocab_examples")
    .select("id, term_id, source_key, hanzi, pinyin, translation_ru, order_index")
    .order("id")
    .range(from, from + 999);
  if (error) throw new Error(`vocab_examples read failed: ${error.message}`);
  rawExamples.push(...(data ?? []));
  if ((data ?? []).length < 1000) break;
}

const targets = rawExamples
  .filter(isMetaExample)
  .map((example, index) => {
    const term = termsById.get(example.term_id);
    if (!term) return null;
    const pronunciation = primaryPinyinByTermId.get(example.term_id);
    const sense = primarySenseByTermId.get(example.term_id);
    return {
      id: example.id,
      source_key: example.source_key,
      term_slug: term.slug,
      word: term.simplified,
      pinyin: pronunciation?.pinyin_display ?? "",
      meaning_ru:
        sense?.definition ?? term.base_translation_ru ?? example.translation_ru ?? "",
      part_of_speech: term.part_of_speech ?? "",
      hsk_level:
        typeof term.metadata?.hsk_level === "number"
          ? term.metadata.hsk_level
          : null,
      scenario: SCENARIOS[index % SCENARIOS.length],
      original: {
        hanzi: example.hanzi,
        pinyin: example.pinyin,
        translation_ru: example.translation_ru,
      },
    };
  })
  .filter(Boolean);

if (targets.length === 0) {
  throw new Error("No meta-learning vocabulary examples found.");
}

const developerPrompt = `Роль: редактор учебного китайско-русского словаря.

Цель: для каждого входного слова создать один короткий, естественный пример
из реальной жизни, который показывает указанное значение слова в контексте.

Критерии:
- предложение на упрощённом китайском содержит target word дословно;
- это обычная реплика или жизненная ситуация, а не разговор об изучении слова;
- предложения внутри пачки различаются по ситуации и началу;
- pinyin полностью соответствует предложению, написан с тоновыми знаками;
- русский перевод точно и естественно передаёт смысл предложения;
- сложность по возможности соответствует указанному HSK.
- если supplied_meaning_ru явно противоречит общеупотребительному значению
  китайского слова, исправь ошибку источника и используй нормальное значение;
- выбирай естественную для самого слова ситуацию и типичную сочетаемость,
  не подгоняй слово под случайный сюжет.

Запрещено:
- фразы “мы изучаем/выучили слово”, “это слово”, определения и цитирование слова;
- единый шаблон для разных записей;
- подмена заданного значения другим омонимичным значением;
- комментарии вне требуемой JSON-схемы.`;

const reviewPrompt = `Роль: выпускающий редактор китайско-русского учебного словаря.

Для каждой записи независимо проверь candidate и верни финальную исправленную
версию. Не подтверждай вариант автоматически: перепиши его, если есть хотя бы
одна проблема.

Финальная версия обязана:
- звучать естественно для носителя стандартного путунхуа;
- использовать target_word дословно и в его нормальном общеупотребительном
  значении; ошибочное supplied_meaning_ru не имеет приоритета над реальным
  значением китайского слова;
- быть коротким жизненным примером, а не определением или разговором об учёбе;
- иметь pinyin с правильными тонами и разбиением, полностью совпадающий с hanzi;
- иметь точный естественный русский перевод без потери значения target_word;
- не повторять один шаблон для разных слов.

Верни все записи и только поля требуемой JSON-схемы.`;

if (MODE === "submit-generation") {
  const requests = chunk(targets, BATCH_SIZE).map((items) =>
    createResponseBody(items, developerPrompt, generationInput(items)),
  );
  const batch = await submitBatch("generation", requests);
  console.log(
    `Submitted generation batch ${batch.id}: ${requests.length} requests for ${targets.length} examples.`,
  );
  process.exit(0);
}

if (MODE === "status-generation" || MODE === "wait-generation") {
  const generated =
    MODE === "wait-generation"
      ? await waitForBatchResults("generation")
      : await downloadBatchResults("generation");
  if (!generated) process.exit(0);
  const validationErrors = validateGeneratedExamples(targets, generated);
  const outputPath = path.join(OUTPUT_DIR, "generated.json");
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        model: (await readState()).generation.model,
        validationErrors,
        examples: generated,
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `Generation results: ${generated.length}/${targets.length}; ` +
      `validation errors: ${validationErrors.length}.`,
  );
  if (validationErrors.length > 0) process.exitCode = 1;
  process.exit();
}

if (MODE === "submit-review") {
  const generatedFile = JSON.parse(
    await readFile(path.join(OUTPUT_DIR, "generated.json"), "utf8"),
  );
  if (generatedFile.validationErrors?.length) {
    throw new Error(
      `Cannot review generation with ${generatedFile.validationErrors.length} validation error(s).`,
    );
  }
  const generatedById = new Map(
    generatedFile.examples.map((example) => [example.id, example]),
  );
  const requests = chunk(targets, BATCH_SIZE).map((items) =>
    createResponseBody(
      items,
      reviewPrompt,
      items.map((item) => ({
        id: item.id,
        target_word: item.word,
        target_pinyin: item.pinyin,
        supplied_meaning_ru: item.meaning_ru,
        part_of_speech: item.part_of_speech,
        hsk_level: item.hsk_level,
        candidate: generatedById.get(item.id),
      })),
    ),
  );
  const batch = await submitBatch("review", requests);
  console.log(
    `Submitted review batch ${batch.id}: ${requests.length} requests for ${targets.length} examples.`,
  );
  process.exit(0);
}

if (MODE === "status-review" || MODE === "wait-review") {
  const reviewed =
    MODE === "wait-review"
      ? await waitForBatchResults("review")
      : await downloadBatchResults("review");
  if (!reviewed) process.exit(0);
  const validationErrors = validateGeneratedExamples(targets, reviewed);
  const generatedFile = JSON.parse(
    await readFile(path.join(OUTPUT_DIR, "generated.json"), "utf8"),
  );
  const generatedById = new Map(
    generatedFile.examples.map((example) => [example.id, example]),
  );
  const changedCount = reviewed.filter((example) => {
    const generated = generatedById.get(example.id);
    return (
      !generated ||
      generated.hanzi !== example.hanzi ||
      generated.pinyin !== example.pinyin ||
      generated.translation_ru !== example.translation_ru
    );
  }).length;
  const outputPath = path.join(OUTPUT_DIR, "reviewed.json");
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        model: (await readState()).review.model,
        validationErrors,
        changedCount,
        examples: reviewed,
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `Review results: ${reviewed.length}/${targets.length}; ` +
      `changed: ${changedCount}; validation errors: ${validationErrors.length}.`,
  );
  if (validationErrors.length > 0) process.exitCode = 1;
  process.exit();
}

if (MODE === "apply") {
  if (process.env.APPLY_CONFIRMED !== "1") {
    throw new Error("Set APPLY_CONFIRMED=1 to update the platform source and Supabase.");
  }
  const reviewedFile = JSON.parse(
    await readFile(path.join(OUTPUT_DIR, "reviewed.json"), "utf8"),
  );
  const validationErrors = validateGeneratedExamples(
    targets,
    reviewedFile.examples,
  );
  if (reviewedFile.validationErrors?.length || validationErrors.length) {
    throw new Error(
      `Cannot apply reviewed data with ${
        (reviewedFile.validationErrors?.length ?? 0) + validationErrors.length
      } validation error(s).`,
    );
  }
  if (reviewedFile.examples.length !== targets.length) {
    throw new Error(
      `Cannot apply ${reviewedFile.examples.length}/${targets.length} reviewed examples.`,
    );
  }
  const sourceBackupPath = await updatePlatformSource(
    targets,
    reviewedFile.examples,
  );
  const invalidatedAudioCount = await applyDatabaseRepair(
    targets,
    reviewedFile.examples,
  );
  console.log(
    `Applied ${reviewedFile.examples.length} examples; invalidated ` +
      `${invalidatedAudioCount} old audio row(s). Source backup: ${sourceBackupPath}`,
  );
  process.exit(0);
}

if (MODE !== "sample") {
  throw new Error(`Unsupported REPAIR_MODE: ${MODE}`);
}

const sample = targets.slice(0, SAMPLE_SIZE);
const responseBody = await openAIJson("/v1/responses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(
    createResponseBody(sample, developerPrompt, generationInput(sample)),
  ),
});
const generated = JSON.parse(extractResponseText(responseBody)).examples;
const validationErrors = validateGeneratedExamples(sample, generated);
await mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(OUTPUT_DIR, "sample.json");
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      model: MODEL,
      targetCount: targets.length,
      usage: responseBody.usage ?? null,
      validationErrors,
      examples: generated.map((example) => ({
        ...example,
        input: sample.find((item) => item.id === example.id),
      })),
    },
    null,
    2,
  )}\n`,
);
console.log(
  `Sample generated: ${generated.length}/${sample.length}; ` +
    `validation errors: ${validationErrors.length}; targets: ${targets.length}.`,
);
console.log(`Saved to ${outputPath}`);
if (validationErrors.length > 0) {
  for (const error of validationErrors) console.error(`- ${error}`);
  process.exitCode = 1;
}
