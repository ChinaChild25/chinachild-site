# Content/SEO setup — chinachild-site side

This repo is the **public marketing + SEO site**. Grammar and dictionary pages
read content from the same Supabase project as `chinachild-sandbox` (the
authenticated platform), through a narrow anon-RLS surface.

We do **not** copy content. We do **not** mirror schema. We just read it.

## What lives where

- Schema, migrations, fixtures, import script → `chinachild-sandbox`
- Anon RLS policies that open the public surface → `chinachild-sandbox/supabase/migrations/20260717120000_public_content_anon_select.sql`
- Public content access layer → this repo, `lib/content/*` + `lib/supabase/public-content.ts`
- Public SEO pages → this repo, `app/grammar/*` and `app/dictionary/*`
- CTAs into the platform → `lib/content/platform-links.ts` (uses `NEXT_PUBLIC_APP_URL`)

## Data access strategy

We use Option A from the architecture brief: **direct anon read from Supabase
with RLS-restricted policies**. No service role key is in this repo.

- Server-only client at `lib/supabase/public-content.ts`. The file starts with
  `import "server-only"` so Next.js will refuse to bundle it into a client
  component.
- All `lib/content/*.ts` access modules import that server-only client and
  call `next/cache#unstable_cache` with a 5-minute revalidate window so that
  hot pages do not re-fan-out to Supabase on every request.
- All exported functions degrade gracefully (return `[]` or `null`) when the
  Supabase env vars are missing, so preview/CI builds without DB access still
  succeed. The pages then render skeletons / "Загружено: 0" honest copy.

## Env vars

See `.env.example`. Required for production:

| Variable                          | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Same project as `chinachild-sandbox`                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Anon key — RLS limits it to public content               |
| `NEXT_PUBLIC_SITE_URL`            | Canonical origin (`https://chinachild.ru`)               |
| `NEXT_PUBLIC_APP_URL`             | Platform origin used for CTAs (`https://app.chinachild.ru`) |

**Never** put `SUPABASE_SERVICE_ROLE_KEY` here. The anon key is enough — the
RLS policies guarantee only published grammar articles, system/imported HSK
decks, and dictionary terms are visible.

## Public routes

- `/grammar` — hub with featured topics, search, filters, article grid.
- `/grammar/[slug]` — article detail rendered from `grammar_blocks`.
- `/grammar/tags` — all tag groups with article counts.
- `/grammar/tags/[slug]` — articles for a tag.
- `/grammar/sections/[slug]` — articles for a section.
- `/dictionary` — hub with HSK plan + honest imported counts.
- `/dictionary/hsk` — version chooser.
- `/dictionary/hsk/[version]` — level cards for the chosen version.
  `version` is one of `new-hsk`, `hsk`.
- `/dictionary/hsk/[version]/[level]` — terms in that HSK level + search.
- `/dictionary/word/[slug]` — word detail with examples, HSK badges, CTAs.

All pages:

- Server-render content. Client JS only enhances filtering/search.
- Use `buildMetadata()` for canonical URLs + OG + Twitter + robots.
- Emit a relevant Schema.org graph (BreadcrumbList + LearningResource /
  CollectionPage / DefinedTerm).
- Are included in `sitemap-pages.xml` (one route per dynamic slug).
- Open without auth — they read public content only.

## Canonical/noindex

The public site is the indexable surface. The platform (`chinachild-sandbox`)
is noindex globally (see its `app/layout.tsx`). Platform copies of the same
content additionally emit `<link rel="canonical">` back to the public URL on
this site, via `lib/seo/platform-seo.ts` in the sandbox repo.

## Adding a grammar article

You do **not** add articles in this repo. Add them in `chinachild-sandbox`
fixtures/admin, push the migration/import, and they appear here on next
revalidation (every 5 minutes, see `unstable_cache` `revalidate`).

If you want to surface a new featured topic on `/grammar`, update
`FEATURED_TOPIC_SPECS` in `lib/content/grammar.ts` — pure metadata only, no
content lives here.

## Adding HSK vocabulary

Same as above — owned by the platform repo. The public site reads
`display_count` for the plan and `imported_count` for the honest current state.

## Updating the sitemap

`app/sitemap-pages.xml/route.ts` calls into `lib/content/*` for the full list
of public URLs. There is nothing to update by hand: as the platform imports
more content, the sitemap grows automatically (on revalidate).

If you add a new top-level public route (e.g. `/dictionary/frequency/top-1000`),
add a corresponding entry block to `sitemap-pages.xml/route.ts`.

## How to verify

1. `npm install`
2. Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
3. `npm run build && npm run start` (or `npm run dev`).
4. Visit:
   - `/grammar` — must render without auth, with featured cards + filters.
   - `/grammar/basic-sentence-structure` — article from `grammar_blocks`.
   - `/dictionary` — HSK plan counts.
   - `/dictionary/word/<some-slug>` — word detail.
5. Inspect `<head>`: every page has `<link rel="canonical">` + OG metadata.
6. `curl /sitemap-pages.xml` — must list the new routes.
7. With the anon key, try `select * from vocab_review_states limit 1;` — must
   return no rows / permission denied. Personal data must never leak.
