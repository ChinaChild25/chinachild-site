/**
 * One-off (idempotent) downscaler for the HSK-test illustrations in
 * public/hsk-test/. The source art was exported at print resolution
 * (1500–3024px) but is rendered at ≤ 562px CSS, so Lighthouse flagged ~1 MB of
 * wasted image bytes on every HSK-test page and LCP ballooned to 10 s on
 * Slow 4G. We downscale each asset to ~2× its largest CSS render size.
 *
 * Safe to re-run: an asset already at/under its target width is skipped.
 *
 *   node scripts/optimize-hsk-test-images.mjs
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public/hsk-test");

/** target = max edge in px; quality = webp/png quality. */
const TARGETS = [
  // Level art — shared by the per-level hero (≤ ~480px tall) and the 500px
  // landing cards. Square objects → 720; hsk-2 is the level-page LCP → a touch
  // larger/cleaner; hsk-3 is the wide tilted spiral (1.748:1) → 1280 long edge.
  { file: "hsk-1.webp", width: 720 },
  { file: "hsk-2.webp", width: 760, quality: 82 },
  { file: "hsk-3.webp", width: 1280 },
  { file: "hsk-4.webp", width: 720 },
  { file: "hsk-4-dark.webp", width: 720 },
  // «Что дальше» ladder — rendered ≤ ~930px on desktop, far below the fold.
  { file: "hsk-ladder-1.webp", width: 1200 },
  { file: "hsk-ladder-2.webp", width: 1200 },
  { file: "hsk-ladder-3.webp", width: 1200 },
  { file: "hsk-ladder-4.webp", width: 1200 },
  // Landing decoration (below the fold, lazy-loaded).
  { file: "hero-people.webp", width: 1200, quality: 82 },
  { file: "rings.webp", width: 1000 },
  { file: "result-photo.webp", width: 700 },
  // Explain-card badges — rendered 114×60.
  { file: "icon1.png", width: 240 },
  { file: "icon2.png", width: 240 },
  { file: "icon3.png", width: 240 },
];

let savedTotal = 0;

for (const { file, width, quality = 80 } of TARGETS) {
  const fp = path.join(DIR, file);
  const before = (await stat(fp)).size;
  const input = await readFile(fp);
  const meta = await sharp(input).metadata();

  if (meta.width <= width) {
    console.log(`skip  ${file} (${meta.width}px ≤ ${width}px target)`);
    continue;
  }

  let pipe = sharp(input).resize({ width, withoutEnlargement: true });
  pipe = file.endsWith(".png")
    ? pipe.png({ quality, compressionLevel: 9, palette: true })
    : pipe.webp({ quality, effort: 6 });

  const output = await pipe.toBuffer();
  await writeFile(fp, output);

  const saved = before - output.length;
  savedTotal += saved;
  const kb = (n) => `${(n / 1024).toFixed(1)} KiB`;
  console.log(
    `done  ${file}: ${meta.width}px → ${width}px, ${kb(before)} → ${kb(output.length)}  (−${kb(saved)})`,
  );
}

console.log(`\nTotal saved: ${(savedTotal / 1024).toFixed(1)} KiB`);
