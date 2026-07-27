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
