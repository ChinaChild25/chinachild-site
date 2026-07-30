# ChinaChild public site

Public SEO and lead-generation website for
[chinachild.ru](https://chinachild.ru), serving a primarily Russian-speaking
market. The authenticated platform at
[my.chinachild.ru](https://my.chinachild.ru) is a separate product and
repository.

## Start here

- Agents and contributors: [AGENTS.md](AGENTS.md)
- Current system map and change routing: [ARCHITECTURE.md](ARCHITECTURE.md)
- Environment-variable contract: [.env.example](.env.example)
- Blog authoring: [content/blog/README.md](content/blog/README.md)
- Glossary authoring: [content/glossary/README.md](content/glossary/README.md)
- Public grammar/dictionary integration:
  [docs/content-seo-setup.md](docs/content-seo-setup.md)

Historical migration reports live in `AUDIT.md` and `docs/cutover/`. They are
useful evidence but do not describe current production architecture.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, Vercel, Supabase,
filesystem MDX-like content, Yandex Metrika, Google Analytics, and
OpenAI-backed diagnostics/media tooling.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The build requires the public Supabase URL and anon key because it generates a
paginated static snapshot for grammar and dictionary routes. Add only the
environment values needed for the workflow you are running. Every
`NEXT_PUBLIC_*` value is exposed to the browser.

## Commands

```bash
npm run dev                 # local development
npm run typecheck           # TypeScript without emitting files
npm run lint                # ESLint
npm run build               # snapshot + Next build + JSON-LD audit
npm run start               # serve the production build
npm run audit:jsonld        # audit built structured data
npm run audit:redirects     # audit redirect behavior
npm run audit:production    # audit production endpoints and readiness
npm run check:audio         # verify that required generated audio exists
npm run seo:check           # verify local read-only SEO data access
npm run seo:collect -- --days=90  # collect local SEO data
npm run seo:report          # create JSON, CSV, and Markdown SEO reports
```

Image/audio generation and scheduled publishing mutate files or external
storage. Run those commands only for an explicitly authorized content task; see
the relevant content-folder README.

The local read-only SEO collector is documented in
[docs/seo-data-collector.md](docs/seo-data-collector.md). Its generated
`seo-data/` directory is ignored by Git.

## Deployment and protected workflows

Vercel builds production with `NEXT_PUBLIC_SITE_URL=https://chinachild.ru`.
The build creates `.generated/public-content-snapshot.json` before `next build`
and audits JSON-LD afterward.

`.github/workflows/publish-scheduled-blog.yml` publishes queued articles on its
protected schedule and supports a manual count. `vercel.json` contains the
existing IndexNow submission schedule. Do not alter either workflow casually.

Product behavior, UI/UX, routes, metadata, indexability, and external data are
intentional contracts. The exact invariants and required checks are documented
in [ARCHITECTURE.md](ARCHITECTURE.md).
