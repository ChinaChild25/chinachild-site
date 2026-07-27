import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const APP_BUILD_DIR = process.env.JSONLD_BUILD_APP_DIR
  ? path.resolve(process.env.JSONLD_BUILD_APP_DIR)
  : path.join(process.cwd(), ".next/server/app");
const SNAPSHOT_PATH = path.join(process.cwd(), ".generated/public-content-snapshot.json");
const PRERENDER_MANIFEST_PATH = path.join(process.cwd(), ".next/prerender-manifest.json");
const STATIC_SOURCE_FILES = [
  "app/dictionary/page.tsx",
  "app/dictionary/word/[slug]/page.tsx",
  "app/dictionary/hsk/page.tsx",
  "app/dictionary/hsk/[version]/page.tsx",
  "app/dictionary/hsk/[version]/[level]/page.tsx",
  "app/grammar/page.tsx",
  "app/grammar/[slug]/page.tsx",
  "app/grammar/tags/page.tsx",
  "app/grammar/tags/[slug]/page.tsx",
  "app/grammar/sections/[slug]/page.tsx",
];

async function walkHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkHtmlFiles(entryPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function findJsonLd(html) {
  const scripts = [];
  const regex = /<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html))) {
    scripts.push(match[2].trim());
  }
  return scripts;
}

function collectJsonLdNodes(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectJsonLdNodes(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const nodes = [value];
  if (Array.isArray(value["@graph"])) {
    nodes.push(...value["@graph"].flatMap((item) => collectJsonLdNodes(item)));
  }

  return nodes;
}

function hasType(node, type) {
  const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
  return types.includes(type);
}

function routeFromFile(file) {
  const relative = path.relative(APP_BUILD_DIR, file);
  const route = relative
    .replace(/\.html$/, "")
    .replace(/(^|\/)index$/, "")
    .replace(/\\/g, "/");
  return route ? `/${route}` : "/";
}

const files = await walkHtmlFiles(APP_BUILD_DIR);
const issues = [];
let checkedPages = 0;
let pagesWithFaq = 0;

for (const file of files) {
  checkedPages += 1;
  const html = await readFile(file, "utf8");
  const scripts = findJsonLd(html);
  const nodes = [];

  for (const [index, raw] of scripts.entries()) {
    try {
      nodes.push(...collectJsonLdNodes(JSON.parse(raw)));
    } catch (error) {
      issues.push(
        `${routeFromFile(file)}: invalid JSON-LD in script ${index + 1}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  const faqCount = nodes.filter((node) => hasType(node, "FAQPage")).length;
  if (faqCount > 0) {
    pagesWithFaq += 1;
  }
  if (faqCount > 1) {
    issues.push(`${routeFromFile(file)}: duplicate FAQPage JSON-LD nodes: ${faqCount}`);
  }
}

const snapshot = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
const prerenderManifest = JSON.parse(await readFile(PRERENDER_MANIFEST_PATH, "utf8"));
const staticPrefixes = ["/dictionary", "/grammar"];
const staticRoutes = Object.entries(prerenderManifest.routes).filter(([route]) =>
  staticPrefixes.some((prefix) => route === prefix || route.startsWith(`${prefix}/`)),
);
for (const [route, config] of staticRoutes) {
  if (typeof config.initialRevalidateSeconds === "number") {
    issues.push(`${route}: numeric revalidation ${config.initialRevalidateSeconds}`);
  }
}

for (const relativePath of STATIC_SOURCE_FILES) {
  const source = await readFile(path.join(process.cwd(), relativePath), "utf8");
  if (/export\s+const\s+revalidate\s*=\s*\d+/u.test(source)) {
    issues.push(`${relativePath}: numeric route revalidation`);
  }
}

const dictionarySource = await readFile(
  path.join(process.cwd(), "lib/content/dictionary.ts"),
  "utf8",
);
const staticDictionarySource = dictionarySource.split("// ---- Global dictionary search ----")[0];
const grammarSource = await readFile(path.join(process.cwd(), "lib/content/grammar.ts"), "utf8");
if (/^\s*\.from\("/mu.test(staticDictionarySource)) {
  issues.push("static dictionary loaders contain a live Supabase fetch");
}
if (/^\s*\.from\("/mu.test(grammarSource) || grammarSource.includes("getPublicSupabaseClient")) {
  issues.push("static grammar loaders contain a live Supabase fetch");
}
if (/revalidate\s*:\s*\d+/u.test(staticDictionarySource) || /revalidate\s*:\s*\d+/u.test(grammarSource)) {
  issues.push("static content loader contains numeric revalidation");
}

const generatedWordRoutes = files
  .map(routeFromFile)
  .filter((route) => route.startsWith("/dictionary/word/"));
if (generatedWordRoutes.length !== snapshot.publicWordCount) {
  issues.push(
    `generated word route count ${generatedWordRoutes.length} does not match snapshot ${snapshot.publicWordCount}`,
  );
}

if (issues.length > 0) {
  console.error("JSON-LD audit failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(
  `JSON-LD/static audit passed: ${checkedPages} HTML pages, ${pagesWithFaq} FAQ pages, ` +
  `${generatedWordRoutes.length} word routes, ${staticRoutes.length} static dictionary/grammar routes.`,
);
