<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know


## Engineering constraints

These rules are mandatory for every task.

1. Preserve existing product behavior, API contracts, data semantics, and user-visible behavior unless the task explicitly requests a change.

2. Do not change UI, UX, layout, markup, copy, labels, class names, visual states, or interaction design without explicit user approval. If a technical fix appears to require a UI change, stop and report it instead of implementing it.

3. Prefer the smallest correct behavior-preserving change. Do not perform unrelated cleanup, broad refactoring, renaming, file moves, or architectural modernization.

4. Before coding, identify:
   - the existing execution path;
   - the measured problem;
   - the smallest safe intervention.
   Keep this pre-coding note to a maximum of 8 lines.

5. Do not scan the entire repository by default. Read only the relevant entry points, their direct dependencies, tests, and configuration.

6. Do not add speculative abstractions, generic frameworks, duplicate services, wrapper layers, new dependencies, or extensibility that is not required by the current task.

7. Do not add polling, cron jobs, retries, loops, self-chaining HTTP calls, background processing, ISR, cache invalidation, or recurring health checks without a clear resource budget and a demonstrated need.

8. Background processing must be event-driven on the normal path. Scheduled jobs are recovery-only. A recovery job must perform a cheap preflight and must not call expensive workers when no work exists.

9. Static generation must not perform per-page database fan-out. Shared content must be loaded once using paginated batch queries or a build-time snapshot.

10. Avoid N+1 queries. Select only required columns, batch identifiers, paginate explicitly, and reuse already loaded data.

11. Do not optimize for fewer source lines by compressing readable code. Optimize for fewer runtime operations, fewer network requests, lower latency, lower memory use, and simpler execution paths.

12. Every performance or resource change must include:
    - before and after execution model;
    - expected request/query reduction;
    - a regression test or automated guard where practical.

13. Do not create documentation files unless explicitly requested. Keep the final report under 12 lines: changed files, behavior preserved, tests run, measured improvement, remaining risk.

14. If the requested scope expands, stop instead of silently implementing extra work.

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ChinaChild project context

## Product boundary

- This repository is the public SEO and lead-generation site for ChinaChild.
- Production is `https://chinachild.ru`. The authenticated platform at
  `https://my.chinachild.ru` is a separate product and repository.
- The primary audience and search market are Russian-speaking users.
- Business priorities are organic visibility in Yandex and Google, qualified
  leads, trust, and conversion.
- Public content includes courses, the blog, HSK resources, grammar,
  dictionary, glossary, diagnostic tools, and lead forms.

## Verified stack

- Next.js App Router with React and TypeScript.
- Tailwind CSS.
- Vercel deployment.
- Supabase for public grammar, vocabulary, and dictionary content.
- Filesystem content for the blog and glossary.
- Yandex Metrika and Google Analytics, gated by consent.
- OpenAI-backed server routes for diagnostic features.

## Architecture map

- `app/`: routes, layouts, route metadata, API handlers, sitemaps, robots, and
  generated SEO endpoints. `app/layout.tsx` is the global shell.
- `app/globals.css`: global design tokens, responsive rules, and shared visual
  behavior.
- `components/`: shared UI, layout, analytics, consent, and SEO components.
- `lib/site-config.ts`: canonical site identity, public origins, contact and
  business constants, and absolute URL handling.
- `lib/metadata.ts`: shared canonical, Open Graph, Twitter, verification, and
  robots metadata behavior.
- `lib/`: shared content access, schema, consent, and domain logic.
- `content/blog/`, `content/scheduled-blog/`, `content/glossary/`: filesystem
  content; queued blog posts are not public content until published.
- `.generated/`: build-time public-content snapshot consumed by large static
  route sets.
- `public/`: static images, fonts, media, and verification assets.
- `scripts/`: build snapshots, audits, media generation, and publishing tools.
- `next.config.ts`: security headers, image policy, redirects, sitemap headers,
  and build tracing.
- `.env.example`: authoritative environment-variable inventory.
- `.github/workflows/publish-scheduled-blog.yml`: protected scheduled publisher.

## Mandatory project constraints

- Never change UI, UX, visible copy, JSX structure, class names, design tokens,
  responsive behavior, or interaction logic without explicit owner approval.
- Never change routes, canonical URLs, metadata meaning, JSON-LD, sitemaps,
  robots, redirects, internal linking, or indexability without explicit SEO
  scope and owner approval.
- Preserve the scheduled blog workflow. Never publish or move queued posts
  unless explicitly requested.
- Prefer static generation and build-time data loading. Avoid runtime ISR for
  large static route sets.
- Prohibit N+1 queries and unpaginated Supabase reads. Select only needed data,
  reuse loaded data, and batch network operations.
- Minimize client components, shipped JavaScript, serverless calls, background
  jobs, and dependencies.
- Do not add polling, cron, analytics, abstractions, or infrastructure without a
  demonstrated need and an explicit resource budget.
- Do not perform unrelated refactoring, cleanup, renaming, or file moves.
- Preserve uncommitted changes and parallel-agent work. Never overwrite work
  whose ownership or purpose is unclear.
- Investigate the real execution path and all shared usages before editing.
  Apply the smallest behavior-preserving fix.
- Never modify Supabase data, production services, or external APIs without
  explicit approval.

## Agent workflow

1. Read only relevant entry points, direct dependencies, focused tests, and
   configuration. Do not inventory the repository by default.
2. Before coding, explain the current execution path, measured problem, and
   smallest safe intervention in at most 8 lines.
3. Make product, UI, and SEO decisions only after owner approval.
4. Run focused tests first, then typecheck, lint, and a production build when
   relevant to the changed path.
5. For performance work, record before/after execution models, expected or
   measured request/query reduction, and an automated regression guard where
   practical.
6. Report changed files, behavior preserved, tests, measured effect, and
   unresolved risks in at most 12 lines.
7. Do not create documentation unless the task explicitly requests it.

## Reasoning level

- **Medium:** narrow implementation work and routine fixes.
- **High:** important shared logic, performance work, SEO infrastructure, or
  regression review.
- **Extra High:** major architecture, security, billing, or destructive
  migrations.
