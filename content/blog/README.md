# Блог ChinaChild

Status: current authoring contract.

Every published `*.mdx` file in this folder becomes `/blog/[slug]`.
`content/scheduled-blog` is a protected queue and must not be moved or
published manually unless that action was explicitly requested.

## Source of truth

- Frontmatter/body example: `_TEMPLATE.mdx.example`
- Parser and supported custom blocks: `lib/blog.ts`
- Page rendering: `app/blog/[slug]/page.tsx`
- Category hubs: `lib/blog-hubs.ts`
- Discovery: `app/sitemap-blog.xml/route.ts` and `app/feed.xml/route.ts`
- Scheduled publishing: `scripts/publish-scheduled-blog.mjs`

Do not maintain article counts or slug inventories in this README; the
filesystem is authoritative.

## Required frontmatter

- `title` — SERP/page title.
- `description` — meta description.
- `excerpt` — card summary.
- `category` — supported category used by blog hubs.
- `readingTime` — displayed estimate.
- `date` and `dateModified` — ISO timestamps.
- `author` — a valid teacher slug from `lib/site-data.ts`.
- `keywords` — comma-separated topic terms.

The filename is the canonical slug: lowercase Latin characters/numbers and
hyphens, without spaces. Changing a published filename changes its public URL
and requires explicit redirect/SEO scope.

## Content behavior

The project parses constrained Markdown plus custom blocks; it does not execute
arbitrary MDX components. Tables, headings, lists, emphasis, images, and the
documented `:::image`/`:::audio` JSON blocks are supported by `lib/blog.ts`.

The page automatically provides metadata, Article/LearningResource schema,
table of contents for sufficiently structured articles, related links,
autolinking, and the site-wide CTA. Do not duplicate those mechanisms inside an
article.

## Generated images

An empty `:::image` block can be filled by the generation script:

```text
:::image
{
  "src": "",
  "alt": "Содержательное описание",
  "caption": "Необязательная подпись",
  "prompt": "Detailed generation prompt"
}
:::
```

```bash
npm run gen:images:dry
npm run gen:images
```

The dry run is read-only. The real command calls an external API, writes
generated files, and updates article sources; run it only with explicit
authorization.

## Generated audio

```text
:::audio
{
  "src": "",
  "hanzi": "你好",
  "pinyin": "nǐ hǎo",
  "translation": "Здравствуйте",
  "ttsText": "你好"
}
:::
```

```bash
npm run gen:audio:dry
npm run gen:audio
```

The real command calls OpenAI, uploads to protected Supabase Storage, and writes
the resulting public URL into the article. `ttsText` defaults to `hanzi`.

## Validation

For an ordinary article edit:

```bash
npm run typecheck
npm run build
```

Check the rendered article, author, headings/TOC, media, canonical metadata,
JSON-LD, blog sitemap, and feed. Publishing, IndexNow submission, commits, and
deployments are separate external actions and require their own authorization.
