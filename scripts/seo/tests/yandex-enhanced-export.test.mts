import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { YandexWebmasterClient } from "../clients/yandex.mts";
import type { SeoConfig } from "../config.mts";
import type { WebmasterHostCandidate } from "../discovery.mts";
import {
  calculateQuotaUnits,
  normalizeEnhancedCsv,
  parseCsv,
  parseEnhancedLimits,
  runYandexEnhancedExport,
  selectFreeSafeRectangle,
} from "../yandex-enhanced-export.mts";

const host: WebmasterHostCandidate = {
  hostId: "https:chinachild.ru:443",
  asciiHostUrl: "https://chinachild.ru/",
  verified: true,
};

function config(outputDirectory: string): SeoConfig {
  return {
    domain: "chinachild.ru",
    outputDirectory,
    google: { adcPath: "/not-used" },
    yandex: {
      oauthToken: "enhanced-secret-token",
      webmasterHostId: host.hostId,
    },
    commercialQueries: [],
  };
}

function limits(remaining = 100): Record<string, unknown> {
  return {
    limits: [
      {
        owner: "test",
        feature: "BASIC_SERP",
        limit: 100,
        used: 100 - remaining,
        remaining,
        period_start: "2026-07-30",
        period_end: "2026-07-30",
        is_active: true,
        tariff_id: "free",
      },
      {
        owner: "test",
        feature: "PRO_SERP",
        limit: 500000,
        used: 0,
        remaining: 500000,
        period_start: "2026-07-01",
        period_end: "2026-07-31",
        is_active: false,
        tariff_id: "paid",
      },
    ],
  };
}

function availableDates(): string[] {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 6, 1 + index));
    return date.toISOString().slice(0, 10);
  });
}

function mockClient(options: {
  status?: "IN_PROGRESS" | "SUCCESS" | "FAILED";
  onPost?: (body: Record<string, unknown>) => void;
} = {}) {
  let posts = 0;
  return {
    get posts(): number {
      return posts;
    },
    async getUser(): Promise<Record<string, unknown>> {
      return { user_id: 1 };
    },
    async listHosts(): Promise<{
      hosts: WebmasterHostCandidate[];
      raw: Record<string, unknown>;
    }> {
      return { hosts: [host], raw: { hosts: [] } };
    },
    discoverHost(): WebmasterHostCandidate {
      return host;
    },
    async hostGet(
      _userId: number,
      _hostId: string,
      suffix: string,
    ): Promise<Record<string, unknown>> {
      if (suffix === "/pro/limits") return limits();
      if (suffix === "/pro/serp/dates") return { dates: availableDates() };
      if (suffix.includes("/pro/serp/queries/download/")) {
        if (options.status === "FAILED") {
          return {
            download_status: "FAILED",
            error_code: "test_failed",
            error_message: "provider failed",
          };
        }
        if (options.status === "SUCCESS") {
          return {
            download_status: "SUCCESS",
            url: "https://download.example.test/export.csv",
          };
        }
        return { download_status: "IN_PROGRESS" };
      }
      throw new Error(`Unexpected GET ${suffix}`);
    },
    async hostPost(
      _userId: number,
      _hostId: string,
      suffix: string,
      body: Record<string, unknown>,
    ): Promise<Record<string, unknown>> {
      assert.equal(suffix, "/pro/serp/queries/download/");
      assert.equal(body.use_pro_tariff, "false");
      options.onPost?.(body);
      posts += 1;
      return {
        task_id: "task-1",
        free_quota_used:
          (body.paths as unknown[]).length * (body.dates as unknown[]).length,
        pro_quota_used: 0,
        total_quota_used:
          (body.paths as unknown[]).length * (body.dates as unknown[]).length,
        free_quota_remaining: 98,
        pro_quota_remaining: 500000,
      };
    },
    async downloadText(): Promise<string> {
      return (
        "Дата;Хост;URL;Запрос;Регион;Клики;Показы;Позиция\n" +
        "2026-07-30;chinachild.ru;/;онлайн школа китайского;Россия;1;4;8.5\n"
      );
    },
  };
}

