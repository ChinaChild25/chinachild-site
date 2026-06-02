# Current State

Generated: 2026-06-02

## Domain Plan

```txt
https://chinachild.ru      -> SEO site from repo chinachild-site
https://go.chinachild.ru   -> old Tilda site
https://my.chinachild.ru   -> platform / personal account
```

## Current Domains

- `https://chinachild.ru`: live old Tilda site. Direct checks on 2026-06-02 returned Tilda `robots.txt` and `sitemap.xml`.
- `https://chinachild-site.vercel.app`: current production URL for this Next.js SEO site on Vercel.
- `https://my.chinachild.ru`: platform host. Direct `HEAD` check on 2026-06-02 returned HTTP 200.
- `https://go.chinachild.ru`: not configured yet. Direct DNS check on 2026-06-02 failed to resolve.

## Target After Cutover

- Apex domain `chinachild.ru` points to Vercel project for this repo.
- Old Tilda site remains available at `go.chinachild.ru`.
- Platform/account traffic uses `my.chinachild.ru`; it is separate from the Tilda migration and must not be used as a fallback for ordinary old Tilda pages.
- `app.chinachild.ru` must not be used.

## Next.js Documentation Note

Repo instructions ask to read `node_modules/next/dist/docs/` before editing because this Next.js version may differ. That path is absent in the installed package. Local package versions checked instead:

- `next`: `^15.5.15`
- `react`: `^19.2.5`
- App Router is used under `app/`.

## Domain Env Variables

Domain-related env names found in `.env.example`, `.env.local`, and `.env.vercel.production.local`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_YANDEX_VERIFICATION`
- `NEXT_PUBLIC_GOOGLE_VERIFICATION`
- `NEXT_PUBLIC_BING_VERIFICATION`
- `NEXT_PUBLIC_MAILRU_VERIFICATION`
- `NEXT_PUBLIC_YM_ID`
- `NEXT_PUBLIC_GA_ID`

Expected production values after cutover:

```env
NEXT_PUBLIC_SITE_URL=https://chinachild.ru
NEXT_PUBLIC_APP_URL=https://my.chinachild.ru
```

`NEXT_PUBLIC_APP_URL` is needed only for links to the personal account/platform. It is not the old Tilda site URL.

Local pulled env files currently have empty values for `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL`, so production must be set manually in Vercel and redeployed.

## Site URL Configuration

- Public site origin is centralized in [lib/site-config.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/lib/site-config.ts:3).
- `SITE_URL` comes from `NEXT_PUBLIC_SITE_URL`, falling back to the current technical Vercel URL.
- `absoluteUrl()` converts relative paths and old `chinachild.ru` absolute URLs to the configured `SITE_URL`.
- This means canonical, OG, sitemap, robots, feed, schema, and legal links can switch to `chinachild.ru` through env.

## Platform URL Configuration

- Platform deep links are centralized in [lib/content/platform-links.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/lib/content/platform-links.ts:1).
- `NEXT_PUBLIC_APP_URL` is the override.
- Fallback is now `https://my.chinachild.ru`.
- This variable is only for platform/account links, not for preserving old Tilda content.
- Existing platform links are used from grammar and dictionary pages:
  - `platformLinks.grammarArticle()`
  - `platformLinks.vocabularyWord()`
  - `platformLinks.vocabularyTrain()`
  - `platformLinks.vocabularyHskLevel()`

## Metadata, Canonical, OG, JSON-LD

- Shared metadata helper: [lib/metadata.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/lib/metadata.ts:1)
- Root layout metadata and site graph: [app/layout.tsx](/Users/denisgasencenko/Dev/projects/chinachild-site/app/layout.tsx:1)
- JSON-LD component: [components/seo/JsonLd.tsx](/Users/denisgasencenko/Dev/projects/chinachild-site/components/seo/JsonLd.tsx:1)
- Schema builders: [lib/schema.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/lib/schema.ts:1)
- Per-page metadata uses `buildMetadata()` across App Router pages.
- OG image routes exist at page-level `opengraph-image.tsx` files and root [app/opengraph-image.tsx](/Users/denisgasencenko/Dev/projects/chinachild-site/app/opengraph-image.tsx:1).

