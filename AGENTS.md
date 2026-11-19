# ChinaChild agent contract

These instructions are loaded for every task. Keep them concise, current, and
limited to durable project rules. Read [ARCHITECTURE.md](ARCHITECTURE.md) only
for the sections relevant to the task.

## Product boundary

- This repository is the public SEO and lead-generation site at
  `https://chinachild.ru`.
- The authenticated platform at `https://my.chinachild.ru` is a separate
  product and repository.
- The primary market is Russian-speaking users. Business priorities are organic
  visibility in Yandex and Google, qualified leads, trust, and conversion.
- Public content includes courses, blog, HSK resources, grammar, dictionary,
  glossary, diagnostics, and lead forms.

## Verified stack

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- Vercel deployment.
- Supabase for public learning content and protected server-side lead/media
  operations.
- Filesystem content for blog and glossary.
- Yandex Metrika and Google Analytics with consent handling.
- OpenAI-backed diagnostic routes and offline media-generation scripts.

## Sources of truth

Use this order when documents disagree:

1. Current code, `package.json`, configuration, and the lockfile.
2. [ARCHITECTURE.md](ARCHITECTURE.md) for system boundaries and data flows.
3. `.env.example` for the environment-variable contract.
4. `README.md` and content-folder READMEs for human workflows.
5. `AUDIT.md`, `docs/cutover/**`, and dated checklists are historical evidence,
   not current architecture.

If a maintained document conflicts with code, verify the execution path and
update the document in the same scoped change when authorized.

## Mandatory constraints

1. Preserve product behavior, API contracts, data semantics, UI, and SEO
   behavior unless the request explicitly authorizes a change.
2. Do not change visible copy, JSX structure, class names, design tokens,
   responsive behavior, or interactions without explicit UI/UX scope.
3. Do not change routes, canonical URLs, metadata meaning, JSON-LD, sitemaps,
   robots, redirects, internal linking, or indexability without explicit SEO
   scope.
4. Preserve `content/scheduled-blog` and its protected publishing workflow.
   Never publish or move queued posts unless explicitly requested.
5. Never modify Supabase data, production services, external APIs, or secrets
   without explicit approval.
6. Preserve uncommitted changes and parallel work. Do not overwrite changes
   whose ownership is unclear.
7. Prefer the smallest correct change. Do not perform unrelated cleanup,
   refactoring, renaming, file moves, dependency changes, or modernization.
8. Do not add abstractions, polling, retries, cron jobs, background workers,
   ISR, cache invalidation, analytics, or infrastructure without demonstrated
   need and an explicit resource budget.
9. Preserve static generation for large route sets. Shared database content
   must be loaded once through paginated batch reads and the build snapshot;
   prohibit per-page fan-out and N+1 queries.
10. Optimize for fewer runtime operations, requests, queries, bytes, and simpler
    execution paths—not fewer source lines.

## Task routing

| Concern | Read first | Shared contracts to trace |
| --- | --- | --- |
| UI or page | route in `app/`, direct components | `app/layout.tsx`, `app/globals.css`, shared section/component consumers |
| SEO/indexing | affected route | `lib/site-config.ts`, `lib/metadata.ts`, `lib/schema.ts`, sitemap/robots routes, redirects |
| Grammar/dictionary | relevant `lib/content/*` adapter | snapshot generator, `lib/content/public-snapshot.ts`, static params, sitemap |
| Blog/glossary | folder README and parser | route, metadata/schema, feed, sitemap, scheduled publisher |
| Leads | `app/api/contact/route.ts` | form payload, rate limit, captcha, storage, dispatch, server analytics |
| Analytics/consent | `lib/consent/*` | analytics components, event registry, privacy contract |
| Build/deploy | `package.json` | snapshot/media prebuild, Next config, Vercel config, GitHub workflow |

The detailed flows and validation matrix are in
[ARCHITECTURE.md](ARCHITECTURE.md).

## Working method

