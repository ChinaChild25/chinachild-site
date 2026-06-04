import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = normalizeOrigin(process.env.AUDIT_BASE_URL ?? "https://chinachild-site.vercel.app");
const EXPECTED_SITE_URL = normalizeOrigin(process.env.EXPECTED_SITE_URL ?? BASE_URL);
const REPORT_PATH = path.join(process.cwd(), "docs/cutover/production-readiness-results.md");

const PAGES = [
  { path: "/", label: "home" },
  { path: "/courses", label: "courses" },
  { path: "/price", label: "price" },
  { path: "/repetitor-kitayskogo", label: "repetitor" },
  { path: "/learn/hsk", label: "hsk hub" },
  { path: "/chinese/hsk-test", label: "hsk test" },
  { path: "/chinese/hsk-test/level-1", label: "hsk test level" },
  { path: "/grammar", label: "grammar" },
  { path: "/dictionary", label: "dictionary" },
  { path: "/dictionary/hsk/new-hsk/1", label: "dictionary hsk level" },
  { path: "/blog", label: "blog" },
  { path: "/blog/chinese-for-beginners-guide", label: "blog article" },
  { path: "/glossary", label: "glossary" },
  { path: "/glossary/hsk", label: "glossary item" },
  { path: "/dictionary/word/ni-hao", label: "dictionary word" },
  { path: "/free-trial", label: "lead page" },
  { path: "/__cutover-smoke-missing-page__", label: "404 smoke", expectStatus: 404 },
];

const BAD_DOMAIN_PATTERNS = [
  /localhost/i,
  /127\.0\.0\.1/i,
  /chinachild-sandbox\.vercel\.app/i,
  /app\.chinachild\.ru/i,
  /tilda\.ws/i,
];

function normalizeOrigin(value) {
  return value.replace(/\/+$/, "");
}

async function fetchUrl(url, options = {}) {
  return fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: { "User-Agent": "chinachild-cutover-production-audit/1.0" },
    ...options,
  });
}

function getAttr(tag, attr) {
  const match = tag.match(new RegExp(`\\b${attr}=(["'])(.*?)\\1`, "i"));
  return match?.[2] ?? "";
}

function findMeta(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (getAttr(tag, key).toLowerCase() === value.toLowerCase()) {
      return getAttr(tag, "content");
    }
  }
  return "";
}

function findCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (getAttr(tag, "rel").toLowerCase() === "canonical") {
      return getAttr(tag, "href");
    }
  }
  return "";
}

function findTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
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

function asArray(value) {
  return Array.isArray(value) ? value : [value];
}

