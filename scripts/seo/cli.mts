import { runSeoCheck } from "./check.mts";
import { runCollection } from "./collect.mts";
import { loadSeoConfig } from "./config.mts";
import { buildComparisonRange } from "./date-range.mts";
import { generateSeoReport } from "./reports.mts";

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

  throw new Error(
    "Usage: cli.mts <check|collect|report> [--days=90 | --start=YYYY-MM-DD --end=YYYY-MM-DD] [--run=RUN_ID]",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
