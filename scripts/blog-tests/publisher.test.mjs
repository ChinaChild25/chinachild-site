import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const publisher = path.resolve("scripts/publish-scheduled-blog.mjs");
const article = "---\ntitle: Test\ndate: 2000-01-01\ndateModified: 2000-01-01\n---\nBody\n";

function fixture(t, order, files = order) {
  const root = mkdtempSync(path.join(os.tmpdir(), "blog-publisher-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, "content/scheduled-blog"), { recursive: true });
  mkdirSync(path.join(root, "content/blog"), { recursive: true });
  writeFileSync(path.join(root, "content/scheduled-blog/order.txt"), order.join("\n") + "\n");
  for (const slug of files) writeFileSync(path.join(root, `content/scheduled-blog/${slug}.mdx`), article);
  return {
    root,
    run: (count = "1") => spawnSync(process.execPath, [publisher], {
      cwd: root, env: { ...process.env, PUBLISH_COUNT: count }, encoding: "utf8",
    }),
    read: (file) => readFileSync(path.join(root, file), "utf8"),
    exists: (file) => existsSync(path.join(root, file)),
  };
}

test("publisher moves only the requested articles, updates dates and preserves remaining order", (t) => {
  const f = fixture(t, ["first", "second", "third"]);
  assert.equal(f.run("2").status, 0);
  assert.equal(f.read("content/scheduled-blog/order.txt"), "third\n");
  assert.equal(f.exists("content/scheduled-blog/first.mdx"), false);
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(f.read("content/blog/first.mdx").includes(`date: ${today}\ndateModified: ${today}`));
  assert.equal(f.read("content/scheduled-blog/third.mdx"), article);
});

for (const failure of ["missing", "conflict", "duplicate", "unsafe", "invalid-count"]) {
  test(`publisher leaves article files and queue intact on ${failure}`, (t) => {
    const order = failure === "duplicate" ? ["first", "first"] : failure === "unsafe" ? ["first", "../escape"] : ["first", "second"];
    const f = fixture(t, order, failure === "missing" || failure === "unsafe" ? ["first"] : ["first", "second"]);
    if (failure === "conflict") writeFileSync(path.join(f.root, "content/blog/second.mdx"), "existing");
    const before = f.read("content/scheduled-blog/order.txt");
    assert.notEqual(f.run(failure === "invalid-count" ? "1; echo unsafe" : "2").status, 0);
    assert.equal(f.read("content/scheduled-blog/order.txt"), before);
    assert.equal(f.read("content/scheduled-blog/first.mdx"), article);
    assert.equal(f.exists("content/blog/first.mdx"), false);
    if (failure === "conflict") assert.equal(f.read("content/blog/second.mdx"), "existing");
  });
}

test("empty queue is a successful no-op", (t) => {
  const f = fixture(t, []);
  assert.equal(f.run().status, 0);
  assert.equal(f.exists("content/blog/first.mdx"), false);
});
