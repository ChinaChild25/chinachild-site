import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NormalizedCollection, SourceResult } from "./types.mts";
import { asRecord, asString } from "./validation.mts";

export type StoredRun = {
  runId: string;
  runDirectory: string;
  collectionPath: string;
};

export function createRunId(now = new Date()): string {
  return now.toISOString().replace(/[:.]/g, "-");
}

async function writeJson(filename: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, `${JSON.stringify(value, null, 2)}\n`, {
    mode: 0o600,
  });
}

export async function storeCollection(
  outputDirectory: string,
  collection: NormalizedCollection,
  sources: readonly SourceResult[],
): Promise<StoredRun> {
  const runDirectory = path.join(outputDirectory, "runs", collection.runId);
  const normalizedDirectory = path.join(runDirectory, "normalized");
  const rawDirectory = path.join(runDirectory, "raw");
  await mkdir(normalizedDirectory, { recursive: true, mode: 0o700 });
  await mkdir(rawDirectory, { recursive: true, mode: 0o700 });

  for (const source of sources) {
    await writeJson(path.join(rawDirectory, `${source.provider}.json`), {
      provider: source.provider,
      metadata: source.metadata,
      diagnostics: source.diagnostics,
      data: source.raw,
    });
  }

  const collectionPath = path.join(normalizedDirectory, "collection.json");
  await Promise.all([
    writeJson(collectionPath, collection),
    writeJson(
      path.join(normalizedDirectory, "search-performance.json"),
      collection.searchPerformance,
    ),
    writeJson(path.join(normalizedDirectory, "traffic.json"), collection.traffic),
    writeJson(path.join(normalizedDirectory, "goals.json"), collection.goals),
    writeJson(
      path.join(normalizedDirectory, "technical.json"),
      collection.technical,
    ),
    writeJson(
      path.join(runDirectory, "collection-metadata.json"),
      collection.sourceMetadata,
    ),
  ]);

  await writeJson(path.join(outputDirectory, "latest.json"), {
    schemaVersion: 1,
    runId: collection.runId,
    collectionPath: path.relative(outputDirectory, collectionPath),
    updatedAt: new Date().toISOString(),
  });
  return { runId: collection.runId, runDirectory, collectionPath };
}

export async function loadCollection(
  outputDirectory: string,
  requestedRunId?: string,
): Promise<NormalizedCollection> {
  let collectionPath: string;
  if (requestedRunId) {
    collectionPath = path.join(
      outputDirectory,
      "runs",
      requestedRunId,
      "normalized/collection.json",
    );
  } else {
    const latestRaw: unknown = JSON.parse(
      await readFile(path.join(outputDirectory, "latest.json"), "utf8"),
    );
    const latest = asRecord(latestRaw, "seo-data/latest.json");
    const relativePath = asString(
      latest.collectionPath,
      "seo-data/latest.json.collectionPath",
    );
    collectionPath = path.resolve(outputDirectory, relativePath);
    const relative = path.relative(outputDirectory, collectionPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("seo-data/latest.json points outside seo-data");
    }
  }
  const parsed: unknown = JSON.parse(await readFile(collectionPath, "utf8"));
  const collection = asRecord(parsed, "normalized collection");
  if (collection.schemaVersion !== 1) {
    throw new Error("normalized collection has an unsupported schemaVersion");
  }
  return parsed as NormalizedCollection;
}

export async function writeReportFiles(
  outputDirectory: string,
  runId: string,
  files: Record<string, string>,
): Promise<string> {
  const reportDirectory = path.join(outputDirectory, "reports", runId);
  for (const [relativeFilename, contents] of Object.entries(files)) {
    const filename = path.join(reportDirectory, relativeFilename);
    const relative = path.relative(reportDirectory, filename);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`Report path escapes report directory: ${relativeFilename}`);
    }
    await mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
    await writeFile(filename, contents, { mode: 0o600 });
  }
  await writeJson(path.join(outputDirectory, "reports", "latest.json"), {
    schemaVersion: 1,
    runId,
    reportDirectory: path.relative(outputDirectory, reportDirectory),
    updatedAt: new Date().toISOString(),
  });
  return reportDirectory;
}
