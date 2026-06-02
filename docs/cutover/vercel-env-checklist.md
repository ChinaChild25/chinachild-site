# Vercel Env Checklist

## Current Env Names

Domain-related env variables used by the project:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_YANDEX_VERIFICATION`
- `NEXT_PUBLIC_GOOGLE_VERIFICATION`
- `NEXT_PUBLIC_BING_VERIFICATION`
- `NEXT_PUBLIC_MAILRU_VERIFICATION`
- `NEXT_PUBLIC_YM_ID`
- `NEXT_PUBLIC_GA_ID`

## Before Cutover

For the current technical Vercel production URL:

```env
NEXT_PUBLIC_SITE_URL=https://chinachild-site.vercel.app
NEXT_PUBLIC_APP_URL=https://my.chinachild.ru
```

This keeps current production canonical/OG/sitemap aligned with the technical host while the old Tilda site still owns `chinachild.ru`.

## At Cutover

Set Vercel Production env:

```env
NEXT_PUBLIC_SITE_URL=https://chinachild.ru
NEXT_PUBLIC_APP_URL=https://my.chinachild.ru
```

Then redeploy production. `NEXT_PUBLIC_*` values are baked into client/server output at build time, so changing them without redeploy is not enough.

## Remove Or Replace

- Replace any `NEXT_PUBLIC_APP_URL=https://app.chinachild.ru` with `https://my.chinachild.ru`.
- Replace any `NEXT_PUBLIC_APP_URL=https://chinachild-sandbox.vercel.app` with `https://my.chinachild.ru`.
- Do not use `chinachild-site.vercel.app` as final canonical production env after DNS cutover.
- Do not leave localhost values in Production env.

## Where To Change

Vercel dashboard:

1. Open the Vercel project for `chinachild-site`.
2. Go to Settings -> Environment Variables.
3. Edit Production values for `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL`.
4. Save.
5. Redeploy the production branch.

## Verification Commands

Run after redeploy:

```bash
npm run build
EXPECTED_SITE_URL=https://chinachild.ru npm run audit:production
npm run audit:redirects
```

Before cutover on the technical domain:

```bash
EXPECTED_SITE_URL=https://chinachild-site.vercel.app npm run audit:production
npm run audit:redirects
```