function hasType(node, type) {
  if (!node || typeof node !== "object") return false;
  return asArray(node["@type"]).includes(type);
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

function collectLinks(html) {
  const links = new Set();
  const regex = /<a\b[^>]*href=(["'])(.*?)\1/gi;
  let match;
  while ((match = regex.exec(html))) {
    links.add(match[2]);
  }
  return [...links];
}

function isBadDomain(value) {
  return BAD_DOMAIN_PATTERNS.some((pattern) => pattern.test(value));
}

function isAbsoluteHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function mdEscape(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

async function checkOgImage(url) {
  try {
    const response = await fetchUrl(url);
    return response.status >= 200 && response.status < 300
      ? "PASS"
      : `FAIL ${response.status}`;
  } catch (error) {
    return `FAIL ${error instanceof Error ? error.message : String(error)}`;
  }
}

function shouldCheckInternalHref(href) {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  if (href.startsWith("/api/") || href.startsWith("/_next/")) return false;
  if (href.includes("#")) href = href.split("#")[0];
  if (!href || href === "/") return false;
  return !/\.(?:png|jpe?g|webp|svg|ico|css|js|xml|txt|pdf|woff2?)$/i.test(href);
}

async function auditPage(page, internalLinks) {
  const url = `${BASE_URL}${page.path}`;
  const notes = [];
  let html = "";
  let status = "";
  let result = "FAIL";
  let ogImageCheck = "";

  try {
    const response = await fetchUrl(url);
    status = response.status;
    html = await response.text();

    const expectedStatus = page.expectStatus ?? 200;
    if (response.status !== expectedStatus) {
      notes.push(`expected HTTP ${expectedStatus}, got ${response.status}`);
    }

    if (page.expectStatus === 404) {
      result = notes.length === 0 ? "PASS" : "FAIL";
      return { ...page, result, status, canonical: "", title: "", ogImageCheck: "", notes };
    }

    const title = findTitle(html);
    const description = findMeta(html, "name", "description");
    const canonical = findCanonical(html);
    const ogTitle = findMeta(html, "property", "og:title");
    const ogDescription = findMeta(html, "property", "og:description");
    const ogUrl = findMeta(html, "property", "og:url");
    const ogImage = findMeta(html, "property", "og:image");
    const twitterCard = findMeta(html, "name", "twitter:card");
    const robots = findMeta(html, "name", "robots");

    for (const [label, value] of Object.entries({
      title,
      description,
      canonical,
      ogTitle,
      ogDescription,
      ogUrl,
      ogImage,
      twitterCard,
    })) {
      if (!value) notes.push(`missing ${label}`);
      if (/undefined|\[object Object\]/i.test(value)) notes.push(`bad metadata value in ${label}`);
      if (isBadDomain(value)) notes.push(`bad domain in ${label}: ${value}`);
    }

    if (!isAbsoluteHttps(canonical)) notes.push("canonical is not absolute https");
    if (canonical && !canonical.startsWith(EXPECTED_SITE_URL)) {
      notes.push(`canonical origin differs from expected ${EXPECTED_SITE_URL}`);
    }
    if (ogUrl && !isAbsoluteHttps(ogUrl)) notes.push("og:url is not absolute https");
    if (ogImage && !isAbsoluteHttps(ogImage)) notes.push("og:image is not absolute https");
    if (robots && /noindex/i.test(robots)) notes.push("page has noindex robots meta");

    const jsonLdScripts = findJsonLd(html);
    if (jsonLdScripts.length === 0) {
      notes.push("missing JSON-LD");
    }

    const jsonLdNodes = [];
    for (const [index, raw] of jsonLdScripts.entries()) {
      if (/undefined|\[object Object\]|:\s*null\b/i.test(raw)) {
        notes.push(`bad JSON-LD sentinel in script ${index + 1}`);
      }
      try {
        const parsed = JSON.parse(raw);
        jsonLdNodes.push(...collectJsonLdNodes(parsed));
        const serialized = JSON.stringify(parsed);
        if (/"@type":"FAQPage"/.test(serialized) && !/Частые вопросы|FAQ/i.test(html)) {
          notes.push("FAQPage JSON-LD found without visible FAQ text");
        }
      } catch {
        notes.push(`invalid JSON-LD in script ${index + 1}`);
      }
    }

    const faqNodes = jsonLdNodes.filter((node) => hasType(node, "FAQPage"));
    if (faqNodes.length > 1) {
      notes.push(`duplicate FAQPage JSON-LD nodes: ${faqNodes.length}`);
    }

    if (isBadDomain(html)) {
      notes.push("HTML contains localhost, sandbox, app.chinachild.ru, or Tilda domain");
    }

    if (/https:\/\/chinachild-sandbox\.vercel\.app|https:\/\/app\.chinachild\.ru/i.test(html)) {
      notes.push("platform link points to stale domain");
    }

    const links = collectLinks(html);
    for (const href of links) {
      if (/https:\/\/(?:app\.chinachild\.ru|chinachild-sandbox\.vercel\.app)/i.test(href)) {
        notes.push(`stale platform href: ${href}`);
      }
      if (/^https:\/\/my\.chinachild\.ru/i.test(href)) {
        continue;
      }
      if (shouldCheckInternalHref(href)) {
        internalLinks.add(href.split("#")[0]);
      }
    }

    if (ogImage) {
      ogImageCheck = await checkOgImage(new URL(ogImage, BASE_URL).toString());
      if (!ogImageCheck.startsWith("PASS")) notes.push(`og:image ${ogImageCheck}`);
    }

    result = notes.length === 0 ? "PASS" : "FAIL";
    return { ...page, result, status, canonical, title, ogImageCheck, notes };
  } catch (error) {
    notes.push(error instanceof Error ? error.message : String(error));
    return { ...page, result, status, canonical: "", title: "", ogImageCheck, notes };
  }
}

async function auditInternalLinks(internalLinks) {
  const rows = [];
  for (const href of [...internalLinks].sort()) {
    try {
      const response = await fetchUrl(`${BASE_URL}${href}`);
      rows.push({
        href,
        status: response.status,
        result: response.status >= 200 && response.status < 400 ? "PASS" : "FAIL",
      });
    } catch (error) {
      rows.push({
        href,
        status: "",
        result: "FAIL",
        notes: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return rows;
}

async function auditSitemapAndRobots() {
  const rows = [];

  for (const sitemapPath of ["/sitemap.xml", "/sitemap-feeds.xml", "/sitemap-store.xml"]) {
    const sitemap = await fetchUrl(`${BASE_URL}${sitemapPath}`);
    const sitemapText = await sitemap.text();
    const contentType = sitemap.headers.get("content-type") ?? "";
    const hasExpectedUrls = sitemapText.includes(EXPECTED_SITE_URL);
    const isXml = /application\/xml|text\/xml/i.test(contentType);
    rows.push({
      item: sitemapPath,
      status: sitemap.status,
      result:
        sitemap.status === 200 && hasExpectedUrls && isXml
          ? "PASS"
          : "FAIL",
      notes:
        sitemap.status === 200 && hasExpectedUrls && isXml
          ? "contains expected site URLs"
          : [
              !hasExpectedUrls ? `does not contain ${EXPECTED_SITE_URL}` : "",
              !isXml ? `content-type is ${contentType || "(missing)"}` : "",
            ].filter(Boolean).join("; "),
    });
  }

  const robots = await fetchUrl(`${BASE_URL}/robots.txt`);
  const robotsText = await robots.text();
  rows.push({
    item: "/robots.txt",
    status: robots.status,
    result:
      robots.status === 200 && robotsText.includes(`Sitemap: ${EXPECTED_SITE_URL}/sitemap.xml`)
        ? "PASS"
        : "FAIL",
    notes: robotsText.includes(`Sitemap: ${EXPECTED_SITE_URL}/sitemap.xml`)
      ? "points at expected sitemap"
      : "missing expected sitemap directive",
  });

  return rows;
}

async function auditVerificationFiles() {
  const publicDir = path.join(process.cwd(), "public");
  const files = (await readdir(publicDir)).filter((file) =>
    /^(google.*\.html|yandex.*\.html|.*[a-f0-9]{16,}.*\.txt)$/i.test(file),
  );
  const rows = [];

  for (const file of files) {
    const response = await fetchUrl(`${BASE_URL}/${file}`);
    rows.push({
      item: `/${file}`,
      status: response.status,
      result: response.status === 200 ? "PASS" : "FAIL",
      notes: response.status === 200 ? "available" : "not available",
    });
  }

  return rows;
}

function renderReport({ pageRows, internalRows, sitemapRows, verificationRows }) {
  const allRows = [...pageRows, ...internalRows, ...sitemapRows, ...verificationRows];
  const failed = allRows.filter((row) => row.result !== "PASS");

  return [
    "# Production Readiness Results",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${BASE_URL}`,
    `Expected metadata origin: ${EXPECTED_SITE_URL}`,
    `Result: ${failed.length === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Page Checks",
    "",
    "| Result | Path | HTTP | Title | Canonical | OG image | Notes |",
    "| --- | --- | ---: | --- | --- | --- | --- |",
    ...pageRows.map((row) =>
      `| ${row.result} | ${row.path} | ${row.status} | ${mdEscape(row.title)} | ${mdEscape(row.canonical)} | ${mdEscape(row.ogImageCheck)} | ${mdEscape(row.notes.join("; ") || "ok")} |`,
    ),
    "",
    "## Sitemap, Robots, Verification",
    "",
    "| Result | Item | HTTP | Notes |",
    "| --- | --- | ---: | --- |",
    ...[...sitemapRows, ...verificationRows].map((row) =>
      `| ${row.result} | ${row.item} | ${row.status} | ${mdEscape(row.notes)} |`,
    ),
    "",
    "## Internal Link Smoke",
    "",
    "| Result | Href | HTTP | Notes |",
    "| --- | --- | ---: | --- |",
    ...internalRows.map((row) =>
      `| ${row.result} | ${row.href} | ${row.status} | ${mdEscape(row.notes ?? "ok")} |`,
    ),
    "",
  ].join("\n");
}

const internalLinks = new Set();
const pageRows = [];

for (const page of PAGES) {
  pageRows.push(await auditPage(page, internalLinks));
}

const [internalRows, sitemapRows, verificationRows] = await Promise.all([
  auditInternalLinks(internalLinks),
  auditSitemapAndRobots(),
  auditVerificationFiles(),
]);

const report = renderReport({ pageRows, internalRows, sitemapRows, verificationRows });
await writeFile(REPORT_PATH, report);
console.log(report);

if (report.includes("| FAIL |")) {
  process.exitCode = 1;
}
