import {
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { YandexWebmasterClient } from "./clients/yandex.mts";
import type { SeoConfig } from "./config.mts";
import { countInclusiveDays, dateOnly } from "./date-range.mts";
import { redactSecrets } from "./http.mts";
import { createRunId } from "./storage.mts";
import {
  asArray,
  asBoolean,
  asNumber,
  asOptionalNumber,
  asOptionalString,
  asRecord,
  asString,
} from "./validation.mts";

export const DEFAULT_ENHANCED_PATHS = [
  "/",
  "/courses/online-chinese",
  "/repetitor-kitayskogo",
  "/courses/chinese-for-adults",
  "/courses/chinese-for-kids",
  "/courses/hsk-preparation",
  "/courses",
  "/price",
  "/courses/business-chinese",
  "/corporate",
  "/free-trial",
  "/zayavka",
  "/kitayskiy-yazyk-s-nulya",
  "/kursy-kitayskogo-yazyka",
] as const;

const FREE_FEATURE_NAMES = new Set([
  "FREE_SERP",
  "BASIC_SERP",
  "SERP_FREE",
  "SERP_BASIC",
]);
const PAID_FEATURE_NAMES = new Set(["PRO_SERP"]);
const MAX_REQUEST_ITEMS = 100;
const DEFAULT_BACKFILL_DAYS = 90;

export type EnhancedTaskStatus =
  | "submitting"
  | "submitted"
  | "in_progress"
  | "success"
  | "downloaded"
  | "failed";

export type EnhancedExportTask = {
  requestKey: string;
  taskId?: string;
  paths: string[];
  dates: string[];
  regionIds: number[];
  quotaUnits: number;
  status: EnhancedTaskStatus;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
  freeQuotaUsed?: number;
  freeQuotaRemaining?: number;
  proQuotaUsed?: number;
  downloadUrlExpiresAfter?: string;
  rawFilename?: string;
  normalizedRowCount?: number;
  error?: string;
};

export type EnhancedExportState = {
  schemaVersion: 1;
  activeRunId: string;
  hostId: string;
  hostUrl: string;
  updatedAt: string;
  tasks: EnhancedExportTask[];
};

export type BackfillUnit = {
  path: string;
  date: string;
  regionIds: number[];
  status: "pending" | "submitted" | "covered" | "failed";
  taskId?: string;
};

export type EnhancedBackfillQueue = {
  schemaVersion: 1;
  activeRunId: string;
  createdAt: string;
  updatedAt: string;
  targetRange: { startDate: string; endDate: string };
  paths: string[];
  regionIds: number[];
  units: BackfillUnit[];
};

export type YandexEnhancedQueryUrlRecord = {
  provider: "yandex_webmaster_enhanced";
  searchEngine: "yandex";
  date: string;
  host: string;
  page: string;
  query: string;
  region: string;
  clicks: number;
  impressions: number;
  ctr: number | null;
  averagePosition: number | null;
  sourceMetadata: {
    taskId: string;
    requestKey: string;
    verifiedLandingPageDimension: true;
    aggregation: "date_page_query_region";
  };
};

export type EnhancedQuotaLimit = {
  owner: string;
  feature: string;
  limit: number;
  used: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
  active: boolean;
  tariffId?: string;
};

export type EnhancedQuotaSnapshot = {
  freeRemaining: number;
  freeLimit: EnhancedQuotaLimit;
  paidLimits: EnhancedQuotaLimit[];
  allLimits: EnhancedQuotaLimit[];
};

export type EnhancedExportOptions = {
  paths?: string[];
  startDate?: string;
  endDate?: string;
  regionIds?: number[];
  runId?: string;
  dryRun?: boolean;
  initOnly?: boolean;
  resume?: boolean;
  download?: boolean;
  retryFailed?: boolean;
};

type ExportClient = Pick<
  YandexWebmasterClient,
  | "getUser"
  | "listHosts"
  | "discoverHost"
  | "hostGet"
  | "hostPost"
  | "downloadText"
>;

type EnhancedPaths = {
  root: string;
  state: string;
  queue: string;
};

function enhancedPaths(outputDirectory: string): EnhancedPaths {
  const root = path.join(outputDirectory, "yandex-enhanced");
  return {
    root,
    state: path.join(root, "state.json"),
    queue: path.join(root, "backfill-queue.json"),
  };
}

function isoNow(): string {
  return new Date().toISOString();
}

function addDays(date: string, amount: number): string {
  const timestamp = new Date(`${date}T00:00:00.000Z`).getTime();
  return new Date(timestamp + amount * 86_400_000).toISOString().slice(0, 10);
}

export function expandDateRange(startDate: string, endDate: string): string[] {
  const count = countInclusiveDays(startDate, endDate);
  if (count < 1 || count > 550) {
    throw new Error("Yandex enhanced-export date range must be 1..550 days");
  }
  return Array.from({ length: count }, (_, index) => addDays(startDate, index));
}

export function normalizeEnhancedPath(
  value: string,
  domain = "chinachild.ru",
): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Yandex enhanced-export URL list contains an empty value");
  if (trimmed.startsWith("/")) {
    const parsed = new URL(trimmed, `https://${domain}`);
    if (parsed.hash) parsed.hash = "";
    return `${parsed.pathname}${parsed.search}`;
  }
  const parsed = new URL(trimmed);
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== domain) {
    throw new Error(`Enhanced export URL must belong to ${domain}: ${trimmed}`);
  }
  return `${parsed.pathname}${parsed.search}`;
}

