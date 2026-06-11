import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const securityHeaders = [
  // Strict transport — Vercel edge sets HSTS for apex anyway, but be explicit
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // microphone=(self) — нужно для /diagnostic, Speech Recognition оценивает
    // произношение пользователя локально. Без allowlist Web Speech API
    // отказывается стартовать.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
  },
  {
    // Permissive CSP that allows Yandex.Metrika, our own assets, Google Fonts
    // and inline scripts/styles required by Next.js. Tighten with nonces later.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Yandex SmartCaptcha widget loads from TWO different domains:
      //   - smartcaptcha.cloud.yandex.ru     — captcha.js loader + iframe + AJAX
      //   - smartcaptcha.yandexcloud.net     — challenge assets / fallback
      // Wildcard `*.yandex.ru` НЕ покрывает smartcaptcha.cloud.yandex.ru —
      // CSP-маски однокомпонентные, а здесь два уровня поддоменов.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://mc.yandex.com https://mc.webvisor.org https://mc.webvisor.com https://yastatic.net https://smartcaptcha.yandexcloud.net https://smartcaptcha.cloud.yandex.ru https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.vercel-insights.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://mc.yandex.ru https://mc.yandex.com https://yandex.ru https://*.yandex.ru https://*.yandex.com https://mc.webvisor.org https://mc.webvisor.com https://smartcaptcha.yandexcloud.net https://smartcaptcha.cloud.yandex.ru https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://*.vercel.app",
      "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com https://*.yandex.ru https://*.mc.yandex.ru https://yandex.ru https://mc.webvisor.org https://mc.webvisor.com https://smartcaptcha.yandexcloud.net https://smartcaptcha.cloud.yandex.ru wss://mc.yandex.ru wss://mc.yandex.com wss://*.yandex.ru wss://mc.webvisor.org wss://mc.webvisor.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net https://*.vercel-insights.com https://vitals.vercel-insights.com https://*.supabase.co https://cdn.jsdelivr.net",
      "media-src 'self' blob: data: https://*.supabase.co",
      "frame-src https://mc.yandex.ru https://mc.yandex.com https://mc.webvisor.org https://mc.webvisor.com https://yandex.ru https://*.yandex.ru https://smartcaptcha.yandexcloud.net https://smartcaptcha.cloud.yandex.ru",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const sitemapHeaders = [
  { key: "Content-Type", value: "application/xml; charset=utf-8" },
  { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
];

type RedirectRule = {
  source: string;
  destination: string;
  permanent: true;
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
      continue;
    }

    cell += char;
  }

  cells.push(cell);
  return cells;
}

function destinationFromCsv(newPath: string, newUrl: string): string {
  if (newUrl) {
    try {
      const url = new URL(newUrl);
      if (url.hostname !== "chinachild.ru" && url.hostname !== "www.chinachild.ru") {
        return newUrl;
      }
    } catch {
      // Fall back to newPath for malformed URLs so build validation catches it.
    }
  }

  return newPath || "/";
}

function loadLegacyRedirects(): RedirectRule[] {
  const file = path.join(process.cwd(), "docs/cutover/redirect-map.csv");
  const csv = readFileSync(file, "utf8");
  const [, ...lines] = csv.split(/\r?\n/);

  return lines
    .filter((line) => line.trim())
    .flatMap((line) => {
      const [oldPath, , newPath, newUrl, status] = parseCsvLine(line);

      if (status !== "301") {
        throw new Error(`Unsupported redirect status in ${file}: ${status}`);
      }

      return [{
        source: oldPath,
        destination: destinationFromCsv(newPath, newUrl),
        permanent: true,
      }];
    });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Аватарки авторов отзывов из Яндекса. URL вида
    // https://avatars.mds.yandex.net/get-yapic/<id>/islands-retina-50 —
    // контентно-адресуемые, поэтому при смене фото в Яндексе меняется и URL
    // (вставляем новый в поле review.image вручную, см. lib/site-data.ts).
    remotePatterns: [
      { protocol: "https", hostname: "avatars.mds.yandex.net" },
    ],
    // Разрешаем next/image отдавать локальные SVG-иллюстрации (декоративные
    // иконки разделов в /public/related). CSP + sandbox обезвреживают скрипты.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/sitemap.xml", headers: sitemapHeaders },
      { source: "/sitemap-feeds.xml", headers: sitemapHeaders },
      { source: "/sitemap-store.xml", headers: sitemapHeaders },
      { source: "/feed.xml", headers: sitemapHeaders },
    ];
  },
  async redirects() {
    return loadLegacyRedirects();
  },
};

export default nextConfig;
