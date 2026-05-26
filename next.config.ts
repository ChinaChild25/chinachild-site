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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/sitemap.xml", headers: sitemapHeaders },
      { source: "/feed.xml", headers: sitemapHeaders },
    ];
  },
  async redirects() {
    return [
      // Old Russian-slug routes → new English-slug structure (permanent 308 ≡ 301)
      { source: "/kursy", destination: "/courses", permanent: true },
      { source: "/onlajn-kursy", destination: "/courses/online-chinese", permanent: true },
      { source: "/hsk", destination: "/courses/hsk-preparation", permanent: true },
      { source: "/dlya-detej", destination: "/courses/chinese-for-kids", permanent: true },
      { source: "/dlya-podrostkov", destination: "/courses/chinese-for-kids", permanent: true },
      { source: "/dlya-vzroslyh", destination: "/courses/chinese-for-adults", permanent: true },
      { source: "/dlya-biznesa", destination: "/courses/business-chinese", permanent: true },
      { source: "/test-hsk", destination: "/courses/hsk-preparation", permanent: true },
      { source: "/prepodavateli", destination: "/about", permanent: true },
      // Legacy blog slugs → new English slugs
      {
        source: "/blog/kak-podgotovitsya-k-hsk-1",
        destination: "/blog/hsk-levels-explained",
        permanent: true,
      },
      {
        source: "/blog/kitajskij-dlya-detej-s-chego-nachat",
        destination: "/blog/chinese-for-beginners-guide",
        permanent: true,
      },
      {
        source: "/blog/zachem-biznesu-kitajskij-yazyk",
        destination: "/blog/how-long-to-learn-chinese",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
