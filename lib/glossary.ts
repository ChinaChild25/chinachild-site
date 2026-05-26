import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

// GFM enabled by default (tables, autolinks, line breaks etc.).
// `gfm: true` keeps pipe-tables working; `breaks: false` preserves standard
// markdown paragraph behavior so authors can use blank lines as separators.
marked.setOptions({ gfm: true, breaks: false });

export type GlossaryTerm = {
  slug: string;
  term: string;
  shortDefinition: string;
  /** Raw markdown body (без frontmatter). */
  body: string;
  /** Pre-rendered HTML — готов к `dangerouslySetInnerHTML`. */
  bodyHtml: string;
  related: string[];
  updatedAt: string;
};

const GLOSSARY_DIR = path.join(process.cwd(), "content", "glossary");

function parseFrontmatter(source: string): { fm: Record<string, string>; content: string } {
  if (!source.startsWith("---")) return { fm: {}, content: source.trim() };
  const end = source.indexOf("\n---", 3);
  if (end === -1) return { fm: {}, content: source.trim() };
  const frontmatter = source.slice(3, end).trim();
  const content = source.slice(end + 4).trim();
  const fm = frontmatter
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return acc;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
      acc[key] = value;
      return acc;
    }, {});
  return { fm, content };
}

function build(slug: string, source: string): GlossaryTerm {
  const { fm, content } = parseFrontmatter(source);
  // Контент в .mdx-файлах — обычный GFM-markdown. Парсим его в HTML здесь,
  // чтобы на странице не приходилось тащить markdown-парсер в клиентский бандл
  // и не было соблазна вывести raw-маркдаун `<p>`-параграфами (как было раньше).
  const bodyHtml = marked.parse(content, { async: false }) as string;
  return {
    slug,
    term: fm.term ?? slug,
    shortDefinition: fm.shortDefinition ?? "",
    body: content,
    bodyHtml,
    related: (fm.related ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    updatedAt: fm.updatedAt ?? new Date().toISOString(),
  };
}

export async function getAllGlossaryTerms(): Promise<GlossaryTerm[]> {
  const files = await readdir(GLOSSARY_DIR);
  const terms = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (f) => {
        const slug = f.replace(/\.mdx$/, "");
        const source = await readFile(path.join(GLOSSARY_DIR, f), "utf8");
        return build(slug, source);
      }),
  );
  return terms.sort((a, b) => a.term.localeCompare(b.term, "ru"));
}

export async function getGlossaryTermBySlug(slug: string): Promise<GlossaryTerm | null> {
  try {
    const source = await readFile(path.join(GLOSSARY_DIR, `${slug}.mdx`), "utf8");
    return build(slug, source);
  } catch {
    return null;
  }
}

export async function getGlossarySlugs(): Promise<string[]> {
  const files = await readdir(GLOSSARY_DIR);
  return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}
