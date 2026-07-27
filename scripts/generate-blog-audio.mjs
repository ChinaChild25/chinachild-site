#!/usr/bin/env node
/**
 * generate-blog-audio.mjs
 *
 * Сканирует все `content/blog/*.mdx` и находит блоки:
 *
 *   :::audio
 *   { "hanzi": "你好", "pinyin": "nǐ hǎo", "translation": "Здравствуйте",
 *     "ttsText": "你好" }
 *   :::
 *
 * Для каждого блока с пустым `src` вызывает OpenAI TTS API,
 * сохраняет MP3 в публичном Supabase Storage и обновляет MDX,
 * записывая постоянный public URL в JSON блока. Повторные запуски
 * идемпотентны: путь зависит от текста и настроек синтеза.
 *
 * Запуск:
 *   OPENAI_API_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate-blog-audio.mjs
 *
 * Опции через env:
 *   OPENAI_TTS_MODEL — "gpt-4o-mini-tts" по умолчанию
 *   OPENAI_TTS_VOICE — "marin" по умолчанию
 *   OPENAI_TTS_INSTRUCTIONS — инструкция модели по произношению
 *   SUPABASE_AUDIO_BUCKET — "vocab-public-audio" по умолчанию
 *   DRY_RUN=1        — только показать, что будет сгенерировано
 *   CHECK_ONLY=1     — завершиться с ошибкой, если есть пустые src
 *   FORCE=1          — перевыпустить уже заполненные блоки
 *   ONLY=slug1,slug2 — ограничить указанными статьями
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
const DEFAULT_VOICE = process.env.OPENAI_TTS_VOICE || "marin";
const DEFAULT_INSTRUCTIONS =
  process.env.OPENAI_TTS_INSTRUCTIONS ||
  "Speak in clear, natural Standard Mandarin Chinese with accurate tones. Use a warm professional teacher voice and a measured learning-friendly pace. Read only the supplied text.";
const SPEED = Number(process.env.OPENAI_TTS_SPEED || "0.9");
const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""
).replace(/\/+$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_AUDIO_BUCKET = process.env.SUPABASE_AUDIO_BUCKET || "vocab-public-audio";
const SUPABASE_AUDIO_PREFIX = process.env.SUPABASE_AUDIO_PREFIX || "blog";
const DRY = process.env.DRY_RUN === "1";
const CHECK_ONLY = process.env.CHECK_ONLY === "1";
const FORCE = process.env.FORCE === "1";
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
const REDACTED_VALUE = "[SENSITIVE]";

if (DRY && CHECK_ONLY) {
  console.error("DRY_RUN and CHECK_ONLY cannot be enabled together.");
  process.exit(1);
}

if (
  (
    !process.env.OPENAI_API_KEY ||
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    process.env.OPENAI_API_KEY === REDACTED_VALUE ||
    SUPABASE_URL === REDACTED_VALUE ||
    SUPABASE_SERVICE_ROLE_KEY === REDACTED_VALUE
  ) &&
  !DRY &&
  !CHECK_ONLY
) {
  console.error(
    "Usable OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), and SUPABASE_SERVICE_ROLE_KEY values are required.",
  );
  process.exit(1);
}

if (MODEL === REDACTED_VALUE || DEFAULT_VOICE === REDACTED_VALUE) {
  console.error("OPENAI_TTS_MODEL and OPENAI_TTS_VOICE must not contain redacted placeholders.");
  process.exit(1);
}

if (!Number.isFinite(SPEED) || SPEED < 0.25 || SPEED > 4) {
  console.error("OPENAI_TTS_SPEED must be between 0.25 and 4.");
  process.exit(1);
}

function findAudioBlocks(source) {
  const blocks = [];
  const re = /^:::audio\s*\n([\s\S]*?)\n^:::\s*$/gm;
  let match;
  while ((match = re.exec(source)) !== null) {
    const payload = match[1];
    let data;
    try {
      data = JSON.parse(payload);
    } catch {
      continue;
    }
    blocks.push({
      data,
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return blocks;
}

function contentHash({ text, voice, instructions }) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ text, voice, model: MODEL, instructions, speed: SPEED, format: "mp3" }))
    .digest("hex");
}

function encodeStoragePath(storagePath) {
  return storagePath.split("/").map(encodeURIComponent).join("/");
}

function publicStorageUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(SUPABASE_AUDIO_BUCKET)}/${encodeStoragePath(storagePath)}`;
}

async function storageObjectExists(publicUrl) {
  const response = await fetch(publicUrl, { method: "HEAD" });
  if (response.ok) return true;
  // Supabase's public object endpoint currently wraps Object-not-found (404)
  // in an HTTP 400 response for both HEAD and GET requests.
  if (response.status === 400 || response.status === 404) return false;
  throw new Error(`Supabase Storage HEAD ${response.status}: ${await response.text().catch(() => "")}`);
}

async function callOpenAITTS({ text, voice, instructions }) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      voice,
      input: text,
      instructions,
      response_format: "mp3",
      speed: SPEED,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI TTS ${res.status}: ${errText.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToSupabase({ storagePath, audio }) {
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(SUPABASE_AUDIO_BUCKET)}/${encodeStoragePath(storagePath)}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "x-upsert": "false",
    },
    body: audio,
  });

  if (response.ok || response.status === 409) return;
  const errorText = await response.text().catch(() => "");
  throw new Error(`Supabase Storage upload ${response.status}: ${errorText.slice(0, 300)}`);
}

function replaceBlockJson(source, block, nextData) {
  const before = source.slice(0, block.start);
  const after = source.slice(block.end);
  const json = JSON.stringify(nextData, null, 2);
  return `${before}:::audio\n${json}\n:::${after}`;
}

async function processFile(filePath) {
  const slug = path.basename(filePath, ".mdx");
  if (ONLY && !ONLY.has(slug)) return { slug, skipped: true };

  const source = await readFile(filePath, "utf8");
  const blocks = findAudioBlocks(source);
  if (blocks.length === 0) return { slug, generated: 0, total: 0 };

  const replacements = [];
  let processed = 0;
  let blockIndex = 0;

  for (const block of blocks) {
    blockIndex += 1;
    const data = block.data;
    if (data.src && data.src.trim().length > 0 && !FORCE) continue;
    const ttsText = data.ttsText || data.hanzi;
    if (!ttsText) {
      console.warn(`[${slug}] block ${blockIndex}: no ttsText/hanzi, skipped`);
      continue;
    }
    const voice = data.voice || DEFAULT_VOICE;
    const instructions = data.ttsInstructions || DEFAULT_INSTRUCTIONS;
    const hash = contentHash({ text: ttsText, voice, instructions });
    const storagePath = `${SUPABASE_AUDIO_PREFIX}/${hash.slice(0, 2)}/${hash}.mp3`;
    const publicUrl = publicStorageUrl(storagePath);

    if (DRY || CHECK_ONLY) {
      const prefix = CHECK_ONLY ? "MISSING" : "DRY";
      console.log(`[${prefix}] ${slug} #${blockIndex} -> ${publicUrl}  "${ttsText}"`);
      processed += 1;
      continue;
    }

    const alreadyStored = await storageObjectExists(publicUrl);
    if (alreadyStored) {
      console.log(`[${slug}] reuse stored ${storagePath} for "${ttsText}"`);
    } else {
      console.log(`[${slug}] TTS #${blockIndex} (${voice}, ${MODEL}): "${ttsText}"`);
      const audio = await callOpenAITTS({ text: ttsText, voice, instructions });
      await uploadToSupabase({ storagePath, audio });
      console.log(`  uploaded ${storagePath} (${(audio.length / 1024).toFixed(1)} KB)`);
    }

    replacements.push({ block, nextData: { ...data, src: publicUrl } });
    processed += 1;
  }

  if (replacements.length > 0) {
    let updatedSource = source;
    for (const replacement of [...replacements].reverse()) {
      updatedSource = replaceBlockJson(updatedSource, replacement.block, replacement.nextData);
    }
    await writeFile(filePath, updatedSource, "utf8");
  }

  return { slug, generated: processed, total: blocks.length };
}

async function main() {
  const files = (await readdir(BLOG_DIR))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(BLOG_DIR, f));

  console.log(`Blog dir: ${BLOG_DIR}`);
  console.log(`TTS model: ${MODEL}, default voice: ${DEFAULT_VOICE}`);
  console.log(`Supabase bucket: ${SUPABASE_AUDIO_BUCKET}/${SUPABASE_AUDIO_PREFIX}`);
  if (DRY) console.log("DRY_RUN — no API calls, storage writes, or MDX writes.");
  if (CHECK_ONLY) console.log("CHECK_ONLY — verifying that every published audio block is wired.");
  if (FORCE) console.log("FORCE — existing src values will be replaced.");
  if (ONLY) console.log(`Filtering to: ${[...ONLY].join(", ")}`);

  let totalGenerated = 0;
  for (const file of files) {
    try {
      const { slug, generated, total, skipped } = await processFile(file);
      if (skipped) continue;
      totalGenerated += generated ?? 0;
      if (total > 0) {
        console.log(`✓ ${slug}: ${generated}/${total} clips processed`);
      }
    } catch (err) {
      console.error(`✗ ${path.basename(file)}: ${err.message ?? err}`);
    }
  }
  if (CHECK_ONLY && totalGenerated > 0) {
    console.error(`\nAudio check failed: ${totalGenerated} published clip(s) have an empty src.`);
    process.exitCode = 1;
    return;
  }
  console.log(`\nDone. Generated/wired ${totalGenerated} audio clip(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
