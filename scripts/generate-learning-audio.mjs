#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

const SNAPSHOT_PATH = path.join(process.cwd(), ".generated", "public-content-snapshot.json");
const HSK_QUESTIONS_PATH = path.join(process.cwd(), "lib", "hsk-test", "questions.ts");
const DIAGNOSTIC_QUESTIONS_PATH = path.join(process.cwd(), "lib", "diagnostic", "questions.ts");
const HSK_RENDERER_PATH = path.join(process.cwd(), "components", "hsk-test", "QuestionRenderer.tsx");
const DIAGNOSTIC_RENDERER_PATH = path.join(
  process.cwd(),
  "components",
  "diagnostic",
  "QuestionRenderers.tsx",
);
const TEST_AUDIO_MAP_PATH = path.join(process.cwd(), "lib", "content", "stored-test-audio.ts");

const MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
const VOICE = process.env.OPENAI_TTS_VOICE || "marin";
const INSTRUCTIONS =
  process.env.OPENAI_TTS_INSTRUCTIONS ||
  "Speak in clear, natural Standard Mandarin Chinese with accurate tones. Use a warm professional teacher voice and a measured learning-friendly pace. Read only the supplied text.";
const SPEED = Number(process.env.OPENAI_TTS_SPEED || "0.9");
const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""
).replace(/\/+$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET = process.env.SUPABASE_AUDIO_BUCKET || "vocab-public-audio";
const CONCURRENCY = Number(process.env.AUDIO_GENERATION_CONCURRENCY || "4");
const CHECK_ONLY = process.env.CHECK_ONLY === "1";
const DRY_RUN = process.env.DRY_RUN === "1";
const REDACTED_VALUE = "[SENSITIVE]";

if (CHECK_ONLY && DRY_RUN) {
  throw new Error("CHECK_ONLY and DRY_RUN cannot be enabled together.");
}
if (!Number.isFinite(SPEED) || SPEED < 0.25 || SPEED > 4) {
  throw new Error("OPENAI_TTS_SPEED must be between 0.25 and 4.");
}
if (!Number.isInteger(CONCURRENCY) || CONCURRENCY < 1 || CONCURRENCY > 10) {
  throw new Error("AUDIO_GENERATION_CONCURRENCY must be an integer from 1 to 10.");
}
if (
  !CHECK_ONLY &&
  !DRY_RUN &&
  (
    !process.env.OPENAI_API_KEY ||
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    process.env.OPENAI_API_KEY === REDACTED_VALUE ||
    SUPABASE_URL === REDACTED_VALUE ||
    SUPABASE_SERVICE_ROLE_KEY === REDACTED_VALUE
  )
) {
  throw new Error(
    "Usable OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY values are required.",
  );
}

function contentHash(text) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        text,
        model: MODEL,
        voice: VOICE,
        instructions: INSTRUCTIONS,
        speed: SPEED,
        format: "mp3",
      }),
    )
    .digest("hex");
}

function encodeStoragePath(storagePath) {
  return storagePath.split("/").map(encodeURIComponent).join("/");
}

function publicStorageUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(BUCKET)}/${encodeStoragePath(storagePath)}`;
}

async function storageObjectExists(publicUrl) {
  const response = await fetch(publicUrl, { method: "HEAD" });
  if (response.ok) return true;
  if (response.status === 400 || response.status === 404) return false;
  throw new Error(`Supabase Storage HEAD ${response.status}: ${await response.text().catch(() => "")}`);
}

async function callOpenAITTS(text) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      voice: VOICE,
      input: text,
      instructions: INSTRUCTIONS,
      response_format: "mp3",
      speed: SPEED,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenAI TTS ${response.status}: ${errorText.slice(0, 300)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToSupabase(storagePath, audio) {
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(BUCKET)}/${encodeStoragePath(storagePath)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "x-upsert": "false",
      },
      body: audio,
    },
  );
  if (response.ok || response.status === 409) return;
  const errorText = await response.text().catch(() => "");
  throw new Error(`Supabase Storage upload ${response.status}: ${errorText.slice(0, 300)}`);
}

async function insertAudioAsset(item, storagePath, publicUrl, hash) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/vocab_audio_assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      owner_type: item.ownerType,
      owner_id: item.ownerId,
      locale: "zh-CN",
      model: MODEL,
      voice: VOICE,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: "audio/mpeg",
      duration_ms: null,
      input_hash: hash,
    }),
  });
  if (response.ok || response.status === 409) return;
  const errorText = await response.text().catch(() => "");
  throw new Error(`vocab_audio_assets insert ${response.status}: ${errorText.slice(0, 300)}`);
}

function extractTestTexts(hskSource, diagnosticSource) {
  const texts = [];
  for (const match of hskSource.matchAll(/\baudioText:\s*"([^"]+)"/gu)) {
    texts.push(match[1]);
  }
  for (const match of diagnosticSource.matchAll(
    /\bid:\s*"b-[^"]+"[^{}\n]*\btype:\s*"B"[^{}\n]*\bhanzi:\s*"([^"]+)"/gu,
  )) {
    texts.push(match[1]);
  }
  return [...new Set(texts)].sort((a, b) => a.localeCompare(b, "zh"));
}

function parseStoredTestAudio(source) {
  const match = source.match(
    /const STORED_TEST_AUDIO_URLS:[\s\S]*?Object\.freeze\((\{[\s\S]*?\})\);/u,
  );
  if (!match) throw new Error(`Cannot parse ${TEST_AUDIO_MAP_PATH}`);
  return JSON.parse(match[1]);
}

function renderStoredTestAudio(entries) {
  const json = JSON.stringify(
    Object.fromEntries([...entries].sort(([a], [b]) => a.localeCompare(b, "zh"))),
    null,
    2,
  );
  return `const STORED_TEST_AUDIO_URLS: Readonly<Record<string, string>> = Object.freeze(${json});

