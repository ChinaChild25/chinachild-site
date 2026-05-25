// One-off generator: renders app/icon0.svg into a multi-size favicon.ico
// (PNG-embedded variant, supported by all modern browsers and Yandex).
//
// Run: node scripts/generate-favicon.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SIZES = [48, 32, 16];

const svg = await readFile(join(root, "app/icon0.svg"));

const pngs = await Promise.all(
  SIZES.map(async (size) => {
    const buf = await sharp(svg, { density: 384 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    return { size, buf };
  }),
);

// ICO layout: ICONDIR (6 bytes) + ICONDIRENTRY * N (16 bytes each) + image data.
const headerSize = 6 + 16 * pngs.length;
let offset = headerSize;
const entries = Buffer.alloc(headerSize);
entries.writeUInt16LE(0, 0); // reserved
entries.writeUInt16LE(1, 2); // type = icon
entries.writeUInt16LE(pngs.length, 4); // count

pngs.forEach(({ size, buf }, i) => {
  const o = 6 + i * 16;
  entries.writeUInt8(size === 256 ? 0 : size, o + 0); // width
  entries.writeUInt8(size === 256 ? 0 : size, o + 1); // height
  entries.writeUInt8(0, o + 2); // palette colors
  entries.writeUInt8(0, o + 3); // reserved
  entries.writeUInt16LE(1, o + 4); // color planes
  entries.writeUInt16LE(32, o + 6); // bits per pixel
  entries.writeUInt32LE(buf.length, o + 8); // image size
  entries.writeUInt32LE(offset, o + 12); // image offset
  offset += buf.length;
});

const ico = Buffer.concat([entries, ...pngs.map((p) => p.buf)]);
const out = join(root, "app/favicon.ico");
await writeFile(out, ico);

console.log(`Wrote ${out} (${ico.length} bytes, sizes: ${SIZES.join(", ")})`);
