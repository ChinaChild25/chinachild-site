import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  dateModified: string;
  authorSlug: string;
  keywords: string[];
  content: string;
};

export type MistakeItem = { title: string; description: string };
export type StatItem = { value: string; unit?: string; label: string };
export type CalloutVariant = "tip" | "info" | "warning" | "note";
export type FaqEntry = { question: string; answer: string };

export type ArticleBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; src: string; alt: string }
  | { type: "tldr"; points: string[] }
  | {
      type: "callout";
      variant: CalloutVariant;
      title?: string;
      body: string;
    }
  | {
      type: "mistakes";
      heading?: string;
      intro?: string;
      items: MistakeItem[];
    }
  | { type: "stats"; items: StatItem[] }
  | {
      type: "faq";
      title?: string;
      description?: string;
      items: FaqEntry[];
      jsonLd?: boolean;
    };

const BLOG_DIRECTORY = path.join(process.cwd(), "content", "blog");

function parseFrontmatter(source: string): { frontmatter: string; content: string } {
  if (!source.startsWith("---")) {
    return { frontmatter: "", content: source.trim() };
  }

  const endIndex = source.indexOf("\n---", 3);

  if (endIndex === -1) {
    return { frontmatter: "", content: source.trim() };
  }

  return {
    frontmatter: source.slice(3, endIndex).trim(),
    content: source.slice(endIndex + 4).trim(),
  };
}

function frontmatterToObject(frontmatter: string): Record<string, string> {
  return frontmatter
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");

      accumulator[key] = value;
      return accumulator;
    }, {});
}

function buildBlogPost(slug: string, source: string): BlogPost {
  const { frontmatter, content } = parseFrontmatter(source);
  const fields = frontmatterToObject(frontmatter);
  const date = fields.date ?? new Date().toISOString();

  return {
    slug,
    title: fields.title ?? slug,
    description: fields.description ?? "",
    excerpt: fields.excerpt ?? fields.description ?? "",
    category: fields.category ?? "Блог",
    readingTime: fields.readingTime ?? "6 минут",
    date,
    dateModified: fields.dateModified ?? date,
    authorSlug: fields.author ?? "anastasia-ponomareva",
    keywords: (fields.keywords ?? "")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    content,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const fileNames = await readdir(BLOG_DIRECTORY);

  const posts = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".mdx"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.mdx$/, "");
        const source = await readFile(path.join(BLOG_DIRECTORY, fileName), "utf8");
        return buildBlogPost(slug, source);
      }),
  );

  return posts.sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export async function getLatestPosts(limit = 3): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.slice(0, limit);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const source = await readFile(path.join(BLOG_DIRECTORY, `${slug}.mdx`), "utf8");
    return buildBlogPost(slug, source);
  } catch {
    return null;
  }
}

export async function getBlogPostSlugs(): Promise<string[]> {
  const fileNames = await readdir(BLOG_DIRECTORY);
  return fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => fileName.replace(/\.mdx$/, ""));
}

export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** Распарсивает строку формата `| cell1 | cell2 |` в массив ячеек.
 *  Trailing/leading pipe + whitespace отбрасываются. */
function parseTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** Проверяет, что строка — separator-row markdown-таблицы:
 *  `|---|---|` или `| :--- | ---: |` (с возможным выравниванием). */
function isTableSeparator(line: string): boolean {
  if (!line.startsWith("|")) return false;
  const cells = parseTableRow(line);
  if (cells.length === 0) return false;
  return cells.every((c) => /^:?-{3,}:?$/.test(c));
}

const CALLOUT_VARIANTS: CalloutVariant[] = ["tip", "info", "warning", "note"];

