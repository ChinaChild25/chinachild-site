import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseArticleBlocks } from "../../lib/blog.ts";

test("queued articles have valid dates, metadata, directives and available article links", () => {
  const directory = "content/scheduled-blog";
  const order = readFileSync(`${directory}/order.txt`, "utf8").split(/\r?\n/)
    .map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  const queuedFiles = readdirSync(directory).filter((file) => file.endsWith(".mdx")).map((file) => file.slice(0, -4));
  assert.equal(new Set(order).size, order.length, "duplicate queue entries");
  assert.deepEqual([...order].sort(), queuedFiles.sort(), "orphaned or missing queued articles");
  const available = new Set(readdirSync("content/blog").filter((file) => file.endsWith(".mdx")).map((file) => file.slice(0, -4)));
  const teacherSource = readFileSync("lib/site-data.ts", "utf8").match(/^export const teachers: Teacher\[\] = \[([\s\S]*?)^\];/m)?.[1];
  assert.ok(teacherSource, "teacher contract not found");
  const authors = new Set([...teacherSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]));
  let previousDate = "";
  for (const slug of order) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!available.has(slug), `${slug} is already published`);
    const source = readFileSync(`${directory}/${slug}.mdx`, "utf8");
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    assert.ok(frontmatter, `${slug}: missing frontmatter`);
    const fields = Object.fromEntries(frontmatter[1].split(/\r?\n/).map((line) => {
      const index = line.indexOf(":");
      return [line.slice(0, index), line.slice(index + 1).trim().replace(/^"|"$/g, "")];
    }));
    for (const key of ["title", "description", "excerpt", "category", "readingTime", "date", "dateModified", "author", "keywords"]) {
      assert.ok(fields[key], `${slug}: missing ${key}`);
    }
    assert.ok(authors.has(fields.author), `${slug}: unknown author`);
    const date = fields.date;
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(date).toISOString().slice(0, 10), date, `${slug}: invalid date`);
    assert.ok(date > previousDate, `${slug}: dates must increase with queue order`);
    assert.ok(date === "2026-11-20" || [1, 4].includes(new Date(date).getUTCDay()), `${slug}: outside Monday/Thursday schedule`);
    assert.equal(fields.dateModified, date, `${slug}: modification date differs`);
    previousDate = date;
    const body = source.slice(frontmatter[0].length);
    const directives = [...body.matchAll(/^:::(\w+)\s*\n([\s\S]*?)\n^:::\s*$/gm)];
    const parsed = parseArticleBlocks(body);
    const directiveBlocks = parsed.filter((block) => !["heading", "paragraph", "list", "table"].includes(block.type));
    assert.equal(directives.length, (body.match(/^:::\w+/gm) ?? []).length, `${slug}: unclosed directive`);
    assert.equal(directiveBlocks.length, directives.length, `${slug}: silently discarded directive`);
    for (const [, kind, payload] of directives) {
      const data = JSON.parse(payload);
      if (kind === "audio") {
        assert.ok(data.hanzi && data.pinyin, `${slug}: incomplete audio`);
      }
      if (kind === "image") assert.ok(data.src && data.alt, `${slug}: unfinished image`);
    }
    for (const match of body.matchAll(/\]\(\/blog\/([^/)#?]+)(?:[?#][^)]*)?\)/g)) {
      assert.ok(available.has(match[1]), `${slug}: link to unavailable article ${match[1]}`);
    }
    for (const match of body.matchAll(/!\[[^\]]*\]\((\/[^)#?]+)(?:[?#][^)]*)?\)/g)) {
      assert.ok(existsSync(path.join("public", match[1])), `${slug}: missing local image ${match[1]}`);
    }
    available.add(slug);
  }
});