function uniqueSorted<T extends string | number>(values: readonly T[]): T[] {
  return [...new Set(values)].sort((left, right) =>
    String(left).localeCompare(String(right)),
  );
}

export function calculateQuotaUnits(
  paths: readonly string[],
  dates: readonly string[],
): number {
  return new Set(paths).size * new Set(dates).size;
}

function regionsKey(regionIds: readonly number[]): string {
  return uniqueSorted(regionIds).join(",");
}

function unitKey(pathname: string, date: string, regionIds: readonly number[]): string {
  return `${pathname}\u0000${date}\u0000${regionsKey(regionIds)}`;
}

export function requestKey(
  paths: readonly string[],
  dates: readonly string[],
  regionIds: readonly number[],
): string {
  return JSON.stringify({
    paths: uniqueSorted(paths),
    dates: uniqueSorted(dates),
    regionIds: uniqueSorted(regionIds),
  });
}

export function parseEnhancedLimits(raw: unknown): EnhancedQuotaSnapshot {
  const response = asRecord(raw, "Yandex enhanced limits");
  const limits = asArray(response.limits, "Yandex enhanced limits.limits").map(
    (value, index): EnhancedQuotaLimit => {
      const row = asRecord(value, `Yandex enhanced limits[${index}]`);
      return {
        owner: asString(row.owner, `Yandex enhanced limits[${index}].owner`),
        feature: asString(
          row.feature,
          `Yandex enhanced limits[${index}].feature`,
        ).toUpperCase(),
        limit: asNumber(row.limit, `Yandex enhanced limits[${index}].limit`),
        used: asNumber(row.used, `Yandex enhanced limits[${index}].used`),
        remaining: asNumber(
          row.remaining,
          `Yandex enhanced limits[${index}].remaining`,
        ),
        periodStart: dateOnly(
          asString(
            row.period_start,
            `Yandex enhanced limits[${index}].period_start`,
          ),
        ),
        periodEnd: dateOnly(
          asString(
            row.period_end,
            `Yandex enhanced limits[${index}].period_end`,
          ),
        ),
        active: asBoolean(
          row.is_active,
          `Yandex enhanced limits[${index}].is_active`,
        ),
        tariffId: asOptionalString(
          row.tariff_id,
          `Yandex enhanced limits[${index}].tariff_id`,
        ),
      };
    },
  );
  const freeCandidates = limits.filter(
    (limit) =>
      FREE_FEATURE_NAMES.has(limit.feature) ||
      (limit.feature === "PRO_SERP" &&
        limit.tariffId === undefined &&
        limit.periodStart === limit.periodEnd &&
        limit.limit <= 100),
  );
  if (freeCandidates.length !== 1) {
    throw new Error(
      "Could not identify exactly one free Yandex enhanced-export quota " +
        `(features returned: ${limits.map((limit) => limit.feature).join(", ") || "none"})`,
    );
  }
  const freeLimit = freeCandidates[0];
  if (
    !Number.isInteger(freeLimit.remaining) ||
    freeLimit.remaining < 0 ||
    freeLimit.remaining > freeLimit.limit
  ) {
    throw new Error("Yandex enhanced-export free quota response is inconsistent");
  }
  return {
    freeRemaining: freeLimit.remaining,
    freeLimit,
    paidLimits: limits.filter(
      (limit) =>
        limit !== freeLimit && PAID_FEATURE_NAMES.has(limit.feature),
    ),
    allLimits: limits,
  };
}

export function selectFreeSafeRectangle(
  paths: readonly string[],
  dates: readonly string[],
  remainingQuota: number,
  minimumUsefulDays = 14,
): { paths: string[]; dates: string[]; quotaUnits: number } {
  if (!Number.isInteger(remainingQuota) || remainingQuota < 0) {
    throw new Error("Remaining free quota must be a non-negative integer");
  }
  const uniquePaths = [...new Set(paths)];
  const uniqueDates = uniqueSorted(dates);
  if (remainingQuota === 0 || uniquePaths.length === 0 || uniqueDates.length === 0) {
    return { paths: [], dates: [], quotaUnits: 0 };
  }
  const maximumDays = Math.min(uniqueDates.length, 28);
  let selectedPathCount = Math.min(
    uniquePaths.length,
    Math.max(1, Math.floor(remainingQuota / Math.min(minimumUsefulDays, maximumDays))),
  );
  while (selectedPathCount > 1 && Math.floor(remainingQuota / selectedPathCount) < 7) {
    selectedPathCount -= 1;
  }
  const selectedDayCount = Math.min(
    maximumDays,
    Math.floor(remainingQuota / selectedPathCount),
  );
  if (selectedDayCount < 1) {
    return { paths: [], dates: [], quotaUnits: 0 };
  }
  const selectedPaths = uniquePaths.slice(0, selectedPathCount);
  const selectedDates = uniqueDates.slice(-selectedDayCount);
  return {
    paths: selectedPaths,
    dates: selectedDates,
    quotaUnits: calculateQuotaUnits(selectedPaths, selectedDates),
  };
}

