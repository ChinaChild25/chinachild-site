import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scheduledDir = path.join(root, "content", "scheduled-blog");
const blogDir = path.join(root, "content", "blog");
const orderPath = path.join(scheduledDir, "order.txt");

const count = Number(process.env.PUBLISH_COUNT || "1");

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function updateFrontmatterDates(source) {
  const today = todayISO();

  let text = source;

  if (/^date:\s*.+$/m.test(text)) {
    text = text.replace(/^date:\s*.+$/m, `date: ${today}`);
  } else {
    text = text.replace(/^---\n/, `---\ndate: ${today}\n`);
  }

  if (/^dateModified:\s*.+$/m.test(text)) {
    text = text.replace(/^dateModified:\s*.+$/m, `dateModified: ${today}`);
  } else {
    text = text.replace(/^---\n/, `---\ndateModified: ${today}\n`);
  }

  return text;
}

if (!Number.isInteger(count) || count < 1) {
  console.error("PUBLISH_COUNT must be a positive integer.");
  process.exit(1);
}

if (!fs.existsSync(orderPath)) {
  console.error("No content/scheduled-blog/order.txt found.");
  process.exit(1);
}

fs.mkdirSync(blogDir, { recursive: true });

const order = fs
  .readFileSync(orderPath, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((line) => !line.startsWith("#"));

if (order.length === 0) {
  console.log("No scheduled posts left.");
  process.exit(0);
}

const toPublish = order.slice(0, count);
const remaining = order.slice(count);

if (new Set(order).size !== order.length || order.some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) {
  console.error("Queue must contain unique, safe article slugs.");
  process.exit(1);
}

// Validate and read the entire batch before moving any article. A missing file
// or slug conflict must leave the queue and previously checked articles intact.
const plan = toPublish.map((slug) => {
  const from = path.join(scheduledDir, `${slug}.mdx`);
  const to = path.join(blogDir, `${slug}.mdx`);

  if (!fs.existsSync(from)) {
    console.error(`Scheduled file not found: ${from}`);
    console.error("Check content/scheduled-blog/order.txt and filenames.");
    process.exit(1);
  }

  if (fs.existsSync(to)) {
    console.error(`Target already exists: ${to}`);
    console.error("This article is already published or there is a slug conflict.");
    process.exit(1);
  }

  return { slug, from, to, updated: updateFrontmatterDates(fs.readFileSync(from, "utf8")) };
});

const published = [];
for (const { slug, from, to, updated } of plan) {
  fs.writeFileSync(to, updated);
  fs.rmSync(from);

  published.push(slug);
}

fs.writeFileSync(orderPath, remaining.join("\n") + (remaining.length ? "\n" : ""));

console.log(`Published ${published.length} post(s):`);
for (const slug of published) {
  console.log(`- ${slug}`);
}

console.log(`Remaining scheduled posts: ${remaining.length}`);
