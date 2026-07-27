# ChinaChild public site

Public SEO and lead-generation website for ChinaChild, serving a primarily
Russian-speaking search market.

- Public site: [chinachild.ru](https://chinachild.ru)
- Authenticated platform: [my.chinachild.ru](https://my.chinachild.ru)

The authenticated platform is a separate product and repository. This project
focuses on organic visibility in Yandex and Google, qualified leads, trust, and
conversion. It publishes course pages, blog articles, HSK resources, grammar,
dictionary and glossary content, diagnostic tools, and lead forms.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS
- Vercel
- Supabase public content
- Filesystem blog and glossary content
- Yandex Metrika and Google Analytics
- OpenAI-backed diagnostic routes

## Architecture

- `app/` — routes, layouts, API handlers, metadata, sitemaps, robots, and SEO
  endpoints
- `app/layout.tsx` — global shell, consent-aware analytics, and site JSON-LD
- `app/globals.css` — design tokens and global responsive behavior
- `components/` — shared UI, layout, consent, analytics, and SEO components
- `lib/site-config.ts` — site identity, domains, public constants, and URL logic
- `lib/metadata.ts` — canonical, social, verification, and robots metadata
- `lib/` — shared content access, schema, consent, and domain logic
- `content/blog/` and `content/glossary/` — published filesystem content
- `content/scheduled-blog/` — queued posts protected from casual publication
- `.generated/` — build-time snapshot for large public-content route sets
- `public/` — static assets
- `scripts/` — snapshot generation, audits, media tools, and publishing
- `next.config.ts` — headers, redirects, images, and build tracing

UI, responsive behavior, visible copy, routes, canonicals, metadata, JSON-LD,
internal links, and indexability are intentional product and SEO behavior. Do
not change them casually; obtain explicit approval and scope first.

## Content sources

Supabase provides public grammar, vocabulary, and dictionary data through
restricted credentials. Large static route sets consume a paginated build-time
snapshot to avoid per-page database fan-out. Blog and glossary content live in
the filesystem. Scheduled posts remain queued until the protected publisher
moves them into published content.

## Environment

Copy `.env.example` to `.env.local` and provide only the values needed locally.
The file documents these groups:

- Supabase public-read credentials and the server-only service role
- public site and authenticated-app URLs
- Yandex Metrika, Google Analytics, and optional webmaster verification
- optional IndexNow key
- SMTP lead delivery and IP hashing
- server-only OpenAI key and optional diagnostic model overrides

All `NEXT_PUBLIC_*` values are exposed to the browser. Never put secrets in
them. Do not modify Supabase data, production services, or external APIs without
explicit approval.

## Commands

```bash
npm run dev                 # local development
npm run build               # snapshot, production build, JSON-LD audit
npm run start               # serve the production build
npm run lint                # ESLint
npm run audit:jsonld        # audit built structured data
npm run audit:redirects     # audit redirect behavior
npm run audit:production    # production-readiness audit
```

Image/audio generation and scheduled publishing commands can create or move
content. Use them only when that action is explicitly requested.

## Deployment

Production is deployed on Vercel with `NEXT_PUBLIC_SITE_URL` set to
`https://chinachild.ru`. The production build generates the public-content
snapshot before `next build` and audits built JSON-LD afterward. Preserve static
generation and build-time loading; avoid runtime ISR for large route sets.

## Protected workflows

`.github/workflows/publish-scheduled-blog.yml` runs Monday and Thursday at 09:00
Moscow time and supports a manual post-count input. It commits only publisher
changes under `content/blog` and `content/scheduled-blog`.

Do not alter the workflow or publish queued posts unless explicitly requested.
Do not add cron jobs, polling, analytics, infrastructure, or dependencies
without demonstrated need and a resource budget.

## Contribution guardrails

Read `AGENTS.md` before changing the project. Investigate the actual execution
path and shared usages, make the smallest behavior-preserving change, avoid
unrelated cleanup, and preserve uncommitted or parallel work. Run focused tests,
typecheck, lint, and the production build when relevant.
