# PASS 6 validation report

Validation date: 2026-07-31

Deployment/upload: not performed

## Passed

- `npm run typecheck`
- `npm run lint`: 0 errors; 6 pre-existing warnings outside the PASS 6
  artifact generator
- `npm run test:leads`: 9/9 tests
- `npm run test:seo`: 56/56 tests
- `NEXT_PUBLIC_SITE_URL=https://chinachild.ru npm run build`
- post-build JSON-LD/static audit: 2,813 HTML pages, 40 FAQ pages,
  2,476 dictionary word routes, 2,884 static dictionary/grammar routes
- local production audit:
  `npm run seo:yandex-education -- --base-url=http://127.0.0.1:42107`
  returned 3 offers and 0 errors
- deterministic artifact generation:
  `npm run seo:yandex-education:artifacts`
- CSV consistency validation:
  `npm run seo:yandex-education:artifacts -- --check` validated all 3 CSV
  artifacts against the reviewed Markdown and typed offer data
- local feed: HTTP 200, `application/xml`, production canonical offer URLs,
  `X-Yandex-Education-Readiness: ready-for-validation`
- feed structure: 3 unique stable IDs, reviewed categories, 17,990 RUR
  monthly price, subscription false, one-month duration, four stages and eight
  total guided hours per offer
- live-page validator: direct HTTP 200, production canonical, visible price,
  8 lessons, 60 minutes, one month, and separate next-module purchase
- agent-browser accessibility audit of the schoolchildren module section:
  0 violations and 0 incomplete checks
- browser funnel check: one `education_offer_cta_click` and one
  `education_offer_form_start` delivery with non-PII module context
- before/after desktop screenshots saved for adults, schoolchildren, HSK, and
  price pages under `screenshots/`
- the build snapshot step completed with 38 paginated reads and did not leave a
  generated repository modification

## Completed artifacts

- `competitor-offer-benchmark.csv`: 5 deterministic rows generated from the
  reviewed Markdown benchmark
- `offer-page-consistency.csv`: 3 deterministic offer rows generated from the
  reviewed Markdown matrix and checked against `lib/course-modules.ts`
- `eligibility-checklist.csv`: 41 current requirements, including 3 enabled
  offers, positive monthly price, one-month duration, 4 stages, 8 guided
  hours, and direct canonical URLs
- `curriculum-stage-evidence.md`: all 12 stages mapped to source content,
  lesson pairs, assigned hours, and offer-specific evidence; no curriculum
  rewrite was required

## Preserved

- Only `/courses/chinese-for-adults`, `/courses/chinese-for-kids`, and
  `/courses/hsk-preparation` are feed offers.
- `/repetitor-kitayskogo` remains the canonical tutor route and is excluded.
- `/repetitor`, `/courses/adults`, and `/courses/kids` remain absent.
- Group, self-study, corporate, trial, city, `/zayavka`, protected pages, HSK
  informational routes, and `go.chinachild.ru` are not feed offers.
- No redirect, canonical ownership, sitemap inclusion, deployment, Webmaster
  upload, or external service state was changed.

## Remaining operational checks

Owner must confirm live staffing/orderability, invoice/payment-link terms,
phone/email staffing daily 09:00–21:00 Moscow time, the normal 1–2 hour
response in that period, handling of moderation applications received then
within three working hours, IP/licence status, Webmaster security state, and
absence of a duplicate feed. Night applications start from the next response
period.

These are provider-submission checks, not blockers to technical completion.

## Technical status

`ready for deployment and production validation`