async function readJsonIfExists(filename: string): Promise<unknown | undefined> {
  try {
    return JSON.parse(await readFile(filename, "utf8")) as unknown;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return undefined;
    }
    throw error;
  }
}

async function writeJsonAtomic(filename: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  const temporary = `${filename}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(temporary, filename);
}

function parseTask(value: unknown, index: number): EnhancedExportTask {
  const row = asRecord(value, `enhanced state.tasks[${index}]`);
  const status = asString(row.status, `enhanced state.tasks[${index}].status`);
  if (
    ![
      "submitting",
      "submitted",
      "in_progress",
      "success",
      "downloaded",
      "failed",
    ].includes(status)
  ) {
    throw new Error(`enhanced state.tasks[${index}].status is invalid`);
  }
  return {
    requestKey: asString(
      row.requestKey,
      `enhanced state.tasks[${index}].requestKey`,
    ),
    taskId: asOptionalString(
      row.taskId,
      `enhanced state.tasks[${index}].taskId`,
    ),
    paths: asArray(
      row.paths,
      `enhanced state.tasks[${index}].paths`,
    ).map((item, itemIndex) =>
      asString(item, `enhanced state.tasks[${index}].paths[${itemIndex}]`),
    ),
    dates: asArray(
      row.dates,
      `enhanced state.tasks[${index}].dates`,
    ).map((item, itemIndex) =>
      dateOnly(
        asString(item, `enhanced state.tasks[${index}].dates[${itemIndex}]`),
      ),
    ),
    regionIds: asArray(
      row.regionIds,
      `enhanced state.tasks[${index}].regionIds`,
    ).map((item, itemIndex) =>
      asNumber(item, `enhanced state.tasks[${index}].regionIds[${itemIndex}]`),
    ),
    quotaUnits: asNumber(
      row.quotaUnits,
      `enhanced state.tasks[${index}].quotaUnits`,
    ),
    status: status as EnhancedTaskStatus,
    createdAt: asString(
      row.createdAt,
      `enhanced state.tasks[${index}].createdAt`,
    ),
    updatedAt: asString(
      row.updatedAt,
      `enhanced state.tasks[${index}].updatedAt`,
    ),
    lastCheckedAt: asOptionalString(
      row.lastCheckedAt,
      `enhanced state.tasks[${index}].lastCheckedAt`,
    ),
    freeQuotaUsed: asOptionalNumber(
      row.freeQuotaUsed,
      `enhanced state.tasks[${index}].freeQuotaUsed`,
    ),
    freeQuotaRemaining: asOptionalNumber(
      row.freeQuotaRemaining,
      `enhanced state.tasks[${index}].freeQuotaRemaining`,
    ),
    proQuotaUsed: asOptionalNumber(
      row.proQuotaUsed,
      `enhanced state.tasks[${index}].proQuotaUsed`,
    ),
    downloadUrlExpiresAfter: asOptionalString(
      row.downloadUrlExpiresAfter,
      `enhanced state.tasks[${index}].downloadUrlExpiresAfter`,
    ),
    rawFilename: asOptionalString(
      row.rawFilename,
      `enhanced state.tasks[${index}].rawFilename`,
    ),
    normalizedRowCount: asOptionalNumber(
      row.normalizedRowCount,
      `enhanced state.tasks[${index}].normalizedRowCount`,
    ),
    error: asOptionalString(
      row.error,
      `enhanced state.tasks[${index}].error`,
    ),
  };
}

async function loadState(
  filename: string,
): Promise<EnhancedExportState | undefined> {
  const raw = await readJsonIfExists(filename);
  if (raw === undefined) return undefined;
  const value = asRecord(raw, "enhanced state");
  if (value.schemaVersion !== 1) {
    throw new Error("Yandex enhanced state has an unsupported schemaVersion");
  }
  return {
    schemaVersion: 1,
    activeRunId: asString(value.activeRunId, "enhanced state.activeRunId"),
    hostId: asString(value.hostId, "enhanced state.hostId"),
    hostUrl: asString(value.hostUrl, "enhanced state.hostUrl"),
    updatedAt: asString(value.updatedAt, "enhanced state.updatedAt"),
    tasks: asArray(value.tasks, "enhanced state.tasks").map(parseTask),
  };
}

function buildQueue(options: {
  runId: string;
  paths: string[];
  dates: string[];
  regionIds: number[];
  existing?: EnhancedBackfillQueue;
}): EnhancedBackfillQueue {
  const now = isoNow();
  const existingByKey = new Map(
    (options.existing?.units ?? []).map((unit) => [
      unitKey(unit.path, unit.date, unit.regionIds),
      unit,
    ]),
  );
  return {
    schemaVersion: 1,
    activeRunId: options.runId,
    createdAt: options.existing?.createdAt ?? now,
    updatedAt: now,
    targetRange: {
      startDate: options.dates[0],
      endDate: options.dates.at(-1) ?? options.dates[0],
    },
    paths: options.paths,
    regionIds: options.regionIds,
    units: options.paths.flatMap((pathname) =>
      options.dates.map((date) => {
        const key = unitKey(pathname, date, options.regionIds);
        return (
          existingByKey.get(key) ?? {
            path: pathname,
            date,
            regionIds: options.regionIds,
            status: "pending" as const,
          }
        );
      }),
    ),
  };
}

function parseQueue(value: unknown): EnhancedBackfillQueue {
  const row = asRecord(value, "enhanced backfill queue");
  if (row.schemaVersion !== 1) {
    throw new Error("Yandex enhanced backfill queue has an unsupported schemaVersion");
  }
  const paths = asArray(row.paths, "enhanced queue.paths").map((item, index) =>
    asString(item, `enhanced queue.paths[${index}]`),
  );
  const units = asArray(row.units, "enhanced queue.units").map(
    (item, index): BackfillUnit => {
      const unit = asRecord(item, `enhanced queue.units[${index}]`);
      const status = asString(
        unit.status,
        `enhanced queue.units[${index}].status`,
      );
      if (!["pending", "submitted", "covered", "failed"].includes(status)) {
        throw new Error(`enhanced queue.units[${index}].status is invalid`);
      }
      return {
        path: asString(unit.path, `enhanced queue.units[${index}].path`),
        date: dateOnly(
          asString(unit.date, `enhanced queue.units[${index}].date`),
        ),
        regionIds: asArray(
          unit.regionIds,
          `enhanced queue.units[${index}].regionIds`,
        ).map((region, regionIndex) =>
          asNumber(
            region,
            `enhanced queue.units[${index}].regionIds[${regionIndex}]`,
          ),
        ),
        status: status as BackfillUnit["status"],
        taskId: asOptionalString(
          unit.taskId,
          `enhanced queue.units[${index}].taskId`,
        ),
      };
    },
  );
  const targetRange = asRecord(
    row.targetRange,
    "enhanced queue.targetRange",
  );
  return {
    schemaVersion: 1,
    activeRunId: asString(
      row.activeRunId,
      "enhanced queue.activeRunId",
    ),
    createdAt: asString(row.createdAt, "enhanced queue.createdAt"),
    updatedAt: asString(row.updatedAt, "enhanced queue.updatedAt"),
    targetRange: {
      startDate: dateOnly(
        asString(targetRange.startDate, "enhanced queue.targetRange.startDate"),
      ),
      endDate: dateOnly(
        asString(targetRange.endDate, "enhanced queue.targetRange.endDate"),
      ),
    },
    paths,
    regionIds: asArray(row.regionIds, "enhanced queue.regionIds").map(
      (item, index) =>
        asNumber(item, `enhanced queue.regionIds[${index}]`),
    ),
    units,
  };
}

async function loadQueue(
  filename: string,
): Promise<EnhancedBackfillQueue | undefined> {
  const raw = await readJsonIfExists(filename);
  return raw === undefined ? undefined : parseQueue(raw);
}

function markQueueForTask(
  queue: EnhancedBackfillQueue,
  task: EnhancedExportTask,
): void {
  const selected = new Set(
    task.paths.flatMap((pathname) =>
      task.dates.map((date) => unitKey(pathname, date, task.regionIds)),
    ),
  );
  for (const unit of queue.units) {
    if (!selected.has(unitKey(unit.path, unit.date, unit.regionIds))) continue;
    unit.status =
      task.status === "failed"
        ? "failed"
        : task.status === "downloaded"
          ? "covered"
          : "submitted";
    unit.taskId = task.taskId;
  }
  queue.updatedAt = isoNow();
}

function coveredUnits(state: EnhancedExportState): Set<string> {
  const keys = new Set<string>();
  for (const task of state.tasks) {
    if (task.status === "failed") continue;
    for (const pathname of task.paths) {
      for (const date of task.dates) {
        keys.add(unitKey(pathname, date, task.regionIds));
      }
    }
  }
  return keys;
}

function chooseQueueRectangle(
  queue: EnhancedBackfillQueue,
  state: EnhancedExportState,
  quota: number,
): { paths: string[]; dates: string[]; quotaUnits: number } {
  if (quota <= 0) {
    return { paths: [], dates: [], quotaUnits: 0 };
  }
  const covered = coveredUnits(state);
  const pending = queue.units.filter(
    (unit) =>
      unit.status === "pending" &&
      !covered.has(unitKey(unit.path, unit.date, unit.regionIds)),
  );
  const pendingKeys = new Set(
    pending.map((unit) => unitKey(unit.path, unit.date, unit.regionIds)),
  );
  const dates = uniqueSorted(pending.map((unit) => unit.date));
  const rectangle = selectFreeSafeRectangle(queue.paths, dates, quota);
  for (let pathCount = rectangle.paths.length; pathCount >= 1; pathCount -= 1) {
    const selectedPaths = queue.paths.slice(0, pathCount);
    const maximumDays = Math.min(
      dates.length,
      Math.floor(quota / selectedPaths.length),
      28,
    );
    for (let dayCount = maximumDays; dayCount >= 1; dayCount -= 1) {
      const selectedDates = dates.slice(-dayCount);
      const complete = selectedPaths.every((pathname) =>
        selectedDates.every((date) =>
          pendingKeys.has(unitKey(pathname, date, queue.regionIds)),
        ),
      );
      if (complete) {
        return {
          paths: selectedPaths,
          dates: selectedDates,
          quotaUnits: selectedPaths.length * selectedDates.length,
        };
      }
    }
  }
  const first = pending[0];
  return first
    ? { paths: [first.path], dates: [first.date], quotaUnits: 1 }
    : { paths: [], dates: [], quotaUnits: 0 };
}

function parseAvailableDates(raw: unknown): string[] {
  const response = asRecord(raw, "Yandex enhanced available dates");
  const values =
    response.dates ??
    response.available_dates ??
    response.serp_dates;
  return uniqueSorted(
    asArray(values, "Yandex enhanced available dates.dates").map(
      (value, index) =>
        dateOnly(
          typeof value === "string"
            ? value
            : asString(
                asRecord(value, `available dates[${index}]`).date,
                `available dates[${index}].date`,
              ),
        ),
    ),
  );
}

function csvDelimiter(firstLine: string): string {
  const candidates = [",", ";", "\t"];
  return candidates
    .map((delimiter) => ({
      delimiter,
      count: parseCsvLine(firstLine, delimiter).length,
    }))
    .sort((left, right) => right.count - left.count)[0].delimiter;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      fields.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  fields.push(current);
  return fields;
}

export function parseCsv(text: string): string[][] {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const logicalLines: string[] = [];
  let current = "";
  let quoted = false;
  for (const line of normalized.split("\n")) {
    current += current ? `\n${line}` : line;
    const quoteCount = [...line].filter((character) => character === '"').length;
    if (quoteCount % 2 === 1) quoted = !quoted;
    if (!quoted) {
      if (current.trim()) logicalLines.push(current);
      current = "";
    }
  }
  if (quoted) throw new Error("Yandex enhanced CSV has an unterminated quote");
  if (current.trim()) logicalLines.push(current);
  if (logicalLines.length === 0) return [];
  const delimiter = csvDelimiter(logicalLines[0]);
  return logicalLines.map((line) => parseCsvLine(line, delimiter));
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function headerIndex(headers: string[], aliases: string[], required = true): number {
  const normalized = headers.map(normalizeHeader);
  const index = aliases
    .map(normalizeHeader)
    .map((alias) => normalized.indexOf(alias))
    .find((candidate) => candidate >= 0) ?? -1;
  if (index < 0 && required) {
    throw new Error(`Yandex enhanced CSV is missing column: ${aliases[0]}`);
  }
  return index;
}

export function normalizeEnhancedCsv(
  csv: string,
  task: Pick<EnhancedExportTask, "taskId" | "requestKey">,
): YandexEnhancedQueryUrlRecord[] {
  const rows = parseCsv(csv);
  if (rows.length === 0) return [];
  const headers = rows[0];
  const columns = {
    date: headerIndex(headers, ["date", "дата"]),
    host: headerIndex(headers, ["host", "хост"]),
    page: headerIndex(headers, ["url", "path", "адрес страницы", "страница"]),
    query: headerIndex(headers, ["query", "запрос", "поисковый запрос"]),
    region: headerIndex(
      headers,
      ["regionName", "region", "регион", "regionId"],
    ),
    clicks: headerIndex(headers, ["clicks", "клики"]),
    impressions: headerIndex(headers, ["impressions", "показы"]),
    position: headerIndex(headers, ["position", "ranking", "позиция"]),
  };
  const taskId = task.taskId;
  if (!taskId) throw new Error("Cannot normalize enhanced CSV without task ID");
  return rows.slice(1).map((row, index) => {
    const context = `Yandex enhanced CSV row ${index + 2}`;
    const clicks = asNumber(row[columns.clicks], `${context}.clicks`);
    const impressions = asNumber(
      row[columns.impressions],
      `${context}.impressions`,
    );
    const rawPage = asString(row[columns.page], `${context}.page`);
    const rawHost = asString(row[columns.host], `${context}.host`);
    const hostUrl = rawHost.startsWith("http")
      ? new URL(rawHost)
      : new URL(`https://${rawHost}`);
    return {
      provider: "yandex_webmaster_enhanced",
      searchEngine: "yandex",
      date: dateOnly(asString(row[columns.date], `${context}.date`)),
      host: hostUrl.host,
      page: rawPage.startsWith("http")
        ? rawPage
        : new URL(rawPage.startsWith("/") ? rawPage : `/${rawPage}`, hostUrl)
            .toString()
            .replace(/\/$/, rawPage === "/" ? "/" : ""),
      query: asString(row[columns.query], `${context}.query`),
      region: asString(row[columns.region], `${context}.region`),
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : null,
      averagePosition:
        row[columns.position] === ""
          ? null
          : asNumber(row[columns.position], `${context}.position`),
      sourceMetadata: {
        taskId,
        requestKey: task.requestKey,
        verifiedLandingPageDimension: true,
        aggregation: "date_page_query_region",
      },
    };
  });
}

