# ChinaChild architecture

Status: current architecture map, verified 2026-07-28.

This document explains durable boundaries and execution paths. Code and
configuration remain authoritative. Read only the section relevant to the
current task.

## 1. System boundary

`chinachild-site` owns the public, indexable, lead-generation surface at
`chinachild.ru`. It renders marketing pages, blog, glossary, HSK resources,
grammar, dictionary, diagnostics, and lead forms.

The authenticated platform at `my.chinachild.ru` owns user accounts and the
source database/schema for learning content. It is a separate repository. This
site may read its explicitly public Supabase surface but must not absorb
platform behavior or personal data.

## 2. Core execution paths

### Public grammar and dictionary

```text
Supabase public tables (anon + RLS)
  -> scripts/generate-public-content-snapshot.mjs (paginated prebuild reads)
  -> .generated/public-content-snapshot.json
  -> lib/content/public-snapshot.ts (one memoized file read per process)
  -> lib/content/grammar.ts and lib/content/dictionary.ts
  -> static App Router pages + sitemap-pages.xml
```

There are no per-page runtime Supabase reads in this path. Large route sets use
`revalidate = false`; new database content becomes public after a new successful
site build/deployment.

### Filesystem content

```text
content/blog/*.mdx       -> lib/blog.ts     -> blog pages, hubs, feed, sitemaps
content/glossary/*.mdx   -> lib/glossary.ts -> glossary pages and sitemap
content/scheduled-blog/* -> protected publisher -> content/blog/*
```

The files use constrained frontmatter plus Markdown/custom blocks parsed by
project code; they are not a generic MDX runtime. Published and queued content
must remain separate.

### SEO and indexability

```text
lib/site-config.ts -> canonical origin and absolute URLs
lib/metadata.ts    -> canonical, robots, Open Graph, Twitter, verification
lib/schema.ts      -> shared structured-data builders
route metadata     -> page-specific meaning
sitemap routes     -> URL discovery from the same content sources as pages
robots route       -> crawler policy and root sitemap reference
next.config.ts     -> redirects and response headers
```

`/sitemap.xml` is the canonical sitemap index and references the page, blog, and
image sitemaps. `/sitemap-feeds.xml` and `/sitemap-store.xml` are compatibility
aliases that currently return the same index. Search Console submission is an
external operational action, not application logic.

### Leads

```text
LeadForm/LeadModal
  -> POST /api/contact
  -> payload validation + honeypot + rate limit + optional SmartCaptcha
  -> consent validation
  -> protected Supabase lead storage
  -> email/other configured dispatch
  -> delivery status + server-side analytics
```

The API payload, consent semantics, persistence-before-delivery ordering, and
anti-abuse behavior are shared contracts. A form or API change must trace both
client and server consumers.

### Analytics and consent

`app/layout.tsx` owns the global consent provider and analytics mounting.
`lib/consent/*` owns stored consent and Google Consent Mode behavior.
`components/analytics/*` owns vendor initialization and shared event capture.
`lib/analytics.ts` is the client event contract. Analytics changes must preserve
privacy behavior and the event names configured in external dashboards.

### Diagnostics and generated media

`app/api/diagnose`, `app/api/tutor`, and `app/api/speech-eval` are dynamic,
server-only OpenAI-backed routes. Blog/learning image and audio scripts are
offline generation tools: visitors consume persisted assets and do not trigger
generation API costs.

## 3. Sources of truth

| Contract | Source |
| --- | --- |
| Public origin, contact, legal and business constants | `lib/site-config.ts` |
| Shared page metadata behavior | `lib/metadata.ts` |
| Shared structured data | `lib/schema.ts` |
| Marketing/course/team content | `lib/site-data.ts` and focused domain files |
| Published blog and glossary | `content/blog`, `content/glossary` |
| Queued blog content and order | `content/scheduled-blog` |
| Public learning snapshot schema/loading | snapshot generator and `lib/content/public-snapshot.ts` |
| Grammar/dictionary presentation adapters | `lib/content/grammar.ts`, `lib/content/dictionary.ts` |
| Environment variables | `.env.example` |
| Build and tool commands | `package.json` |
| Redirects and headers | `next.config.ts` plus `docs/cutover/redirect-map.csv` |
| Scheduled publishing | `.github/workflows/publish-scheduled-blog.yml` |
| IndexNow schedule | `vercel.json` and `app/api/indexnow/route.ts` |

Never duplicate one of these values in a new module when an existing source can
be reused.

## 4. Build and deployment

`npm run build` executes:

1. `prebuild`: generate the paginated public-content snapshot and verify
   generated blog/learning audio.
2. `next build`: statically generate eligible routes.
3. `postbuild`: audit built JSON-LD.

Vercel deploys the resulting application. `.generated` is a build artifact
consumed by static pages and included in output tracing for grammar/dictionary
routes.

Two existing scheduled mechanisms are intentional:

- GitHub Actions publishes queued blog posts Monday and Thursday, generates
  article audio, and commits only publisher-owned content paths.
- Vercel invokes `/api/indexnow` daily to submit known public URLs.

These are existing product operations, not permission to add more recurring
work.

## 5. Route families

| Family | Primary source | Rendering/data model | SEO discovery |
| --- | --- | --- | --- |
| Courses, trust, legal, cities, HSK | TypeScript data + route code | static/SSG | page sitemap |
| Blog and category hubs | filesystem blog | static/SSG | blog sitemap + feed |
| Glossary | filesystem glossary | static/SSG | page sitemap |
| Grammar and dictionary | build snapshot | static/SSG, no runtime ISR | page sitemap |
| Lead submission | client form + server API | dynamic API | not indexable |
| Diagnostics | server API + OpenAI | dynamic API | API excluded by robots |
| SEO endpoints | shared content and config | force-static handlers | robots/root sitemap |

## 6. Change routing and validation

| Change type | Required scope check | Minimum validation |
| --- | --- | --- |
| UI/component | route + every shared consumer; responsive/theme states | focused check, typecheck, lint |
| Route/metadata/schema | page, canonical, OG, JSON-LD, sitemap/internal links | typecheck, lint, build, JSON-LD audit |
| Redirect/robots/sitemap | existing URL inventory and canonical policy | build, redirect audit, production audit when applicable |
| Snapshot/content adapter | generator query columns, pagination, snapshot type, all consumers | typecheck, lint, build; report query model |
| Lead API/form | payload compatibility, storage, delivery, consent, abuse controls | focused tests if present, typecheck, lint |
| Blog/glossary content | frontmatter, parser support, author/related slugs, media | build and relevant content checks |
| Build/workflow | local command, CI/Vercel behavior, secrets, mutation scope | dry/read-only validation before any external run |

## 7. Architectural invariants

- Public routes stay usable without authentication.
- Personal platform data never enters the public snapshot.
- Large static route generation does not fan out to Supabase per page.
- Page content, metadata, schema, internal links, and sitemap URLs agree on the
  same canonical route.
- Analytics honors the consent contract.
- Lead persistence and delivery failures remain observable.
- Queued content is not public until the protected publisher moves it.
- Preview/technical origins must not become production canonical URLs.
- Shared behavior is fixed at its source only after tracing all consumers;
  isolated symptoms do not justify a new abstraction.
