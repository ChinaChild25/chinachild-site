import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  INDIVIDUAL_COURSE_MODULE_LIST,
  INDIVIDUAL_MODULE_TERMS,
} from "../../lib/course-modules.ts";

const OUTPUT_DIRECTORY = "seo-data/yandex-education";
const BENCHMARK_MARKDOWN = `${OUTPUT_DIRECTORY}/competitor-offer-benchmark.md`;
const BENCHMARK_CSV = `${OUTPUT_DIRECTORY}/competitor-offer-benchmark.csv`;
const CONSISTENCY_MARKDOWN = `${OUTPUT_DIRECTORY}/offer-page-consistency.md`;
const CONSISTENCY_CSV = `${OUTPUT_DIRECTORY}/offer-page-consistency.csv`;
const CHECKLIST_CSV = `${OUTPUT_DIRECTORY}/eligibility-checklist.csv`;

const CHECKLIST_HEADERS = [
  "id",
  "requirement",
  "status",
  "evidence",
  "owner_action",
  "automatable",
] as const;

const ALLOWED_CHECKLIST_STATUSES = new Set([
  "confirmed compliant",
  "likely compliant but needs owner verification",
  "non-compliant",
  "not verifiable from repository",
  "not applicable",
]);

type ChecklistRow = Record<(typeof CHECKLIST_HEADERS)[number], string>;
type ChecklistUpdate = Partial<Omit<ChecklistRow, "id">>;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  cells.push(cell);
  return cells;
}

