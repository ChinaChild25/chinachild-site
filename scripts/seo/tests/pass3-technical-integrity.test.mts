import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { COMMERCIAL_OWNERSHIP } from "../commercial-evidence.mts";
import {
  DEFAULT_ENHANCED_PATHS,
  parseCsv,
} from "../yandex-enhanced-export.mts";

const repositoryRoot = process.cwd();

async function source(relativePath: string): Promise<string> {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function filesUnder(directory: string): Promise<string[]> {
  const root = path.join(repositoryRoot, directory);
  const entries = await readdir(root, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const relative = path.join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(relative) : [relative];
      }),
    )
  ).flat();
}

test("commercial ownership and enhanced-export defaults use confirmed canonical routes", () => {
  const ownershipRoutes: readonly string[] = COMMERCIAL_OWNERSHIP.map(
    ({ route }) => route,
  );
  const enhancedPaths: readonly string[] = DEFAULT_ENHANCED_PATHS;
  assert.ok(ownershipRoutes.includes("/repetitor-kitayskogo"));
  assert.ok(ownershipRoutes.includes("/courses/chinese-for-adults"));
  assert.ok(ownershipRoutes.includes("/courses/chinese-for-kids"));
  assert.ok(!ownershipRoutes.includes("/repetitor"));
  assert.ok(!ownershipRoutes.includes("/courses/adults"));
  assert.ok(!ownershipRoutes.includes("/courses/kids"));

  assert.ok(enhancedPaths.includes("/repetitor-kitayskogo"));
  assert.ok(!enhancedPaths.includes("/repetitor"));
  assert.ok(!enhancedPaths.includes("/courses/adults"));
  assert.ok(!enhancedPaths.includes("/courses/kids"));
});

test("redirect inventory has no chains and preserves evidence-backed legacy targets", async () => {
  const rows = parseCsv(await source("docs/cutover/redirect-map.csv"));
  const header = rows[0];
  const oldPathIndex = header.indexOf("old_path");
  const newPathIndex = header.indexOf("new_path");
  const redirects = new Map(
    rows.slice(1).map((row) => [row[oldPathIndex], row[newPathIndex]]),
  );

  assert.equal(
    redirects.get("/kitayskiy-yazyk-s-nulya"),
    "/learn/beginners",
  );
  assert.equal(redirects.get("/kursy-kitayskogo-yazyka"), "/courses");
  assert.equal(
    redirects.get("/kitayskiy-yazyk-dlya-detey"),
    "/courses/chinese-for-kids",
  );
  assert.equal(redirects.get("/test-hsk-1"), "/chinese/hsk-test/level-1");

  const chains = [...redirects].filter(
    ([, destination]) => destination && redirects.has(destination),
  );
  assert.deepEqual(chains, []);
});

test("/zayavka stays operational but is a noindex canonical alias outside discovery feeds", async () => {
  const [page, sitemap, robots, indexNow] = await Promise.all([
    source("app/zayavka/page.tsx"),
    source("app/sitemap-pages.xml/route.ts"),
    source("app/robots.txt/route.ts"),
    source("app/api/indexnow/route.ts"),
  ]);

  assert.match(page, /canonicalPath:\s*"\/free-trial"/);
  assert.match(page, /index:\s*false/);
  assert.match(page, /follow:\s*true/);
  assert.doesNotMatch(sitemap, /absoluteUrl\("\/zayavka"\)/);
  assert.doesNotMatch(robots, /^\s*"\/zayavka",?$/m);
  assert.doesNotMatch(indexNow, /^\s*"\/zayavka",?$/m);
});

test("city-specific schema represents online service without invented branches or addresses", async () => {
  const schema = await source("lib/schema.ts");
  const start = schema.indexOf("export function createCityServiceSchema");
  const end = schema.indexOf(
    "// ---------------------------------------------------------------------------",
    start,
  );
  const citySchema = schema.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(citySchema, /"@type":\s*"Service"/);
  assert.match(citySchema, /serviceType:\s*"Онлайн-обучение китайскому языку"/);
  assert.match(citySchema, /"@type":\s*"City"/);
  assert.doesNotMatch(citySchema, /LocalBusiness|PostalAddress|addressLocality/);
});