async function storeNormalizedRecords(
  outputDirectory: string,
  state: EnhancedExportState,
): Promise<string> {
  const records: YandexEnhancedQueryUrlRecord[] = [];
  for (const task of state.tasks) {
    if (!task.rawFilename) continue;
    const csv = await readFile(
      path.join(outputDirectory, "runs", state.activeRunId, task.rawFilename),
      "utf8",
    );
    records.push(...normalizeEnhancedCsv(csv, task));
  }
  const filename = path.join(
    outputDirectory,
    "runs",
    state.activeRunId,
    "normalized/yandex-enhanced-query-url.json",
  );
  await writeJsonAtomic(filename, {
    schemaVersion: 1,
    generatedAt: isoNow(),
    runId: state.activeRunId,
    coverage: state.tasks.map((task) => ({
      taskId: task.taskId,
      status: task.status,
      paths: task.paths,
      dates: task.dates,
      regionIds: task.regionIds,
      quotaUnits: task.quotaUnits,
      normalizedRowCount: task.normalizedRowCount,
      error: task.error,
    })),
    records,
  });
  return filename;
}

async function snapshotState(
  outputDirectory: string,
  state: EnhancedExportState,
  queue: EnhancedBackfillQueue,
  quota?: EnhancedQuotaSnapshot,
): Promise<void> {
  const runDirectory = path.join(outputDirectory, "runs", state.activeRunId);
  await Promise.all([
    writeJsonAtomic(
      path.join(runDirectory, "normalized/yandex-enhanced-export-state.json"),
      state,
    ),
    writeJsonAtomic(
      path.join(runDirectory, "normalized/yandex-enhanced-backfill-queue.json"),
      queue,
    ),
    quota
      ? writeJsonAtomic(
          path.join(runDirectory, "normalized/yandex-enhanced-quota.json"),
          {
            schemaVersion: 1,
            capturedAt: isoNow(),
            freeLimit: quota.freeLimit,
            paidLimits: quota.paidLimits,
          },
        )
      : Promise.resolve(),
  ]);
}