test("enhanced export calculates URL-day quota and selects a useful free rectangle", () => {
  assert.equal(calculateQuotaUnits(["/", "/courses"], ["2026-07-01"]), 2);
  const selected = selectFreeSafeRectangle(
    Array.from({ length: 14 }, (_, index) => `/page-${index}`),
    availableDates(),
    100,
  );
  assert.equal(selected.quotaUnits <= 100, true);
  assert.equal(selected.paths.length, 7);
  assert.equal(selected.dates.length, 14);
  assert.deepEqual(
    selectFreeSafeRectangle(["/"], ["2026-07-30"], 0),
    { paths: [], dates: [], quotaUnits: 0 },
  );
});

test("enhanced quota parser separates free and paid limits", () => {
  const parsed = parseEnhancedLimits(limits(37));
  assert.equal(parsed.freeRemaining, 37);
  assert.equal(parsed.freeLimit.feature, "BASIC_SERP");
  assert.equal(parsed.paidLimits[0].feature, "PRO_SERP");
  assert.throws(
    () =>
      parseEnhancedLimits({
        limits: [
          {
            ...(limits().limits as Record<string, unknown>[])[1],
            is_active: true,
          },
        ],
      }),
    /free Yandex/,
  );
});

test("live basic quota shape is identified by daily period and absent tariff ID", () => {
  const parsed = parseEnhancedLimits({
    limits: [
      {
        owner: "chinachild.ru",
        feature: "PRO_SERP",
        limit: 100,
        used: 0,
        remaining: 100,
        period_start: "2026-07-30",
        period_end: "2026-07-30",
        is_active: true,
        tariff_id: null,
      },
    ],
  });
  assert.equal(parsed.freeRemaining, 100);
  assert.equal(parsed.paidLimits.length, 0);
});

test("CSV parser handles quoted delimiters and normalizes verified page rows", () => {
  const csv =
    "Date,Host,URL,Query,Region,Clicks,Impressions,Position\n" +
    '2026-07-30,chinachild.ru,/courses,"курс, китайский",Москва,2,10,4.5\n';
  assert.equal(parseCsv(csv)[1][3], "курс, китайский");
  const records = normalizeEnhancedCsv(csv, {
    taskId: "task-1",
    requestKey: "request-1",
  });
  assert.equal(records[0].page, "https://chinachild.ru/courses");
  assert.equal(records[0].ctr, 0.2);
  assert.equal(records[0].sourceMetadata.verifiedLandingPageDimension, true);
});

test("header-only partial CSV response normalizes to an honest empty set", () => {
  assert.deepEqual(
    normalizeEnhancedCsv(
      "Date,Host,URL,Query,Region,Clicks,Impressions,Position\n",
      { taskId: "task-1", requestKey: "request-1" },
    ),
    [],
  );
});

test("normalizer accepts the provider's current path and regionName headers", () => {
  const records = normalizeEnhancedCsv(
    '"date","host","path","query","regionId","regionName","clicks","impressions","position"\n' +
      '"2026-07-30","https://chinachild.ru","/repetitor-kitayskogo","репетитор китайского","225","Россия","1","3","9"\n',
    { taskId: "task-1", requestKey: "request-1" },
  );
  assert.equal(
    records[0].page,
    "https://chinachild.ru/repetitor-kitayskogo",
  );
  assert.equal(records[0].region, "Россия");
});

test("Yandex download client transparently decodes the provider gzip archive", async () => {
  const expected = '"date","host","path"\n';
  const client = new YandexWebmasterClient(
    { oauthToken: "test-token" },
    async () =>
      new Response(gzipSync(expected), {
        status: 200,
        headers: { "Content-Type": "application/octet-stream" },
      }),
  );
  assert.equal(
    await client.downloadText("https://download.example.test/export"),
    expected,
  );
});

