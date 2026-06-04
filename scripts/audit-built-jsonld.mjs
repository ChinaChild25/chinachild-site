import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const APP_BUILD_DIR = process.env.JSONLD_BUILD_APP_DIR
  ? path.resolve(process.env.JSONLD_BUILD_APP_DIR)
  : path.join(process.cwd(), ".next/server/app");

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

if (issues.length > 0) {
  console.error("JSON-LD audit failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(`JSON-LD audit passed: ${checkedPages} HTML pages checked, ${pagesWithFaq} pages with FAQPage.`);