function latestDefaultDates(availableDates: readonly string[]): string[] {
  if (availableDates.length === 0) {
    throw new Error("Yandex enhanced export returned no available dates");
  }
  return [...availableDates].slice(-DEFAULT_BACKFILL_DAYS);
}

async function resolveIdentity(
  config: SeoConfig,
  client: ExportClient,
): Promise<{ userId: number; hostId: string; hostUrl: string }> {
  const userResponse = await client.getUser();
  const userId = asNumber(userResponse.user_id, "Webmaster user.user_id");
  const hostList = await client.listHosts(userId);
  const host = client.discoverHost(
    hostList.hosts,
    config.yandex.webmasterHostId,
    config.domain,
  );
  return {
    userId,
    hostId: host.mainMirror?.hostId ?? host.hostId,
    hostUrl: host.mainMirror?.asciiHostUrl ?? host.asciiHostUrl,
  };
}

function safeError(error: unknown, secrets: readonly string[]): string {
  return redactSecrets(
    error instanceof Error ? error.message : String(error),
    secrets,
  );
}

async function downloadReadyTask(
  config: SeoConfig,
  client: ExportClient,
  state: EnhancedExportState,
  task: EnhancedExportTask,
  downloadUrl: string,
): Promise<void> {
  const csv = await client.downloadText(downloadUrl);
  const records = normalizeEnhancedCsv(csv, task);
  const relativeFilename = `raw/yandex_enhanced_${task.taskId}.csv`;
  const filename = path.join(
    config.outputDirectory,
    "runs",
    state.activeRunId,
    relativeFilename,
  );
  await mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  await writeFile(filename, csv, { mode: 0o600 });
  task.rawFilename = relativeFilename;
  task.normalizedRowCount = records.length;
  task.status = "downloaded";
  task.updatedAt = isoNow();
}

