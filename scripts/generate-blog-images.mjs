#!/usr/bin/env node
/**
 * generate-blog-images.mjs
 *
 * Сканирует все `content/blog/*.mdx` и находит блоки:
 *
 *   :::image
 *   { "alt": "...", "caption": "...", "prompt": "..." }
 *   :::
 *
 * Для каждого блока, у которого нет `src` (или указан пустой), вызывает
 * OpenAI Images API (gpt-image-1), сохраняет PNG в
 * `public/blog/<slug>/<n>-<short-hash>.png` и обновляет MDX, добавляя
 * `src` и `width/height` в JSON блока. Повторные запуски идемпотентны —
 * пропускают блоки с уже заполненным `src`.
 *
 * Запуск:
 *   OPENAI_API_KEY=... node scripts/generate-blog-images.mjs
 *   # или: vercel env pull .env.local && node scripts/generate-blog-images.mjs
 *
 * Опции через env:
 *   IMAGE_MODEL   — модель (по умолчанию "gpt-image-1")
 *   IMAGE_SIZE    — "1536x1024" (3:2, blog hero), "1024x1024", "1024x1536"
 *   IMAGE_QUALITY — "low" | "medium" | "high" (gpt-image-1) или "standard"
 *   DRY_RUN=1     — только показать, что будет сгенерировано
 *   ONLY=slug1,slug2 — ограничить генерацию указанными статьями
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PUBLIC_BLOG_DIR = path.join(process.cwd(), "public", "blog");

const MODEL = process.env.IMAGE_MODEL || "gpt-image-1";
const SIZE = process.env.IMAGE_SIZE || "1536x1024";
const QUALITY = process.env.IMAGE_QUALITY || "high";
const DRY = process.env.DRY_RUN === "1";
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;

if (!process.env.OPENAI_API_KEY && !DRY) {
  console.error("OPENAI_API_KEY is not set. Use DRY_RUN=1 to inspect work.");
  process.exit(1);
}

/**
 * Минимальный парсер `:::image ... :::` блоков. Возвращает массив блоков с
 * абсолютными byte-индексами в исходной строке — чтобы потом точечно
 * заменить JSON без переписывания всего файла.
 */
function findImageBlocks(source) {
  const blocks = [];
  const re = /^:::image\s*\n([\s\S]*?)\n^:::\s*$/gm;
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
      original: match[0],
      payloadStart: match.index + ":::image\n".length,
      payloadEnd: match.index + ":::image\n".length + payload.length,
    });
  }
  return blocks;
}

function shortHash(text, len = 8) {
  return crypto.createHash("sha1").update(text).digest("hex").slice(0, len);
}

function parseSize(size) {
  const [w, h] = size.split("x").map((n) => Number(n));
  return { width: w, height: h };
}

async function callOpenAIImage({ prompt }) {
  const body = {
    model: MODEL,
    prompt,
    size: SIZE,
    n: 1,
    // gpt-image-1 возвращает b64 по умолчанию; dall-e-3 нужно указать.
    ...(MODEL === "dall-e-3" ? { response_format: "b64_json", quality: "hd" } : {}),
    ...(MODEL === "gpt-image-1" ? { quality: QUALITY } : {}),
  };

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI Images ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const item = json.data?.[0];
  if (!item?.b64_json) {
    throw new Error("No b64_json in OpenAI Images response");
  }
  return Buffer.from(item.b64_json, "base64");
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

function replaceBlockJson(source, block, nextData) {
  const before = source.slice(0, block.start);
  const after = source.slice(block.end);
  const json = JSON.stringify(nextData, null, 2);
  return `${before}:::image\n${json}\n:::${after}`;
}

async function processFile(filePath) {
  const slug = path.basename(filePath, ".mdx");
  if (ONLY && !ONLY.has(slug)) return { slug, skipped: true };

  let source = await readFile(filePath, "utf8");
  const blocks = findImageBlocks(source);
  if (blocks.length === 0) return { slug, generated: 0, total: 0 };

  const { width, height } = parseSize(SIZE);
  const outDir = path.join(PUBLIC_BLOG_DIR, slug);
  let generatedCount = 0;
  let blockIndex = 0;

  for (const block of blocks) {
    blockIndex += 1;
    const data = block.data;
    if (data.src && data.src.trim().length > 0) continue;
    if (!data.prompt) {
      console.warn(`[${slug}] block ${blockIndex}: no prompt, skipped`);
      continue;
    }

    const hash = shortHash(`${slug}|${data.prompt}|${SIZE}|${MODEL}`);
    const filename = `${String(blockIndex).padStart(2, "0")}-${hash}.png`;
    const publicPath = `/blog/${slug}/${filename}`;
    const diskPath = path.join(outDir, filename);

    if (DRY) {
      console.log(`[DRY] ${slug} #${blockIndex} -> ${publicPath}`);
      console.log(`      prompt: ${data.prompt.slice(0, 100)}...`);
      generatedCount += 1;
      // DRY mode is read-only: log plan, never write src into MDX. Real run
      // creates the files at the same deterministic hash path so this is
      // safe to inspect without committing partial state.
      continue;
    }

    console.log(`[${slug}] generating image #${blockIndex} (${MODEL} ${SIZE})`);
    const buf = await callOpenAIImage({ prompt: data.prompt });
    await ensureDir(outDir);
    await writeFile(diskPath, buf);
    console.log(`  wrote ${diskPath} (${(buf.length / 1024).toFixed(1)} KB)`);

    const nextData = { ...data, src: publicPath, width, height };
    source = replaceBlockJson(source, block, nextData);
    await writeFile(filePath, source, "utf8");
    generatedCount += 1;

    // Файл изменился — пересканируем оставшиеся блоки в обновлённом виде.
    return processFile(filePath).then((nested) => ({
      slug,
      generated: generatedCount + (nested.generated ?? 0),
      total: blocks.length,
    }));
  }

  return { slug, generated: generatedCount, total: blocks.length };
}

async function main() {
  const files = (await readdir(BLOG_DIR))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(BLOG_DIR, f));

  console.log(`Blog dir: ${BLOG_DIR}`);
  console.log(`Model: ${MODEL}, size: ${SIZE}, quality: ${QUALITY}`);
  if (DRY) console.log("DRY_RUN — no API calls, no file writes for assets.");
  if (ONLY) console.log(`Filtering to: ${[...ONLY].join(", ")}`);

  let totalGenerated = 0;
  for (const file of files) {
    try {
      const { slug, generated, total, skipped } = await processFile(file);
      if (skipped) continue;
      totalGenerated += generated ?? 0;
      if (total > 0) {
        console.log(`✓ ${slug}: ${generated}/${total} images processed`);
      }
    } catch (err) {
      console.error(`✗ ${path.basename(file)}: ${err.message ?? err}`);
    }
  }
  console.log(`\nDone. Generated ${totalGenerated} new image(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