## Sitemap, Robots, Feeds

- Sitemap index: [app/sitemap.xml/route.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/app/sitemap.xml/route.ts:1)
- Page sitemap: [app/sitemap-pages.xml/route.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/app/sitemap-pages.xml/route.ts:1)
- Blog sitemap: [app/sitemap-blog.xml/route.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/app/sitemap-blog.xml/route.ts:1)
- Image sitemap: [app/sitemap-images.xml/route.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/app/sitemap-images.xml/route.ts:1)
- Robots: [app/robots.txt/route.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/app/robots.txt/route.ts:1)
- Atom feed: [app/feed.xml/route.ts](/Users/denisgasencenko/Dev/projects/chinachild-site/app/feed.xml/route.ts:1)

All these use `SITE_URL` / `absoluteUrl()`.

## Public Routes

Static public routes found under `app/`:

- `/`
- `/about`
- `/blog`
- `/chinese/hsk-test`
- `/cities`
- `/compare/mini-group-vs-individual`
- `/corporate`
- `/courses`
- `/courses/business-chinese`
- `/courses/chinese-for-adults`
- `/courses/chinese-for-kids`
- `/courses/hsk-preparation`
- `/courses/online-chinese`
- `/diagnostic`
- `/dictionary`
- `/dictionary/hsk`
- `/docs`
- `/free-trial`
- `/glossary`
- `/grammar`
- `/grammar/tags`
- `/learn/beginners`
- `/learn/hsk`
- `/license`
- `/methodology`
- `/price`
- `/privacy-policy`
- `/public-treaty`
- `/repetitor-kitayskogo`
- `/results`
- `/reviews`
- `/search`
- `/team`
- `/user-agreement`
- `/zayavka`

Dynamic public route families:

- `/blog/[slug]`
- `/blog/category/[slug]`
- `/chinese/hsk-test/[level]`
- `/cities/[slug]`
- `/dictionary/hsk/[version]`
- `/dictionary/hsk/[version]/[level]`
- `/dictionary/word/[slug]`
- `/glossary/[slug]`
- `/grammar/[slug]`
- `/grammar/sections/[slug]`
- `/grammar/tags/[slug]`
- `/hsk/[slug]`
- `/team/[slug]`

Route handlers / non-HTML public files:

- `/api/contact`
- `/api/diagnose`
- `/api/hsk-test/tts`
- `/api/indexnow`
- `/api/speech-eval`
- `/api/tutor`
- `/feed.xml`
- `/llms.txt`
- `/robots.txt`
- `/sitemap.xml`
- `/sitemap-pages.xml`
- `/sitemap-blog.xml`
- `/sitemap-images.xml`

## Legacy URL Sources

Used sources:

- `https://chinachild.ru/robots.txt`
- `https://chinachild.ru/sitemap.xml`
- `https://chinachild.ru/sitemap-store.xml`
- `https://chinachild.ru/sitemap-feeds.xml`
- `https://chinachild.ru/sitemap-feed-363040194291.xml`
- repo search for old `chinachild.ru`, Tilda paths, and existing `next.config.ts` redirects
- public search results for indexed Tilda pages

The redirect map is in [redirect-map.csv](/Users/denisgasencenko/Dev/projects/chinachild-site/docs/cutover/redirect-map.csv:1).

## Manual Input Needed

Automatic sources are strong but not complete for historical traffic. Before DNS switch, provide or review:

- Yandex.Webmaster indexed/404 URL export.
- Google Search Console indexed/404 URL export.
- Top landing pages from old Yandex.Metrika for the last 6-12 months.
- Historical campaign URLs if old ads are ever reactivated.

Yandex Direct is not active and is not treated as a cutover blocker.