async function resumeTasks(options: {
  config: SeoConfig;
  client: ExportClient;
  state: EnhancedExportState;
  queue: EnhancedBackfillQueue;
  userId: number;
  hostId: string;
  download: boolean;
}): Promise<void> {
  for (const task of options.state.tasks) {
    if (
      task.status === "downloaded" ||
      task.status === "failed" ||
      task.status === "submitting"
    ) {
      continue;
    }
    if (!task.taskId) continue;
    const response = await options.client.hostGet(
      options.userId,
      options.hostId,
      `/pro/serp/queries/download/${encodeURIComponent(task.taskId)}`,
    );
    const status = asString(
      response.download_status,
      `enhanced task ${task.taskId}.download_status`,
    ).toUpperCase();
    task.lastCheckedAt = isoNow();
    task.updatedAt = task.lastCheckedAt;
    if (status === "IN_PROGRESS") {
      task.status = "in_progress";
    } else if (status === "FAILED") {
      task.status = "failed";
      task.error =
        asOptionalString(
          response.error_message,
          `enhanced task ${task.taskId}.error_message`,
        ) ?? "Yandex enhanced export failed without an error message";
    } else if (status === "SUCCESS") {
      task.status = "success";
      const downloadUrl = asString(
        response.url,
        `enhanced task ${task.taskId}.url`,
      );
      task.downloadUrlExpiresAfter = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();
      if (options.download) {
        await downloadReadyTask(
          options.config,
          options.client,
          options.state,
          task,
          downloadUrl,
        );
      }
    } else {
      throw new Error(
        `Yandex enhanced task ${task.taskId} returned unknown status ${status}`,
      );
    }
    markQueueForTask(options.queue, task);
  }
}

