# Lighthouse Summary

Generated: 2026-06-02

## Status

Lighthouse CLI is not available locally:

- `command -v lighthouse` returned no binary.
- `node_modules/.bin/lighthouse` does not exist.

No Lighthouse scores were produced in this run.

## Manual Lighthouse Checklist

Run Lighthouse after deployment, ideally against `https://chinachild.ru` after `NEXT_PUBLIC_SITE_URL` is set and production is redeployed.

Required pages:

- Homepage desktop: `https://chinachild.ru/`
- Homepage mobile: `https://chinachild.ru/`
- Dictionary HSK: `https://chinachild.ru/dictionary/hsk/new-hsk/1`
- Grammar: `https://chinachild.ru/grammar`
- Blog: `https://chinachild.ru/blog`

Minimum expectations:

- SEO: 95+
- Accessibility: preferably 90+
- Best Practices: preferably 90+
- Performance: preferably 80+

Performance below 80 is not automatically a cutover blocker unless there is critical LCP, CLS, hydration, or JavaScript breakage.

## JSON-LD Manual Checks

The production readiness script checks all `application/ld+json` blocks on key pages:

```bash
npm run audit:production
```

Manual follow-up:

- Confirm aggregate rating/review schema is backed by visible, real review content.
- Confirm FAQ schema is present only where FAQ content is visible.
- Validate key pages with Google's Rich Results Test or Schema.org validator after cutover.

## OG Manual Checks

The production readiness script checks:

- `og:title`
- `og:description`
- `og:url`
- `og:image`
- `twitter:card`
- `og:image` absolute URL and HTTP 200

Manual follow-up:

- Share homepage and key pages in Telegram/VK to confirm previews display correctly.
- Recheck after `NEXT_PUBLIC_SITE_URL=https://chinachild.ru` is deployed.
