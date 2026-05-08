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
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // Permissive CSP that allows Yandex.Metrika, our own assets, Google Fonts
    // and inline scripts/styles required by Next.js. Tighten with nonces later.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://mc.webvisor.org https://mc.webvisor.com https://yastatic.net https://*.vercel-insights.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://mc.yandex.ru https://yandex.ru https://*.vercel.app",
      "connect-src 'self' https://mc.yandex.ru https://*.yandex.ru https://*.vercel-insights.com https://vitals.vercel-insights.com",
      "frame-src https://mc.yandex.ru",
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
      // Short HSK URLs (/hsk-1 ... /hsk-6) — конкуренты бьют по точным
      // запросам "hsk 1", "hsk 2 онлайн" с короткими slug-ами. Redirect
      // на канонический /hsk/hsk-N сохраняет один canonical и при этом
      // ловит длинный хвост запросов.
      { source: "/hsk-1", destination: "/hsk/hsk-1", permanent: true },
      { source: "/hsk-2", destination: "/hsk/hsk-2", permanent: true },
      { source: "/hsk-3", destination: "/hsk/hsk-3", permanent: true },
      { source: "/hsk-4", destination: "/hsk/hsk-4", permanent: true },
      { source: "/hsk-5", destination: "/hsk/hsk-5", permanent: true },
      { source: "/hsk-6", destination: "/hsk/hsk-6", permanent: true },
    ];
  },
};

export default nextConfig;
