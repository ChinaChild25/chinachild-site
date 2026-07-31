import { readFileSync } from "node:fs";
import { runSeoCheck } from "./check.mts";
import { runCollection } from "./collect.mts";
import { generateCommercialEvidence } from "./commercial-evidence.mts";
import { loadSeoConfig } from "./config.mts";
import { buildComparisonRange } from "./date-range.mts";
import { generateSeoReport } from "./reports.mts";
import {
  normalizeEnhancedPath,
  runYandexEnhancedExport,
} from "./yandex-enhanced-export.mts";
import { auditYandexEducationFeed } from "./yandex-education.mts";

type CliOptions = Record<string, string | boolean>;

function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    const equals = arg.indexOf("=");
    if (equals >= 0) {
      options[arg.slice(2, equals)] = arg.slice(equals + 1);
      continue;
    }
    const name = arg.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      options[name] = next;
      index += 1;
    } else {
      options[name] = true;
    }
  }
  return options;
}

function stringOption(options: CliOptions, name: string): string | undefined {
  const value = options[name];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`--${name} requires a value`);
  return value;
}

function booleanOption(options: CliOptions, name: string): boolean {
  const value = options[name];
  if (value === undefined) return false;
  if (value !== true) throw new Error(`--${name} does not take a value`);
  return true;
}

function csvOption(options: CliOptions, name: string): string[] | undefined {
  const value = stringOption(options, name);
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function enhancedUrls(options: CliOptions, domain: string): string[] | undefined {
  const inline = csvOption(options, "urls") ?? [];
  const filename = stringOption(options, "urls-file");
  const fromFile = filename
    ? readFileSync(filename, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
    : [];
  const values = [...inline, ...fromFile];
  return values.length
    ? values.map((value) => normalizeEnhancedPath(value, domain))
    : undefined;
}

function printCheck(items: Awaited<ReturnType<typeof runSeoCheck>>): void {
  const order = [
    "yandex_webmaster",
    "yandex_metrika",
    "google_search_console",
    "google_analytics",
  ];
  for (const provider of order) {
    for (const item of items.filter((candidate) => candidate.provider === provider)) {
      const marker =
        item.status === "ok" ? "OK" : item.status === "missing" ? "MISSING" : "ERROR";
      console.log(`[${marker}] ${item.provider}: ${item.message}`);
      for (const detail of item.details ?? []) console.log(`  - ${detail}`);
    }
  }
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  const options = parseOptions(args);
  const config = loadSeoConfig();

  if (command === "check") {
    const items = await runSeoCheck(config);
    printCheck(items);
    if (items.some((item) => item.status !== "ok")) process.exitCode = 1;
    return;
  }

  if (command === "collect") {
    const daysValue = stringOption(options, "days");
    const ranges = buildComparisonRange({
      days: daysValue === undefined ? undefined : Number(daysValue),
      startDate: stringOption(options, "start"),
      endDate: stringOption(options, "end"),
    });
    console.log(
      `Collecting current ${ranges.current.startDate}..${ranges.current.endDate} ` +
        `and previous ${ranges.previous.startDate}..${ranges.previous.endDate}`,
    );
    const result = await runCollection(config, ranges);
    for (const metadata of result.collection.sourceMetadata) {
      console.log(
        `[${metadata.status.toUpperCase()}] ${metadata.provider}: ` +
          `${metadata.recordCount} normalized records, ${metadata.requestCount} requests` +
          (metadata.error ? ` — ${metadata.error}` : ""),
      );
    }
    console.log(`Stored run ${result.stored.runId} in ${result.stored.runDirectory}`);
    if (
      result.collection.sourceMetadata.some(
        (metadata) => metadata.status !== "success",
      )
    ) {
      process.exitCode = 1;
    }
    return;
  }

  if (command === "report") {
    const result = await generateSeoReport(
      config.outputDirectory,
      stringOption(options, "run"),
    );
    console.log(`Report written to ${result.reportDirectory}`);
    console.log(`Owner summary: ${result.summaryPath}`);
    return;
  }

  if (command === "yandex-export") {
    const regionValues = csvOption(options, "regions");
    const result = await runYandexEnhancedExport(config, {
      paths: enhancedUrls(options, config.domain),
      startDate: stringOption(options, "start"),
      endDate: stringOption(options, "end"),
      regionIds: regionValues?.map((value) => {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          throw new Error("--regions must contain positive integer IDs");
        }
        return parsed;
      }),
      runId: stringOption(options, "run"),
      dryRun: booleanOption(options, "dry-run"),
      initOnly: booleanOption(options, "init-only"),
      resume: booleanOption(options, "resume"),
      download: booleanOption(options, "download"),
      retryFailed: booleanOption(options, "retry-failed"),
    });
    console.log(
      `Yandex enhanced export run ${result.runId}: ` +
        `${result.quota.freeRemaining} free URL-day units were available before this command.`,
    );
    if (result.planned) {
      console.log(
        `Planned ${result.planned.paths.length} URLs × ${result.planned.dates.length} days = ` +
          `${result.planned.quotaUnits} free units.`,
      );
    }
    if (result.submittedTaskId) {
      console.log(`Task ${result.submittedTaskId} is persisted for resume.`);
    }
    for (const task of result.state.tasks) {
      console.log(
        `[${task.status.toUpperCase()}] ${task.taskId ?? "task-id-not-returned"}: ` +
          `${task.quotaUnits} URL-days` +
          (task.error ? ` — ${task.error}` : ""),
      );
    }
    const pending = result.queue.units.filter(
      (unit) => unit.status === "pending",
    ).length;
    console.log(
      `Backfill queue: ${pending} pending of ${result.queue.units.length} URL-days.`,
    );
    return;
  }

  if (command === "commercial-evidence") {
    const evidenceRunId = stringOption(options, "run");
    if (!evidenceRunId) {
      throw new Error("commercial-evidence requires --run=EVIDENCE_RUN_ID");
    }
    const result = await generateCommercialEvidence(config, {
      evidenceRunId,
      sourceRunId: stringOption(options, "source-run"),
      buildDirectory: stringOption(options, "build-directory"),
      probeLive: booleanOption(options, "probe-live"),
    });
    console.log(`Commercial evidence written to ${result.reportDirectory}`);
    console.log(`Decision summary: ${result.summaryPath}`);
    return;
  }

  if (command === "yandex-education") {
    const result = await auditYandexEducationFeed({
      allowEmpty: booleanOption(options, "allow-empty"),
      baseUrl: stringOption(options, "base-url"),
    });
    for (const check of result.checks) console.log(`[PASS] ${check}`);
    for (const error of result.errors) console.error(`[FAIL] ${error}`);
    console.log(
      `Yandex Education feed: ${result.offerCount} offers, ${result.errors.length} errors`,
    );
    if (result.errors.length) process.exitCode = 1;
    return;
  }

  throw new Error(
    "Usage: cli.mts <check|collect|report|yandex-export|commercial-evidence|yandex-education> " +
      "[--days=90 | --start=YYYY-MM-DD --end=YYYY-MM-DD] [--run=RUN_ID] " +
      "[--urls=/,/courses | --urls-file=FILE] [--regions=ID,ID] " +
      "[--dry-run|--init-only|--resume|--download] [--retry-failed] " +
      "[--source-run=RUN_ID] [--build-directory=PATH] [--probe-live] " +
      "[--base-url=URL] [--allow-empty]",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