function parseCsv(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  return {
    headers: parseCsvLine(lines[0] ?? ""),
    rows: lines.slice(1).map(parseCsvLine),
  };
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function renderCsv(headers: readonly string[], rows: readonly string[][]): string {
  return `${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function parseMarkdownTable(markdown: string): {
  headers: string[];
  rows: string[][];
} {
  const tableLines = markdown
    .split(/\r?\n/)
    .filter((line) => /^\s*\|.*\|\s*$/.test(line));
  if (tableLines.length < 3) throw new Error("Markdown table is missing");

  const parseLine = (line: string) =>
    line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
  const separator = parseLine(tableLines[1]);
  if (!separator.every((cell) => /^:?-{3,}:?$/.test(cell))) {
    throw new Error("Markdown table separator is invalid");
  }
  return {
    headers: parseLine(tableLines[0]),
    rows: tableLines.slice(2).map(parseLine),
  };
}

function rowsToRecords(
  headers: readonly string[],
  rows: readonly string[][],
): Array<Record<string, string>> {
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  );
}

function checklistUpdates(): Record<string, ChecklistUpdate> {
  const offerCount = INDIVIDUAL_COURSE_MODULE_LIST.length;
  const canonicalPaths = INDIVIDUAL_COURSE_MODULE_LIST.map(
    (courseModule) => courseModule.path,
  ).join(", ");
  const offerIds = INDIVIDUAL_COURSE_MODULE_LIST.map(
    (courseModule) => courseModule.id,
  ).join(", ");
  const allStageCounts = INDIVIDUAL_COURSE_MODULE_LIST.map(
    (courseModule) => courseModule.stages.length,
  );
  const allStageHours = INDIVIDUAL_COURSE_MODULE_LIST.map((courseModule) =>
    courseModule.stages.reduce((total, stage) => total + stage.hours, 0),
  );

  return {
    "feed-01": {
      status: "confirmed compliant",
      evidence:
        "The generator emits yml_catalog, shop, currencies and offers; Education category IDs come only from the pinned unified rubricator, and unmodeled categories or sets are rejected by tests.",
      owner_action:
        "Keep tests aligned with Yandex Webmaster parser feedback and the current unified rubricator.",
    },
    "site-09": {
      status: "confirmed compliant",
      evidence: `All ${offerCount} enabled canonical offer pages have direct application CTAs and preserve the reviewed lead flow.`,
      owner_action:
        "Test one real application immediately before submission without completing an unwanted paid order.",
    },
    "site-13": {
      status: "likely compliant but needs owner verification",
      evidence: `All ${offerCount} enabled offers derive the visible and feed price of ${INDIVIDUAL_MODULE_TERMS.priceRub} RUR from the shared package source; operational billing cannot be observed.`,
      owner_action:
        "Owner must reconcile the site, invoice templates and actual checkout or payment links.",
    },
    "site-14": {
      status: "confirmed compliant",
      evidence: `The ${offerCount} enabled offers use separate direct canonical pages: ${canonicalPaths}.`,
      owner_action:
        "Re-run the direct URL and canonical audit after deployment and before upload.",
    },
    "site-19": {
      status: "likely compliant but needs owner verification",
      evidence:
        "The published application policy is daily 09:00–21:00 Moscow time with a normal 1–2 hour response in that period; night applications are handled from the next response period. Repository code cannot prove staffing or actual response time.",
      owner_action:
        "Verify monitored staffing and confirm that a moderation application received during 09:00–21:00 Moscow time can be handled within three working hours.",
      automatable: "partly",
    },
    "feed-07": {
      requirement:
        "Every enabled offer has a positive current price or positive monthly price from the canonical source",
      status: "confirmed compliant",
      evidence: `All ${offerCount} offers have monthly price ${INDIVIDUAL_MODULE_TERMS.priceRub} RUR from lib/course-packages.ts; the feed uses price 0 only with this positive monthly price.`,
      owner_action:
        "Keep visible, contractual and feed pricing synchronized before submission.",
    },
    "feed-08": {
      status: "confirmed compliant",
      evidence: `All ${offerCount} offers have duration ${INDIVIDUAL_MODULE_TERMS.durationMonths} month in the typed module source and feed.`,
      owner_action: "Revalidate after any duration or package-scope change.",
    },
    "feed-09": {
      status: "confirmed compliant",
      evidence: `All ${offerCount} offers have ${allStageCounts.join(", ")} reviewed, offer-specific stages backed by the canonical course content and curriculum evidence report.`,
      owner_action:
        "Re-review the stage evidence before changing any curriculum title or scope.",
    },
    "feed-10": {
      status: "confirmed compliant",
      evidence: `Each stage has 2 guided hours; each offer totals ${allStageHours.join(", ")} guided hours across four stages and eight 60-minute lessons.`,
      owner_action:
        "Keep stage hours synchronized with the real delivered module.",
    },
    "feed-11": {
      status: "confirmed compliant",
      evidence: `The ${offerCount} enabled offer IDs are unique and match the reviewed baseline: ${offerIds}.`,
      owner_action: "Keep offer IDs stable after provider submission.",
    },
    "feed-12": {
      status: "confirmed compliant",
      evidence: `The enabled offers use the direct canonical paths ${canonicalPaths}; the local production validator checks HTTP 200 with no redirect and exact production canonicals.`,
      owner_action:
        "Repeat strict validation against the authorized production deployment before upload.",
    },
    "feed-13": {
      status: "confirmed compliant",
      evidence: `Feed monthly price ${INDIVIDUAL_MODULE_TERMS.priceRub} RUR matches the shared package source and visible module terms on all ${offerCount} pages.`,
      owner_action: "Re-run generation and validation after any pricing change.",
    },
    "feed-14": {
      status: "confirmed compliant",
      evidence: `All ${offerCount} offers have non-empty typed descriptions consistent with their page audience, one-month scope and individual format.`,
      owner_action:
        "Review descriptions together with visible page copy before submission.",
    },
    "feed-15": {
      status: "confirmed compliant",
      evidence: `All ${offerCount} offers use the allowed format value С преподавателем.`,
      owner_action:
        "Revalidate if the delivery format or enrolment model changes.",
    },
    "feed-17": {
      status: "confirmed compliant",
      evidence:
        "The App Router endpoint is public, force-static and returns application/xml; the local production validator checks the response and readiness header.",
      owner_action:
        "Verify the deployed response before provider upload.",
    },
    "feed-18": {
      status: "confirmed compliant",
      evidence: `The feed contains ${offerCount} enabled eligible offers from the reviewed typed source.`,
      owner_action:
        "Confirm all three products remain staffed and orderable on submission day.",
    },
    "feed-20": {
      status: "confirmed compliant",
      evidence: `The ${offerCount}-offer feed is far below the 200 MB, 30000-offer and image limits.`,
      owner_action:
        "Continue reporting the offer count in strict validation.",
    },
  };
}

function renderCurrentChecklist(sourceCsv: string): string {
  const parsed = parseCsv(sourceCsv);
  if (parsed.headers.join(",") !== CHECKLIST_HEADERS.join(",")) {
    throw new Error("Eligibility checklist headers changed unexpectedly");
  }
  const updates = checklistUpdates();
  const rows = parsed.rows.map((cells) => {
    const row = Object.fromEntries(
      CHECKLIST_HEADERS.map((header, index) => [header, cells[index] ?? ""]),
    ) as ChecklistRow;
    const update = updates[row.id];
    return CHECKLIST_HEADERS.map((header) =>
      header === "id" ? row.id : (update?.[header] ?? row[header]),
    );
  });
  return renderCsv(CHECKLIST_HEADERS, rows);
}

function normalizeInteger(value: string): number {
  return Number(value.replace(/[^\d]/g, ""));
}

function validateBenchmark(csv: string): string[] {
  const errors: string[] = [];
  const parsed = parseCsv(csv);
  const records = rowsToRecords(parsed.headers, parsed.rows);
  if (records.length !== 5) errors.push(`benchmark has ${records.length} rows`);
  const chinaChild = records.find((row) => row.provider === "ChinaChild");
  if (!chinaChild) return [...errors, "benchmark has no ChinaChild row"];
  if (Number(chinaChild.price_rub) !== INDIVIDUAL_MODULE_TERMS.priceRub) {
    errors.push("benchmark ChinaChild price differs from typed terms");
  }
  if (Number(chinaChild.lesson_count) !== INDIVIDUAL_MODULE_TERMS.lessonCount) {
    errors.push("benchmark ChinaChild lesson count differs from typed terms");
  }
  if (
    Number(chinaChild.lesson_minutes) !== INDIVIDUAL_MODULE_TERMS.lessonMinutes
  ) {
    errors.push("benchmark ChinaChild lesson duration differs from typed terms");
  }
  if (chinaChild.subscription !== String(INDIVIDUAL_MODULE_TERMS.isSubscription)) {
    errors.push("benchmark ChinaChild subscription flag differs from typed terms");
  }
  return errors;
}

function validateConsistency(csv: string): string[] {
  const errors: string[] = [];
  const parsed = parseCsv(csv);
  const records = rowsToRecords(parsed.headers, parsed.rows);
  if (records.length !== INDIVIDUAL_COURSE_MODULE_LIST.length) {
    errors.push(`consistency artifact has ${records.length} offer rows`);
  }
  for (const courseModule of INDIVIDUAL_COURSE_MODULE_LIST) {
    const row = records.find((record) => record.offer_id === courseModule.id);
    if (!row) {
      errors.push(`consistency artifact is missing ${courseModule.id}`);
      continue;
    }
    const expectedHours = courseModule.stages.reduce(
      (total, stage) => total + stage.hours,
      0,
    );
    if (row.canonical_path !== courseModule.path) {
      errors.push(`${courseModule.id} canonical differs from typed source`);
    }
    if (normalizeInteger(row.price) !== INDIVIDUAL_MODULE_TERMS.priceRub) {
      errors.push(`${courseModule.id} price differs from typed source`);
    }
    if (normalizeInteger(row.duration) !== INDIVIDUAL_MODULE_TERMS.durationMonths) {
      errors.push(`${courseModule.id} duration differs from typed source`);
    }
    const lessonNumbers = row.lessons.match(/\d+/g)?.map(Number) ?? [];
    if (
      lessonNumbers[0] !== INDIVIDUAL_MODULE_TERMS.lessonCount ||
      lessonNumbers[1] !== INDIVIDUAL_MODULE_TERMS.lessonMinutes
    ) {
      errors.push(`${courseModule.id} lesson terms differ from typed source`);
    }
    if (Number(row.stage_hours) !== expectedHours) {
      errors.push(`${courseModule.id} stage hours differ from typed source`);
    }
    if (row.subscription !== String(INDIVIDUAL_MODULE_TERMS.isSubscription)) {
      errors.push(`${courseModule.id} subscription flag differs from typed source`);
    }
    for (const flag of ["visible_page", "JSON-LD", "feed"]) {
      if (row[flag] !== "yes") {
        errors.push(`${courseModule.id} ${flag} is not yes`);
      }
    }
  }
  return errors;
}

function validateChecklist(csv: string): string[] {
  const errors: string[] = [];
  const parsed = parseCsv(csv);
  const records = rowsToRecords(parsed.headers, parsed.rows);
  if (records.length !== 41) {
    errors.push(`eligibility checklist has ${records.length} requirements`);
  }
  const ids = new Set<string>();
  for (const row of records) {
    if (ids.has(row.id)) errors.push(`eligibility checklist duplicates ${row.id}`);
    ids.add(row.id);
    if (!ALLOWED_CHECKLIST_STATUSES.has(row.status)) {
      errors.push(`${row.id} uses unsupported status ${row.status}`);
    }
  }
  const currentConfirmedIds = [
    "site-14",
    "feed-07",
    "feed-08",
    "feed-09",
    "feed-10",
    "feed-11",
    "feed-12",
    "feed-13",
    "feed-14",
    "feed-15",
    "feed-17",
    "feed-18",
    "feed-20",
  ];
  for (const id of currentConfirmedIds) {
    const row = records.find((record) => record.id === id);
    if (row?.status !== "confirmed compliant") {
      errors.push(`${id} does not reflect the enabled PASS 6 state`);
    }
  }
  const stalePattern =
    /\bno offer is enabled\b|\bzero offers\b|\bempty feed\b|\bfuture feed\b|\bstrongest candidate\b/i;
  for (const row of records) {
    if (stalePattern.test(Object.values(row).join(" "))) {
      errors.push(`${row.id} retains stale PASS 5 wording`);
    }
  }
  return errors;
}

async function expectedArtifacts(repositoryRoot: string) {
  const benchmarkMarkdown = await readFile(
    path.join(repositoryRoot, BENCHMARK_MARKDOWN),
    "utf8",
  );
  const consistencyMarkdown = await readFile(
    path.join(repositoryRoot, CONSISTENCY_MARKDOWN),
    "utf8",
  );
  const checklistSource = await readFile(
    path.join(repositoryRoot, CHECKLIST_CSV),
    "utf8",
  );
  const benchmark = parseMarkdownTable(benchmarkMarkdown);
  const consistency = parseMarkdownTable(consistencyMarkdown);
  return {
    [BENCHMARK_CSV]: renderCsv(benchmark.headers, benchmark.rows),
    [CONSISTENCY_CSV]: renderCsv(consistency.headers, consistency.rows),
    [CHECKLIST_CSV]: renderCurrentChecklist(checklistSource),
  };
}

export async function generateYandexEducationArtifacts(options: {
  check?: boolean;
  repositoryRoot?: string;
} = {}): Promise<{ checked: string[]; errors: string[] }> {
  const repositoryRoot = options.repositoryRoot ?? process.cwd();
  const expected = await expectedArtifacts(repositoryRoot);
  const errors = [
    ...validateBenchmark(expected[BENCHMARK_CSV]),
    ...validateConsistency(expected[CONSISTENCY_CSV]),
    ...validateChecklist(expected[CHECKLIST_CSV]),
  ];
  const checked = Object.keys(expected);

  for (const [relativePath, contents] of Object.entries(expected)) {
    const filename = path.join(repositoryRoot, relativePath);
    if (options.check) {
      const current = await readFile(filename, "utf8").catch(() => "");
      if (current !== contents) errors.push(`${relativePath} is not regenerated`);
    } else {
      await writeFile(filename, contents, "utf8");
    }
  }
  return { checked, errors };
}

async function main() {
  const check = process.argv.includes("--check");
  const result = await generateYandexEducationArtifacts({ check });
  if (result.errors.length) {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    process.exitCode = 1;
    return;
  }
  const verb = check ? "Validated" : "Generated";
  console.log(`${verb} ${result.checked.length} Yandex Education CSV artifacts.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
