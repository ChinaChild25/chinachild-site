# Manual Cutover Plan

Do not change DNS, Vercel domains, or Tilda settings from code. These are manual operator steps.

## Before DNS Switch

1. In Tilda, add `school.chinachild.ru` as the domain for the old site.
2. In Cloudflare, add the DNS record for `school.chinachild.ru` exactly as Tilda instructs.
3. Verify `https://school.chinachild.ru` opens the old Tilda site and SSL is valid.
4. In Vercel, add `chinachild.ru` to the `chinachild-site` project if it is not already added.
5. In Vercel, add `www.chinachild.ru` if the www version is needed.
6. In Vercel Production env, set:

```env
NEXT_PUBLIC_SITE_URL=https://chinachild.ru
NEXT_PUBLIC_APP_URL=https://my.chinachild.ru
```

7. Redeploy production.
8. Run:

```bash
npm run build
EXPECTED_SITE_URL=https://chinachild.ru npm run audit:production
npm run audit:redirects
```

## During DNS Switch

1. In Cloudflare, change DNS for `chinachild.ru` so it points to Vercel according to Vercel's domain instructions.
2. If `www.chinachild.ru` is used, configure it according to Vercel's instructions.
3. Do not remove Tilda settings immediately. The old site must remain available through `school.chinachild.ru`.
4. Wait for Vercel SSL to become valid for `chinachild.ru`.
5. Check:
   - `https://chinachild.ru`
   - `https://chinachild.ru/sitemap.xml`
   - `https://chinachild.ru/robots.txt`
   - 5-10 old URLs from `docs/cutover/redirect-map.csv`
   - lead forms and main CTAs
   - platform links to `https://my.chinachild.ru`

## After DNS Switch

1. In Yandex.Webmaster, add or verify `https://chinachild.ru`.
2. In Google Search Console, add or verify `https://chinachild.ru`.
3. Submit sitemap:

```txt
https://chinachild.ru/sitemap.xml
```

4. Check indexing status for the homepage.
5. Check Yandex.Metrika and GA4 realtime.
6. Monitor 404s for the first 24-72 hours.
7. If mass 404s appear, add redirect rules, redeploy, and rerun `npm run audit:redirects`.
8. Keep `chinachild-site.vercel.app` alive for now.

## Rollback

1. In Cloudflare, return `chinachild.ru` DNS to the old Tilda configuration.
2. Leave `school.chinachild.ru` as-is.
3. Do not delete the Vercel deployment.
4. After rollback, verify:
   - old Tilda site opens at `https://chinachild.ru`;
   - old forms are available;
   - `https://school.chinachild.ru` still opens old Tilda;
   - `https://my.chinachild.ru` still opens the platform.
5. Fix the issue in the repo or env settings.
6. Redeploy and repeat the cutover checks before switching DNS again.