test("confirmed glossary 404 destinations and literal preload paths are absent from application sources", async () => {
  const hskk = await source("content/blog/hskk-podgotovka-ustnyy-ekzamen.mdx");
  assert.doesNotMatch(hskk, /\/glossary\/(?:chinesetest|hanban)\b/);
  assert.match(hskk, /\[Hanban\]\(\/glossary\/hsk\)/);
  assert.match(hskk, /\[chinesetest\.cn\]\(\/glossary\/hsk\)/);

  const applicationFiles = (
    await Promise.all(
      ["app", "components", "lib", "content"].map((directory) =>
        filesUnder(directory),
      ),
    )
  ).flat();
  const offenders: string[] = [];
  for (const filename of applicationFiles) {
    if (!/\.(?:ts|tsx|md|mdx|json|txt)$/.test(filename)) continue;
    if ((await source(filename)).includes("/preload")) offenders.push(filename);
  }
  assert.deepEqual(offenders, []);
});

test("rendered preload links have an href or a responsive-image source set", async (t) => {
  const buildRoot = path.join(repositoryRoot, ".next/server/app");
  try {
    if (!(await stat(buildRoot)).isDirectory()) {
      t.skip("No local Next.js build output");
      return;
    }
  } catch {
    t.skip("No local Next.js build output");
    return;
  }

  const htmlFiles = (await filesUnder(".next/server/app")).filter((filename) =>
    filename.endsWith(".html"),
  );
  const invalid: string[] = [];
  for (const filename of htmlFiles) {
    const html = await source(filename);
    const tags = html.match(/<link\b[^>]*\brel=(["'])preload\1[^>]*>/gi) ?? [];
    for (const tag of tags) {
      if (!/\bhref=(["'])[^"']+\1/i.test(tag) && !/\bimagesrcset=/i.test(tag)) {
        invalid.push(`${filename}: ${tag}`);
      }
    }
  }
  assert.deepEqual(invalid, []);
});

test("rendered page sitemaps contain unique production canonicals only", async (t) => {
  const filenames = [
    ".next/server/app/sitemap-pages.xml.body",
    ".next/server/app/sitemap-blog.xml.body",
  ];
  try {
    await Promise.all(filenames.map((filename) => stat(filename)));
  } catch {
    t.skip("No local Next.js sitemap output");
    return;
  }

  const urls = (
    await Promise.all(
      filenames.map(async (filename) => {
        const xml = await source(filename);
        return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
      }),
    )
  ).flat();
  assert.ok(urls.length > 0);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(
    urls.every(
      (url) =>
        url === "https://chinachild.ru" ||
        url.startsWith("https://chinachild.ru/"),
    ),
  );
  assert.ok(urls.includes("https://chinachild.ru/repetitor-kitayskogo"));
  assert.ok(urls.includes("https://chinachild.ru/courses/chinese-for-adults"));
  assert.ok(urls.includes("https://chinachild.ru/courses/chinese-for-kids"));
  assert.ok(!urls.includes("https://chinachild.ru/zayavka"));
  assert.ok(!urls.includes("https://chinachild.ru/repetitor"));
  assert.ok(!urls.includes("https://chinachild.ru/courses/adults"));
  assert.ok(!urls.includes("https://chinachild.ru/courses/kids"));
});

test("production origin fallback and protected-page baseline remain intact", async () => {
  const config = await source("lib/site-config.ts");
  assert.match(
    config,
    /const DEFAULT_SITE_URL = "https:\/\/chinachild\.ru";/,
  );
  assert.doesNotMatch(
    config,
    /const DEFAULT_SITE_URL = "https:\/\/chinachild-site\.vercel\.app";/,
  );

  const protectedRows = parseCsv(
    await source("scripts/seo/config/protected-pages.csv"),
  );
  assert.equal(protectedRows.length - 1, 60);
  assert.ok(
    protectedRows
      .slice(1)
      .some((row) => row[0] === "https://chinachild.ru/courses/hsk-preparation"),
  );
});
