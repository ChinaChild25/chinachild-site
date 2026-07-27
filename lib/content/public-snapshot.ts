import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const PUBLIC_CONTENT_SNAPSHOT_PATH = path.join(
  process.cwd(),
  ".generated",
  "public-content-snapshot.json",
);

export type PublicContentSnapshot = {
  version: 1;
  generatedAt: string;
  requestCount: number;
  publicWordCount: number;
  tables: {
    vocabDecks: unknown[];
    vocabDeckItems: unknown[];
    vocabTerms: unknown[];
    vocabPronunciations: unknown[];
    vocabSenses: unknown[];
    vocabExamples: unknown[];
    vocabAudioAssets: unknown[];
    vocabCharacters: unknown[];
    characterStrokeAssets: unknown[];
    grammarArticles: unknown[];
    grammarBlocks: unknown[];
    grammarTags: unknown[];
    grammarSections: unknown[];
    grammarArticleTags: unknown[];
    grammarArticleSections: unknown[];
  };
};

let snapshotPromise: Promise<PublicContentSnapshot> | undefined;

export function getPublicContentSnapshot(): Promise<PublicContentSnapshot> {
  snapshotPromise ??= readFile(PUBLIC_CONTENT_SNAPSHOT_PATH, "utf8").then((raw) => {
    const snapshot = JSON.parse(raw) as PublicContentSnapshot;
    if (snapshot.version !== 1 || snapshot.publicWordCount !== snapshot.tables.vocabTerms.length) {
      throw new Error("Invalid public content snapshot. Run the build snapshot generator again.");
    }
    return snapshot;
  });
  return snapshotPromise;
}
