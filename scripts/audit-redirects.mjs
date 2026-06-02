import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = normalizeOrigin(process.env.AUDIT_BASE_URL ?? "https://chinachild-site.vercel.app");
const REPORT_PATH = path.join(process.cwd(), "docs/cutover/redirect-check-results.md");
const CSV_PATH = path.join(process.cwd(), "docs/cutover/redirect-map.csv");

function normalizeOrigin(value) {
  return value.replace(/\/+$/, "");
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
      continue;
    }

    cell += char;
  }

  cells.push(cell);
  return cells;
}

function parseRedirectMap(csv) {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  const expectedHeader = "old_path,old_url,new_path,new_url,status,confidence,reason";
  if (header !== expectedHeader) {
    throw new Error(`Unexpected CSV header in ${CSV_PATH}`);
  }

  return lines.filter(Boolean).map((line, index) => {
    const [oldPath, oldUrl, newPath, newUrl, status, confidence, reason] = parseCsvLine(line);
    if (!oldPath.startsWith("/")) {
      throw new Error(`Row ${index + 2}: old_path must start with /`);
    }
    return { oldPath, oldUrl, newPath, newUrl, status, confidence, reason };
  });
}

function stripTrailingSlash(value) {
  if (value === "https://chinachild.ru/" || value === `${BASE_URL}/`) {
    return value.slice(0, -1);
  }
  return value.length > 1 ? value.replace(/\/+$/, "") : value;
}

function isExternalTarget(row) {
  if (!row.newUrl) return false;
  const url = new URL(row.newUrl);
  return url.hostname !== "chinachild.ru" && url.hostname !== "www.chinachild.ru";
}

function expectedTargetUrl(row) {
  if (isExternalTarget(row)) {
    return row.newUrl;
  }
  return `${BASE_URL}${row.newPath || "/"}`;
}

function locationMatches(location, row) {
  if (!location) return false;

  if (isExternalTarget(row)) {
    try {
      return stripTrailingSlash(new URL(location).toString()) === stripTrailingSlash(row.newUrl);
    } catch {
      return false;
    }
  }

  const expectedPath = row.newPath || "/";
  const expectedAbsolute = `${BASE_URL}${expectedPath}`;
  const expectedCutover = row.newUrl || `https://chinachild.ru${expectedPath === "/" ? "" : expectedPath}`;

  if (location === expectedPath) return true;

  try {
    const actual = new URL(location, BASE_URL);
    return [expectedAbsolute, expectedCutover]
      .map(stripTrailingSlash)
      .includes(stripTrailingSlash(actual.toString()));
  } catch {
    return false;
  }
}

async function fetchManual(url) {
  return fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: { "User-Agent": "chinachild-cutover-redirect-audit/1.0" },
  });
}

function mdEscape(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

async function auditRow(row) {
  const requestUrl = `${BASE_URL}${row.oldPath}`;
  const targetUrl = expectedTargetUrl(row);
  const notes = [];

  let status = "FAIL";
  let httpStatus = "";
  let location = "";
  let targetStatus = "";

  try {
    const response = await fetchManual(requestUrl);
    httpStatus = response.status;
    location = response.headers.get("location") ?? "";

    if (![301, 308].includes(response.status)) {
      notes.push(`expected 301/308, got ${response.status}`);
    }

    if (!locationMatches(location, row)) {
      notes.push(`Location mismatch; expected ${row.newPath || row.newUrl}`);
    }

    if (stripTrailingSlash(new URL(targetUrl).toString()) === stripTrailingSlash(requestUrl)) {
      notes.push("redirect loop");
    }

    const finalResponse = await fetchManual(targetUrl);
    targetStatus = finalResponse.status;

    if (finalResponse.status >= 300 && finalResponse.status < 400) {
      notes.push(`target redirects again to ${finalResponse.headers.get("location") ?? "(missing Location)"}`);
    } else if (finalResponse.status < 200 || finalResponse.status >= 300) {
      notes.push(`target expected 200, got ${finalResponse.status}`);
    }

    if (notes.length === 0) {
      status = "PASS";
    }
  } catch (error) {
    notes.push(error instanceof Error ? error.message : String(error));
  }

  return {
    status,
    oldPath: row.oldPath,
    expected: row.newPath || row.newUrl,
    httpStatus,
    location,
    targetStatus,
    notes: notes.join("; ") || "ok",
  };
}

function renderReport(rows) {
  const passed = rows.filter((row) => row.status === "PASS").length;
  const failed = rows.length - passed;

  return [
    "# Redirect Check Results",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${BASE_URL}`,
    `Redirects checked: ${rows.length}`,
    `Passed: ${passed}`,
    `Failed: ${failed}`,
    "",
    "| Result | Old path | HTTP | Location | Target HTTP | Notes |",
    "| --- | --- | ---: | --- | ---: | --- |",
    ...rows.map((row) =>
      [
        row.status,
        row.oldPath,
        row.httpStatus,
        mdEscape(row.location),
        row.targetStatus,
        mdEscape(row.notes),
      ].join(" | "),
    ).map((line) => `| ${line} |`),
    "",
  ].join("\n");
}

const rows = parseRedirectMap(await readFile(CSV_PATH, "utf8"));
const results = [];

for (const row of rows) {
  results.push(await auditRow(row));
}

const report = renderReport(results);
await writeFile(REPORT_PATH, report);

console.log(report);

if (results.some((row) => row.status !== "PASS")) {
  process.exitCode = 1;
}