test("repeated explicit initialization is idempotent and never enables paid quota", async () => {
  const outputDirectory = await mkdtemp(
    path.join(os.tmpdir(), "chinachild-yandex-enhanced-"),
  );
  const client = mockClient();
  const options = {
    paths: ["/", "/courses"],
    startDate: "2026-07-30",
    endDate: "2026-07-30",
    initOnly: true,
  };
  const first = await runYandexEnhancedExport(
    config(outputDirectory),
    options,
    client,
  );
  const second = await runYandexEnhancedExport(
    config(outputDirectory),
    options,
    client,
  );
  assert.equal(client.posts, 1);
  assert.equal(first.submittedTaskId, "task-1");
  assert.equal(second.submittedTaskId, "task-1");
  const stateText = await readFile(
    path.join(outputDirectory, "yandex-enhanced/state.json"),
    "utf8",
  );
  assert.equal(stateText.includes("enhanced-secret-token"), false);
});

test("partially overlapping explicit request is rejected instead of spending duplicate units", async () => {
  const outputDirectory = await mkdtemp(
    path.join(os.tmpdir(), "chinachild-yandex-overlap-"),
  );
  const client = mockClient();
  await runYandexEnhancedExport(
    config(outputDirectory),
    {
      paths: ["/"],
      startDate: "2026-07-30",
      endDate: "2026-07-30",
      initOnly: true,
    },
    client,
  );
  await assert.rejects(
    runYandexEnhancedExport(
      config(outputDirectory),
      {
        paths: ["/", "/courses"],
        startDate: "2026-07-30",
        endDate: "2026-07-30",
        initOnly: true,
      },
      client,
    ),
    /overlaps 1 already submitted/,
  );
  assert.equal(client.posts, 1);
});

test("explicit follow-up does not replace the persisted default backfill queue", async () => {
  const outputDirectory = await mkdtemp(
    path.join(os.tmpdir(), "chinachild-yandex-queue-"),
  );
  const client = mockClient();
  const initial = await runYandexEnhancedExport(
    config(outputDirectory),
    { initOnly: true },
    client,
  );
  const targetRange = initial.queue.targetRange;
  const unitCount = initial.queue.units.length;
  const followUp = await runYandexEnhancedExport(
    config(outputDirectory),
    {
      paths: ["/price"],
      startDate: "2026-07-01",
      endDate: "2026-07-01",
      initOnly: true,
    },
    client,
  );
  assert.deepEqual(followUp.queue.targetRange, targetRange);
  assert.equal(followUp.queue.units.length, unitCount);
});

test("pending asynchronous task resumes without creating a duplicate", async () => {
  const outputDirectory = await mkdtemp(
    path.join(os.tmpdir(), "chinachild-yandex-resume-"),
  );
  const client = mockClient({ status: "IN_PROGRESS" });
  const initialized = await runYandexEnhancedExport(
    config(outputDirectory),
    {
      paths: ["/"],
      startDate: "2026-07-30",
      endDate: "2026-07-30",
      initOnly: true,
    },
    client,
  );
  const resumed = await runYandexEnhancedExport(
    config(outputDirectory),
    { runId: initialized.runId, resume: true },
    client,
  );
  assert.equal(client.posts, 1);
  assert.equal(resumed.state.tasks[0].status, "in_progress");
});

test("successful asynchronous task downloads and contributes normalized rows", async () => {
  const outputDirectory = await mkdtemp(
    path.join(os.tmpdir(), "chinachild-yandex-download-"),
  );
  const client = mockClient({ status: "SUCCESS" });
  const initialized = await runYandexEnhancedExport(
    config(outputDirectory),
    {
      paths: ["/"],
      startDate: "2026-07-30",
      endDate: "2026-07-30",
      initOnly: true,
    },
    client,
  );
  const downloaded = await runYandexEnhancedExport(
    config(outputDirectory),
    { runId: initialized.runId, download: true },
    client,
  );
  assert.equal(downloaded.state.tasks[0].status, "downloaded");
  assert.equal(downloaded.state.tasks[0].normalizedRowCount, 1);
  const normalized = JSON.parse(
    await readFile(downloaded.normalizedPath!, "utf8"),
  ) as { records: unknown[] };
  assert.equal(normalized.records.length, 1);
});
