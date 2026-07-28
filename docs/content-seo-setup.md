# Public grammar and dictionary integration

Status: current integration contract, verified 2026-07-28.

This repository renders the public, indexable grammar and dictionary surface.
The authenticated platform repository owns the Supabase schema, migrations,
imports, and editorial source data.

## Ownership

| Concern | Owner |
| --- | --- |
| Database schema, migrations, imports, public RLS policies | platform repository |
| Build-time public read | `scripts/generate-public-content-snapshot.mjs` |
| Snapshot contract and loading | `lib/content/public-snapshot.ts` |
| Grammar presentation adapter | `lib/content/grammar.ts` |
| Dictionary presentation adapter | `lib/content/dictionary.ts` |
| Public pages | `app/grammar/**`, `app/dictionary/**` |
| Canonical platform links | `lib/content/platform-links.ts` |
| URL discovery | `app/sitemap-pages.xml/route.ts` |

## Data path

The production path is a paginated build snapshot:

```text
Supabase public tables
  -> anon client constrained by RLS
  -> generate-public-content-snapshot.mjs
  -> .generated/public-content-snapshot.json
  -> one memoized server-only file read
  -> grammar/dictionary adapters
  -> statically generated pages and sitemap
```

The generator selects explicit columns, paginates at 1,000 rows, and batches
independent tables. Page generation must not query Supabase per route.

Grammar and dictionary routes use `revalidate = false`. Database changes appear
on the public site only after a successful rebuild/deployment creates a fresh
snapshot; there is no five-minute runtime revalidation path.

## Credentials

The snapshot generator uses:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Those credentials can read only the public RLS surface. A build without them
fails intentionally instead of silently publishing an empty dictionary.

`SUPABASE_SERVICE_ROLE_KEY` exists in this repository's environment contract,
but it is not used to render grammar or dictionary content. It is restricted to
protected server-side lead storage/rate limiting and authorized offline media
uploads. Never move it into a client component or public-content read path.

See `.env.example` for the complete variable inventory.

## Public routes

- `/grammar`
- `/grammar/[slug]`
- `/grammar/tags`
- `/grammar/tags/[slug]`
- `/grammar/sections/[slug]`
- `/dictionary`
- `/dictionary/hsk`
- `/dictionary/hsk/[version]`
- `/dictionary/hsk/[version]/[level]`
- `/dictionary/word/[slug]`

These pages are public without authentication, use shared metadata/schema
helpers, and are discovered through `sitemap-pages.xml`.

## Adding or changing content

Grammar articles and HSK vocabulary are authored/imported in the platform
repository. Do not copy records or schema into this repository.

After platform data is published:

1. Confirm its public RLS projection exposes only intended fields.
2. Rebuild this site so the snapshot includes the new data.
3. Verify representative pages, counts, canonical metadata, and structured
   data.
4. Verify `sitemap-pages.xml` contains each new indexable URL.

If the database schema changes, update the snapshot query, snapshot type, and
every affected adapter together. Preserve explicit column selection and
paginated reads.

If a new route family is added, also evaluate static params, metadata, schema,
internal links, `robots.txt`, and the page sitemap. Route/indexability changes
require explicit SEO scope.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm run audit:production
```

For a focused manual check, inspect one grammar page, one dictionary word, one
HSK level page, and `sitemap-pages.xml`. Confirm the production canonical origin
is `https://chinachild.ru`.