1. Classify the task using the routing table. Do not inventory the repository.
2. Read the entry point, direct dependencies, relevant tests/configuration, and
   all shared consumers of the contract being changed.
3. Before editing, state in at most eight lines: current execution path,
   measured problem, and smallest safe intervention.
4. Distinguish a local symptom from a shared invariant. Fix the shared source of
   truth only when the evidence shows the problem is systemic.
5. Before editing a Next.js API, verify the installed version and inspect its
   installed types/source. Use local Next docs when present; do not assume a
   remembered framework convention matches this project.
6. Run the smallest relevant checks first, then broader checks in proportion to
   risk. Tests are required when a relevant suite exists.
7. For performance/resource changes, report before/after execution models,
   request/query reduction, and an automated regression guard where practical.
8. Stop if the requested scope materially expands or needs a product/SEO/UI
   decision that was not authorized.

## Standard validation

- `npm run typecheck` — TypeScript.
- `npm run lint` — ESLint.
- `npm run build` — snapshot, production build, and JSON-LD post-build audit.
- `npm run audit:redirects` — redirect changes.
- `npm run audit:production` — production-readiness and public SEO endpoints.
- Content/media generation and scheduled publishing are mutating operations;
  never run them unless explicitly requested.

Do not create documentation unless requested. Keep the final report under
12 lines: changed files, preserved behavior, checks run, measured effect, and
remaining risk.


<!-- BEGIN: deployment-cost-discipline -->
## Сборки и публикации: исключение лишних расходов

- Сначала выполнить нужные локальные проверки, собрать законченный набор изменений и только затем публиковать. Не запускать платную удалённую сборку после каждой мелкой правки или ради проверки компиляции. Обязательные проверки качества сохраняются.
- Перед каждой удалённой сборкой/публикацией проверить точные team/project, окружение, ветку/commit и уже существующие queued/building/ready deployments. Для локальных незакоммиченных изменений учитывать также фактическое содержимое дерева, зависимости, конфигурацию и build-time env; одинакового SHA недостаточно.
- Одна версия для одного проекта и окружения — один владелец публикации и один запуск. Между чатами, агентами и worktree согласовать владельца до запуска. Не запускать одинаковые сборки параллельно; если подходящая сборка уже идёт, наблюдать её до завершения, не создавать вторую.
- Git auto-deploy, CLI, deploy hook и CI не должны дублировать одну публикацию. Если push уже запускает нужный Git deployment, не выполнять дополнительно CLI deploy/redeploy. Ручной путь использовать только при доказанной необходимости.
- Таймаут CLI, потеря соединения, задержка ответа или неизвестный статус не являются основанием для повторной публикации: сначала найти исходный deployment и установить его итог. Повторять только после подтверждённого окончательного сбоя с устранённой причиной либо при изменённых входных данных; объяснить причину повтора.
- Повторно использовать уже проверенный совместимый артефакт для той же версии и окружения через поддерживаемый проектом путь публикации. Не пересобирать и не перепубликовывать успешную неизменённую версию ради уверенности или обновления ссылки. Не переносить preview-артефакт в production без проверки env и совместимости.
- Не повторять дорогие локальные/CI сборки после уже успешной проверки, если входные данные не менялись и нет нового сбоя или нерешённого риска. Сохранять и использовать результат проверки.
- Для монорепозитория публиковать только затронутые проекты. Сохранять существующие ignore/skip gates и правила разделения приложений; изменения документации и правил агентов не должны сами по себе требовать публикации приложения.
- Не включать платный параллелизм, более мощные build machines, платные add-ons или бесконечные автоматические повторы без обоснованной необходимости, оценки расходов и согласия владельца. Не отключать ради экономии нужные тесты, защиту, резервирование или диагностику без оценки последствий.
- В результате публикации указать project/environment, commit или версию входных данных, deployment ID/URL и итоговый статус. Чётко различать локальную сборку, загрузку, публикацию и подтверждённую работу production.
<!-- END: deployment-cost-discipline -->