function parseDirective(name: string, payload: string): ArticleBlock | null {
  const trimmed = payload.trim();
  if (!trimmed) return null;
  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (name === "tldr") {
    const points = Array.isArray(d.points) ? (d.points as unknown[]) : [];
    const filtered = points.filter((p): p is string => typeof p === "string");
    if (filtered.length === 0) return null;
    return { type: "tldr", points: filtered };
  }

  if (name === "callout") {
    const variant = CALLOUT_VARIANTS.includes(d.variant as CalloutVariant)
      ? (d.variant as CalloutVariant)
      : "note";
    const body = typeof d.body === "string" ? d.body : "";
    if (!body) return null;
    return {
      type: "callout",
      variant,
      title: typeof d.title === "string" ? d.title : undefined,
      body,
    };
  }

  if (name === "mistakes") {
    const rawItems = Array.isArray(d.items) ? d.items : [];
    const items: MistakeItem[] = rawItems
      .filter(
        (it): it is { title: string; description: string } =>
          !!it &&
          typeof it === "object" &&
          typeof (it as Record<string, unknown>).title === "string" &&
          typeof (it as Record<string, unknown>).description === "string",
      )
      .map((it) => ({ title: it.title, description: it.description }));
    if (items.length === 0) return null;
    return {
      type: "mistakes",
      heading: typeof d.heading === "string" ? d.heading : undefined,
      intro: typeof d.intro === "string" ? d.intro : undefined,
      items,
    };
  }

  if (name === "stats") {
    const rawItems = Array.isArray(d.items) ? d.items : [];
    const items: StatItem[] = rawItems
      .filter(
        (it): it is { value: string; label: string; unit?: string } =>
          !!it &&
          typeof it === "object" &&
          typeof (it as Record<string, unknown>).value === "string" &&
          typeof (it as Record<string, unknown>).label === "string",
      )
      .map((it) => ({
        value: it.value,
        label: it.label,
        unit: typeof (it as Record<string, unknown>).unit === "string"
          ? (it as { unit: string }).unit
          : undefined,
      }));
    if (items.length === 0) return null;
    return { type: "stats", items };
  }

  if (name === "faq") {
    const rawItems = Array.isArray(d.items) ? d.items : [];
    const items: FaqEntry[] = rawItems
      .filter(
        (it): it is { question: string; answer: string } =>
          !!it &&
          typeof it === "object" &&
          typeof (it as Record<string, unknown>).question === "string" &&
          typeof (it as Record<string, unknown>).answer === "string",
      )
      .map((it) => ({ question: it.question, answer: it.answer }));
    if (items.length === 0) return null;
    return {
      type: "faq",
      title: typeof d.title === "string" ? d.title : undefined,
      description: typeof d.description === "string" ? d.description : undefined,
      items,
      jsonLd: d.jsonLd === false ? false : true,
    };
  }

  return null;
}

export function parseArticleBlocks(content: string): ArticleBlock[] {
  const lines = content.split("\n");
  const blocks: ArticleBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphBuffer.join(" ").trim(),
    });
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) {
      return;
    }

    blocks.push({
      type: "list",
      items: [...listBuffer],
    });
    listBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // ::: directive block. Format:
    //   :::<name>
    //   { ...JSON payload... }
    //   :::
    // Unknown / malformed directives are skipped silently — the raw fence
    // disappears but content authors don't crash the build.
    if (line.startsWith(":::") && line.length > 3) {
      flushParagraph();
      flushList();
      const name = line.slice(3).trim();
      const payloadLines: string[] = [];
      i++;
      let closed = false;
      while (i < lines.length) {
        const inner = lines[i];
        if (inner.trim() === ":::") {
          closed = true;
          break;
        }
        payloadLines.push(inner);
        i++;
      }
      if (closed) {
        const directive = parseDirective(name, payloadLines.join("\n"));
        if (directive) blocks.push(directive);
      }
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 2, text: line.replace("## ", "") });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 3, text: line.replace("### ", "") });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(line.replace("- ", ""));
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      listBuffer.push(line.replace(/^\d+\.\s/, ""));
      continue;
    }

    // Markdown-таблица: текущая строка `| ... |`, следующая — separator.
    if (line.startsWith("|") && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (isTableSeparator(nextLine)) {
        flushParagraph();
        flushList();
        const headers = parseTableRow(line);
        const rows: string[][] = [];
        i += 2; // пропускаем header и separator
        while (i < lines.length) {
          const dataLine = lines[i].trim();
          if (!dataLine.startsWith("|")) break;
          rows.push(parseTableRow(dataLine));
          i++;
        }
        i--; // компенсируем for-loop's i++
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    // Markdown-картинка: `![alt](url)` на отдельной строке.
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "image", alt: imageMatch[1], src: imageMatch[2] });
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
