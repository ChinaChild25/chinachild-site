# Yandex Education eligibility audit

Audit date: 2026-07-30

Feed route after deployment: `https://chinachild.ru/yandex-education.yml`

Implementation status: **three offers active in source; submission still requires
owner operational checks and a production deployment**

## Official contract reviewed

The implementation follows the current official sources:

- [Educational online courses and lessons](https://yandex.ru/support/webmaster/ru/search-appearance/education)
- [Education quality and moderation checks](https://yandex.ru/support/webmaster/ru/feed/education)
- [Feed preparation and upload](https://yandex.ru/support/webmaster/ru/feed/upload)
- [Current course rubricator](https://yastatic.net/s3/doc-binary/src/support/products/education_rubricator.xml)

The feed uses `20006` for Chinese under Languages and `10023` for Chinese
under School subjects. A teacher-led offer does not require a nearest cohort
date. For the reviewed modular product, `<price>0</price>` means there is no
mandatory fixed total for a longer course; the real positive monthly module
price is supplied as `Ежемесячная цена`. `Цена за подписку` is explicitly
`false`. No instalment or discount parameter is emitted.

## Enabled offers

| Canonical route | Stable offer ID | Audience | Current orderable scope |
| --- | --- | --- | --- |
| `/courses/chinese-for-adults` | `adult-individual-monthly-module` | Adults | 17,990 RUR; one month; 8 individual lessons × 60 minutes |
| `/courses/chinese-for-kids` | `schoolchildren-12plus-individual-monthly-module` | Schoolchildren strictly 12+ | 17,990 RUR; one month; 8 individual lessons × 60 minutes |
| `/courses/hsk-preparation` | `hsk-individual-monthly-module` | Adults and learners 12+ preparing for HSK | 17,990 RUR; one month; 8 individual lessons × 60 minutes |

Each offer has four distinct, page-supported stages of two guided hours. The
eight stage hours equal the eight 60-minute lessons. The next module is
purchased separately. This is neither a subscription nor an instalment, and
there is no fabricated multi-month total, discount, end date, or urgency.

## Exclusions

`/courses/online-chinese` remains a selector/pillar; `/repetitor-kitayskogo`
remains a separate tutor offer; `/courses/business-chinese` and `/corporate`
have variable terms; `/price` is a catalogue; `/free-trial` is an application
step. The homepage, catalogue, city pages, informational pages, HSK level
cluster, tests, glossary, `/zayavka`, and `go.chinachild.ru` are not offers.
The nonexistent `/repetitor`, `/courses/adults`, and `/courses/kids` routes
are absent.

## Technical state

`lib/course-modules.ts` is the reviewed curriculum and product-term source.
Visible page modules, module JSON-LD, analytics context, and
`lib/yandex-education.ts` derive from it. `lib/course-packages.ts` remains the
shared price source. The endpoint is force-static, public, and returns
`application/xml` with `X-Yandex-Education-Readiness: ready-for-validation`.
Validation rejects noncanonical routes, duplicate IDs/URLs, stale price,
subscription flags, free interpretation, invalid duration, fewer than three
stages, and stage-hour totals other than eight.

## Owner checks that code cannot prove

- Confirm the three modules are staffed and orderable at 17,990 RUR on the
  submission day.
- Confirm invoices, contracts, and payment links use the same one-month,
  eight-lesson terms and do not auto-renew.
- Verify the IP and licence remain active, the published phone works, and the
  inbox is staffed daily from 09:00 to 21:00 Moscow time. Confirm the normal
  1–2 hour response in that period and that a moderation application received
  then can be handled within three working hours; night applications start
  from the next response period.
- Check Yandex Webmaster for security violations and confirm no duplicate
  Education feed is already uploaded.
- Ask Yandex whether the required non-modal cookie consent banner is
  acceptable under the no-popup moderation rule.

The prior enhanced-export evidence remains a limited 14-day partial-URL
sample. It is not historical proof of demand, conversion, or offer success.
