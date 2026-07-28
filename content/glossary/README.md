# Глоссарий ChinaChild

Status: current authoring contract.

Every `*.mdx` file in this folder becomes `/glossary/[slug]`.

## Source of truth

- Frontmatter/body example: `_TEMPLATE.mdx.example`
- Parser: `lib/glossary.ts`
- Page rendering: `app/glossary/[slug]/page.tsx`
- URL discovery: `app/sitemap-pages.xml/route.ts`

Do not maintain term counts, completed-term lists, or speculative content plans
in this README; the filesystem and approved editorial plan are authoritative.

## Required frontmatter

- `term` — displayed term.
- `shortDefinition` — concise definition used on the page and in metadata.
- `related` — comma-separated existing glossary slugs.
- `updatedAt` — ISO timestamp used by schema/sitemap freshness.

The filename is the canonical public slug. Use lowercase Latin
characters/numbers and hyphens. Renaming a published file changes its URL and
requires explicit redirect/SEO scope.

The body is GFM Markdown parsed on the server by `marked`; it is not an
arbitrary MDX component runtime. Keep definitions factual and ensure every
`related` slug resolves.

## Validation

```bash
npm run typecheck
npm run build
```

Check the rendered definition, related links, canonical metadata, structured
data, and its entry in `sitemap-pages.xml`. Deployment and IndexNow submission
are separate external actions.