export async function runYandexEnhancedExport(
  config: SeoConfig,
  options: EnhancedExportOptions,
  client: ExportClient = new YandexWebmasterClient(config.yandex),
): Promise<{
  runId: string;
  state: EnhancedExportState;
  queue: EnhancedBackfillQueue;
  quota: EnhancedQuotaSnapshot;
  planned?: { paths: string[]; dates: string[]; quotaUnits: number };
  normalizedPath?: string;
  submittedTaskId?: string;
}> {
  if (!config.yandex.oauthToken) {
    throw new Error("YANDEX_OAUTH_TOKEN is required for Yandex enhanced export");
  }
  const files = enhancedPaths(config.outputDirectory);
  const identity = await resolveIdentity(config, client);
  const limitsRaw = await client.hostGet(
    identity.userId,
    identity.hostId,
    "/pro/limits",
  );
  const quota = parseEnhancedLimits(limitsRaw);
  const availableDates = parseAvailableDates(
    await client.hostGet(
      identity.userId,
      identity.hostId,
      "/pro/serp/dates",
    ),
  );
  const existingState = await loadState(files.state);
  const runId = options.runId ?? existingState?.activeRunId ?? createRunId();
  if (existingState && existingState.hostId !== identity.hostId) {
    throw new Error("Persisted Yandex enhanced state belongs to a different host");
  }
  const state: EnhancedExportState =
    existingState ?? {
      schemaVersion: 1,
      activeRunId: runId,
      hostId: identity.hostId,
      hostUrl: identity.hostUrl,
      updatedAt: isoNow(),
      tasks: [],
    };
  if (state.activeRunId !== runId) {
    throw new Error(
      `Active enhanced-export run is ${state.activeRunId}; resume it or archive its state first`,
    );
  }
  const existingQueue = await loadQueue(files.queue);
  const hasEstablishedDefaultQueue =
    existingQueue?.activeRunId === runId &&
    DEFAULT_ENHANCED_PATHS.every((pathname) =>
      existingQueue.paths.includes(pathname),
    );

  const explicitDates =
    options.startDate && options.endDate
      ? expandDateRange(options.startDate, options.endDate)
      : options.startDate || options.endDate
        ? (() => {
            throw new Error("--start and --end must be provided together");
          })()
        : undefined;
  const requestedDates =
    explicitDates ??
    (hasEstablishedDefaultQueue
      ? expandDateRange(
          existingQueue!.targetRange.startDate,
          existingQueue!.targetRange.endDate,
        )
      : latestDefaultDates(availableDates));
  const unavailable = requestedDates.filter(
    (date) => !availableDates.includes(date),
  );
  if (unavailable.length > 0) {
    throw new Error(
      `Yandex enhanced export dates are unavailable: ${unavailable
        .slice(0, 5)
        .join(", ")}${unavailable.length > 5 ? "…" : ""}`,
    );
  }
  const requestedPaths = (
    options.paths?.length ? options.paths : [...DEFAULT_ENHANCED_PATHS]
  ).map((pathname) => normalizeEnhancedPath(pathname, config.domain));
  const regionIds = uniqueSorted(options.regionIds ?? []);
  if (regionIds.some((region) => !Number.isInteger(region) || region <= 0)) {
    throw new Error("Yandex enhanced-export region IDs must be positive integers");
  }

  const sameExistingQueue =
    existingQueue?.activeRunId === runId &&
    regionsKey(existingQueue.regionIds) === regionsKey(regionIds)
      ? existingQueue
      : undefined;
  const explicitRequest = Boolean(options.paths?.length || explicitDates);
  const queue =
    sameExistingQueue && explicitRequest
      ? { ...sameExistingQueue, updatedAt: isoNow() }
      : buildQueue({
          runId,
          paths: requestedPaths,
          dates: requestedDates,
          regionIds,
          existing: sameExistingQueue,
        });
  for (const task of state.tasks) {
    markQueueForTask(queue, task);
  }

  if (options.retryFailed) {
    for (const unit of queue.units) {
      if (unit.status === "failed") {
        unit.status = "pending";
        delete unit.taskId;
      }
    }
  }

  if (options.resume || options.download) {
    await resumeTasks({
      config,
      client,
      state,
      queue,
      userId: identity.userId,
      hostId: identity.hostId,
      download: options.download === true,
    });
  }

  let planned:
    | { paths: string[]; dates: string[]; quotaUnits: number }
    | undefined;
  let submittedTaskId: string | undefined;
  const shouldInitialize = !options.resume && !options.download;
  if (shouldInitialize) {
    if (options.paths?.length || explicitDates) {
      const paths = uniqueSorted(requestedPaths);
      const dates = uniqueSorted(requestedDates);
      planned = {
        paths,
        dates,
        quotaUnits: calculateQuotaUnits(paths, dates),
      };
    } else {
      planned = chooseQueueRectangle(queue, state, quota.freeRemaining);
    }

    if (planned.paths.length + planned.dates.length > MAX_REQUEST_ITEMS) {
      throw new Error(
        `Yandex enhanced export payload contains ${planned.paths.length + planned.dates.length} ` +
          `date/path items; provider limit is ${MAX_REQUEST_ITEMS}`,
      );
    }
    if (planned.quotaUnits > quota.freeRemaining) {
      throw new Error(
        `Enhanced export needs ${planned.quotaUnits} URL-days, but only ` +
          `${quota.freeRemaining} free units remain`,
      );
    }
    const key = requestKey(planned.paths, planned.dates, regionIds);
    const duplicate = state.tasks.find(
      (task) => task.requestKey === key && task.status !== "failed",
    );
    const existingCoverage = coveredUnits(state);
    const plannedDates = planned.dates;
    const overlappingUnits = planned.paths.reduce(
      (count, pathname) =>
        count +
        plannedDates.filter((date) =>
          existingCoverage.has(unitKey(pathname, date, regionIds)),
        ).length,
      0,
    );
    if (duplicate) {
      planned = {
        paths: duplicate.paths,
        dates: duplicate.dates,
        quotaUnits: duplicate.quotaUnits,
      };
      submittedTaskId = duplicate.taskId;
    } else if (overlappingUnits > 0) {
      throw new Error(
        `Requested rectangle overlaps ${overlappingUnits} already submitted URL-day units; ` +
          "split the explicit request so it contains only uncovered units",
      );
    } else if (!options.dryRun && planned.quotaUnits > 0) {
      const now = isoNow();
      const task: EnhancedExportTask = {
        requestKey: key,
        paths: planned.paths,
        dates: planned.dates,
        regionIds,
        quotaUnits: planned.quotaUnits,
        status: "submitting",
        createdAt: now,
        updatedAt: now,
      };
      state.tasks.push(task);
      state.updatedAt = now;
      await Promise.all([
        writeJsonAtomic(files.state, state),
        writeJsonAtomic(files.queue, queue),
      ]);
      try {
        const response = await client.hostPost(
          identity.userId,
          identity.hostId,
          "/pro/serp/queries/download/",
          {
            dates: planned.dates,
            paths: planned.paths,
            region_ids: regionIds,
            use_pro_tariff: "false",
          },
        );
        task.taskId = asString(response.task_id, "enhanced init.task_id");
        task.freeQuotaUsed = asNumber(
          response.free_quota_used,
          "enhanced init.free_quota_used",
        );
        task.freeQuotaRemaining = asNumber(
          response.free_quota_remaining,
          "enhanced init.free_quota_remaining",
        );
        task.proQuotaUsed = asNumber(
          response.pro_quota_used,
          "enhanced init.pro_quota_used",
        );
        if (task.proQuotaUsed !== 0) {
          task.status = "failed";
          task.error =
            "Provider reported paid quota use despite use_pro_tariff=false";
          throw new Error(task.error);
        }
        if (task.freeQuotaUsed > planned.quotaUnits) {
          task.status = "failed";
          task.error = "Provider consumed more free quota than estimated";
          throw new Error(task.error);
        }
        task.status = "submitted";
        task.updatedAt = isoNow();
        submittedTaskId = task.taskId;
        markQueueForTask(queue, task);
      } catch (error) {
        task.status = task.taskId ? "failed" : "submitting";
        task.error = safeError(error, [config.yandex.oauthToken]);
        task.updatedAt = isoNow();
        throw error;
      } finally {
        state.updatedAt = isoNow();
        await Promise.all([
          writeJsonAtomic(files.state, state),
          writeJsonAtomic(files.queue, queue),
          snapshotState(config.outputDirectory, state, queue, quota),
        ]);
      }
    }
  }

  state.updatedAt = isoNow();
  await Promise.all([
    writeJsonAtomic(files.state, state),
    writeJsonAtomic(files.queue, queue),
    snapshotState(config.outputDirectory, state, queue, quota),
  ]);
  const normalizedPath = await storeNormalizedRecords(
    config.outputDirectory,
    state,
  );
  return {
    runId,
    state,
    queue,
    quota,
    planned,
    normalizedPath,
    submittedTaskId,
  };
}

export async function enhancedStateFileMode(
  outputDirectory: string,
): Promise<number | undefined> {
  try {
    return (await stat(enhancedPaths(outputDirectory).state)).mode & 0o777;
  } catch {
    return undefined;
  }
}