export function getStoredTestAudioUrl(text: string): string {
  return STORED_TEST_AUDIO_URLS[text] ?? "";
}
`;
}

async function runPool(items, worker) {
  let cursor = 0;
  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, runWorker));
}

const [
  snapshotSource,
  hskSource,
  diagnosticSource,
  storedTestAudioSource,
  hskRendererSource,
  diagnosticRendererSource,
] = await Promise.all([
  readFile(SNAPSHOT_PATH, "utf8"),
  readFile(HSK_QUESTIONS_PATH, "utf8"),
  readFile(DIAGNOSTIC_QUESTIONS_PATH, "utf8"),
  readFile(TEST_AUDIO_MAP_PATH, "utf8"),
  readFile(HSK_RENDERER_PATH, "utf8"),
  readFile(DIAGNOSTIC_RENDERER_PATH, "utf8"),
]);
const snapshot = JSON.parse(snapshotSource).tables;
const publicTermIds = new Set(snapshot.vocabTerms.map((term) => term.id));
const assetKeys = new Set(
  snapshot.vocabAudioAssets
    .filter((asset) => asset.public_url)
    .map((asset) => `${asset.owner_type}:${asset.owner_id}`),
);
const missingLearningItems = [
  ...snapshot.vocabTerms
    .filter((term) => !assetKeys.has(`term:${term.id}`))
    .map((term) => ({
      ownerType: "term",
      ownerId: term.id,
      text: term.simplified || term.default_display,
    })),
  ...snapshot.vocabExamples
    .filter(
      (example) =>
        publicTermIds.has(example.term_id) &&
        !assetKeys.has(`example:${example.id}`),
    )
    .map((example) => ({
      ownerType: "example",
      ownerId: example.id,
      text: example.hanzi,
    })),
].filter((item) => typeof item.text === "string" && item.text.trim());

const testTexts = extractTestTexts(hskSource, diagnosticSource);
const storedTestAudio = parseStoredTestAudio(storedTestAudioSource);
const missingTestTexts = testTexts.filter((text) => !storedTestAudio[text]);

console.log(
  `Learning audio coverage: ${snapshot.vocabTerms.length - missingLearningItems.filter((item) => item.ownerType === "term").length}/${snapshot.vocabTerms.length} terms, ` +
    `${snapshot.vocabExamples.filter((example) => publicTermIds.has(example.term_id)).length - missingLearningItems.filter((item) => item.ownerType === "example").length}/${snapshot.vocabExamples.filter((example) => publicTermIds.has(example.term_id)).length} examples.`,
);
console.log(`Stored HSK/diagnostic coverage: ${testTexts.length - missingTestTexts.length}/${testTexts.length} unique texts.`);

if (CHECK_ONLY) {
  const runtimeTtsMarkers = ["speechSynthesis", "SpeechSynthesisUtterance", "/api/hsk-test/tts"];
  const runtimeTtsMarker = runtimeTtsMarkers.find(
    (marker) => hskRendererSource.includes(marker) || diagnosticRendererSource.includes(marker),
  );
  if (runtimeTtsMarker) {
    throw new Error(`Runtime/browser TTS fallback detected: ${runtimeTtsMarker}`);
  }
  if (missingLearningItems.length || missingTestTexts.length) {
    throw new Error(
      `Stored audio coverage incomplete: ${missingLearningItems.length} dictionary item(s), ${missingTestTexts.length} HSK/diagnostic text(s).`,
    );
  }
  console.log("Stored audio coverage check passed.");
  process.exit(0);
}

if (DRY_RUN) {
  for (const item of missingLearningItems) {
    console.log(`[DRY] ${item.ownerType}:${item.ownerId} "${item.text}"`);
  }
  for (const text of missingTestTexts) {
    console.log(`[DRY] test "${text}"`);
  }
  process.exit(0);
}

let completed = 0;
await runPool(missingLearningItems, async (item) => {
  const hash = contentHash(item.text);
  const storagePath = `${item.ownerType === "term" ? "terms" : "examples"}/${item.ownerId}/${hash}.mp3`;
  const publicUrl = publicStorageUrl(storagePath);
  if (!(await storageObjectExists(publicUrl))) {
    const audio = await callOpenAITTS(item.text);
    await uploadToSupabase(storagePath, audio);
  }
  await insertAudioAsset(item, storagePath, publicUrl, hash);
  completed += 1;
  console.log(`[${completed}/${missingLearningItems.length}] ${item.ownerType} "${item.text}"`);
});

const nextTestAudioEntries = new Map(Object.entries(storedTestAudio));
completed = 0;
await runPool(testTexts, async (text) => {
  const hash = contentHash(text);
  const storagePath = `tests/${hash.slice(0, 2)}/${hash}.mp3`;
  const publicUrl = publicStorageUrl(storagePath);
  if (!(await storageObjectExists(publicUrl))) {
    const audio = await callOpenAITTS(text);
    await uploadToSupabase(storagePath, audio);
  }
  nextTestAudioEntries.set(text, publicUrl);
  completed += 1;
  console.log(`[${completed}/${testTexts.length}] test "${text}"`);
});

await writeFile(TEST_AUDIO_MAP_PATH, renderStoredTestAudio(nextTestAudioEntries), "utf8");
console.log(
  `Stored audio generation complete: ${missingLearningItems.length} dictionary item(s), ${testTexts.length} HSK/diagnostic text(s).`,
);
