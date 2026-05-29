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
 * Для каждого блока с пустым `src` вызывает OpenAI TTS API (tts-1),
 * сохраняет MP3 в `public/audio/blog/<slug>/<hash>.mp3` и обновляет MDX,
 * записывая `src` в JSON блока. Повторные запуски идемпотентны.
 *
 * Запуск:
 *   OPENAI_API_KEY=sk-... node scripts/generate-blog-audio.mjs
 *
 * Опции через env:
 *   OPENAI_TTS_MODEL — "tts-1" (по умолчанию) или "tts-1-hd"
 *   OPENAI_TTS_VOICE — "nova" (по умолчанию), "alloy", "echo", "fable",
 *                      "onyx", "shimmer"
 *   DRY_RUN=1        — только показать, что будет сгенерировано
 *   ONLY=slug1,slug2 — ограничить указанными статьями
 */

import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PUBLIC_AUDIO_DIR = path.join(process.cwd(), "public", "audio", "blog");

const MODEL = process.env.OPENAI_TTS_MODEL || "tts-1";
const DEFAULT_VOICE = process.env.OPENAI_TTS_VOICE || "nova";
const DRY = process.env.DRY_RUN === "1";
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;

if (!process.env.OPENAI_API_KEY && !DRY) {
  console.error("OPENAI_API_KEY is not set. Use DRY_RUN=1 to inspect.");
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

function shortHash(text, len = 10) {
  return crypto.createHash("sha1").update(text).digest("hex").slice(0, len);
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function callOpenAITTS({ text, voice }) {
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
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI TTS ${res.status}: ${errText.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
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

  let source = await readFile(filePath, "utf8");
  const blocks = findAudioBlocks(source);
  if (blocks.length === 0) return { slug, generated: 0, total: 0 };

  const outDir = path.join(PUBLIC_AUDIO_DIR, slug);
  let generated = 0;
  let blockIndex = 0;

  for (const block of blocks) {
    blockIndex += 1;
    const data = block.data;
    if (data.src && data.src.trim().length > 0) continue;
    const ttsText = data.ttsText || data.hanzi;
    if (!ttsText) {
      console.warn(`[${slug}] block ${blockIndex}: no ttsText/hanzi, skipped`);
      continue;
    }
    const voice = data.voice || DEFAULT_VOICE;
    const hash = shortHash(`${ttsText}|${voice}|${MODEL}`);
    const filename = `${hash}.mp3`;
    const publicPath = `/audio/blog/${slug}/${filename}`;
    const diskPath = path.join(outDir, filename);

    // Тот же hanzi на разных страницах рендерится в общий файл по hash —
    // но мы привязываем по slug для понятной структуры каталога.
    const alreadyOnDisk = await exists(diskPath);

    if (DRY) {
      console.log(`[DRY] ${slug} #${blockIndex} -> ${publicPath}  "${ttsText}"`);
      generated += 1;
      // DRY = read-only план. Реальный прогон ставит файл по тому же hash.
      continue;
    }

    if (alreadyOnDisk) {
      console.log(`[${slug}] reuse cached ${filename} for "${ttsText}"`);
    } else {
      console.log(`[${slug}] TTS #${blockIndex} (${voice}, ${MODEL}): "${ttsText}"`);
      const buf = await callOpenAITTS({ text: ttsText, voice });
      await mkdir(outDir, { recursive: true });
      await writeFile(diskPath, buf);
      console.log(`  wrote ${diskPath} (${(buf.length / 1024).toFixed(1)} KB)`);
    }

    const nextData = { ...data, src: publicPath };
    source = replaceBlockJson(source, block, nextData);
    await writeFile(filePath, source, "utf8");
    generated += 1;

    // После замены индексы старых блоков невалидны — рекурсивно обрабатываем
    // оставшиеся в свежепрочитанном файле.
    return processFile(filePath).then((nested) => ({
      slug,
      generated: generated + (nested.generated ?? 0),
      total: blocks.length,
    }));
  }

  return { slug, generated, total: blocks.length };
}

async function main() {
  const files = (await readdir(BLOG_DIR))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(BLOG_DIR, f));

  console.log(`Blog dir: ${BLOG_DIR}`);
  console.log(`TTS model: ${MODEL}, default voice: ${DEFAULT_VOICE}`);
  if (DRY) console.log("DRY_RUN — no API calls, no asset writes.");
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
  console.log(`\nDone. Generated/wired ${totalGenerated} audio clip(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
