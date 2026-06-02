# Final Cutover Readiness

## Verdict

READY AFTER FIXES

## Summary

The repository is prepared for cutover: redirect map, Next.js redirect implementation, audit scripts, domain docs, and manual cutover plan are in place. Do not switch DNS yet. Current live production at `https://chinachild-site.vercel.app` has not been redeployed with these changes and still fails redirect/platform-link checks. The old Tilda site must move to `https://go.chinachild.ru`; the platform at `https://my.chinachild.ru` is separate.

## Current Domain Plan

- `chinachild.ru` -> SEO site
- `go.chinachild.ru` -> old Tilda site
- `my.chinachild.ru` -> platform

## Completed Checks

- Live old Tilda `robots.txt` fetched.
- Live old Tilda `sitemap.xml` fetched.
- Live old Tilda `sitemap-store.xml` checked; empty URL set.
- Live old Tilda `sitemap-feeds.xml` fetched.
- Nested live old feed sitemap `sitemap-feed-363040194291.xml` fetched.
- Repo route inventory completed.
- Domain env usage mapped.
- Sitemap/robots/metadata/schema locations mapped.
- Platform fallback changed to `https://my.chinachild.ru`.
- `.env.example` changed to cutover domain values.
- `urls-for-indexing.txt` changed to `https://chinachild.ru`.
- `npm run build` passed.

## P0 Blockers

1. Current live production has not been redeployed with this branch.
   - `npm run audit:redirects`: 7 passed, 239 failed against `https://chinachild-site.vercel.app`.
   - Most legacy URLs still return 404 on live production.
2. Current live production still renders stale platform links on dictionary pages.
   - `npm run audit:production` failed on `/dictionary/hsk/new-hsk/1` and `/dictionary/word/ni-hao`.
   - Stale live links point to `https://chinachild-sandbox.vercel.app/...`.
   - Code fallback is fixed in this branch; redeploy required.
3. Vercel Production env must be set before DNS cutover:

```env
NEXT_PUBLIC_SITE_URL=https://chinachild.ru
NEXT_PUBLIC_APP_URL=https://my.chinachild.ru
```

`NEXT_PUBLIC_APP_URL` is only for personal-account/platform links. It is not the old Tilda site URL.

4. `go.chinachild.ru` is not configured yet. DNS check on 2026-06-02 did not resolve, so the 4 legacy-Tilda fallback redirects to `go.chinachild.ru` cannot pass yet.

## P1 Issues

- Manual exports from Yandex.Webmaster, Google Search Console, and old Metrika should be reviewed for additional old URLs.
- Lighthouse was not run because Lighthouse CLI is not installed.
- Live form submission was not performed to avoid creating a fake lead; CTA and lead pages render and internal links return 200.

## P2 Nice-To-Have

- Add timeout/concurrency controls if redirect map grows much larger.
- Add Yandex/GSC 404 exports to `docs/cutover/redirect-map.csv` after first 24-72 hours.
- Re-run Rich Results validation manually after apex domain is live.

## Redirect Map Summary

- Total redirect rows: 246
- High confidence: 110
- Medium confidence: 118
- Low confidence: 18
- Redirects to `https://go.chinachild.ru`: 4, all old Tilda member shared/header/footer blocks with no SEO equivalent.
- Redirects to `https://my.chinachild.ru`: 4, only old member/account/login/signup URLs.
- Redirects to unsupported external fallback hosts: 0
- Manual input needed: Yandex.Webmaster indexed/404 export, Google Search Console indexed/404 export, old Metrika landing pages, historical campaign URLs if needed.

## Production Readiness Summary

- Build: PASS (`npm run build`)
- Sitemap: PASS on current Vercel production
- Robots: PASS on current Vercel production
- Canonical: PASS for checked pages on current Vercel production
- OG: PASS for checked pages on current Vercel production
- JSON-LD: PASS parse checks on checked pages
- 404 page: PASS
- Verification files: PASS
- Forms/CTA smoke: lead page `/free-trial` renders; internal links checked; no fake lead submitted
- App links to `my.chinachild.ru`: FAIL on current live production, fixed in code pending redeploy
- Redirects: FAIL on current live production, fixed in code pending redeploy

## Manual Actions Before DNS Switch

1. Configure `go.chinachild.ru` in Tilda.
2. Add Cloudflare DNS for `go.chinachild.ru` per Tilda instructions.
3. Verify `https://go.chinachild.ru` opens old Tilda and SSL works.
4. Add `chinachild.ru` to the Vercel project.
5. Add `www.chinachild.ru` in Vercel if needed.
6. Set Vercel Production env:

```env
NEXT_PUBLIC_SITE_URL=https://chinachild.ru
NEXT_PUBLIC_APP_URL=https://my.chinachild.ru
```

`NEXT_PUBLIC_APP_URL` is only for account/platform CTAs and deep links; it is not part of preserving the old Tilda site.

7. Redeploy production.
8. Run:

```bash
npm run build
EXPECTED_SITE_URL=https://chinachild.ru npm run audit:production
npm run audit:redirects
```

## Manual Actions During DNS Switch

1. In Cloudflare, point `chinachild.ru` to Vercel according to Vercel's domain instructions.
2. Configure `www.chinachild.ru` if used.
3. Keep Tilda configured for `go.chinachild.ru`.
4. Wait for Vercel SSL.
5. Check homepage, sitemap, robots, 5-10 old redirect URLs, CTA/forms, and platform links.

## Manual Actions After DNS Switch

1. Add/verify `https://chinachild.ru` in Yandex.Webmaster.
2. Add/verify `https://chinachild.ru` in Google Search Console.
3. Submit `https://chinachild.ru/sitemap.xml`.
4. Check homepage indexing.
5. Check Metrika and GA4 realtime.
6. Monitor 404s for 24-72 hours.
7. Add new redirects and redeploy if mass 404s appear.
8. Keep `chinachild-site.vercel.app` alive for now.

## Rollback Plan

1. Return `chinachild.ru` DNS to Tilda in Cloudflare.
2. Leave `go.chinachild.ru` as-is.
3. Do not delete Vercel deployment.
4. Verify old Tilda site, old forms, and `my.chinachild.ru`.
5. Fix issue, redeploy, rerun audits, and repeat cutover.

## Exact Commands To Run

```bash
npm run build
EXPECTED_SITE_URL=https://chinachild.ru npm run audit:production
npm run audit:redirects
```
