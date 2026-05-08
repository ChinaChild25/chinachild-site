import { absoluteUrl, SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET() {
  // Clean-param is a Yandex-specific directive that strips tracking params
  // (utm_*, fbclid, gclid, ya_session etc.) so they don't dilute crawl budget
  // or create duplicate canonical signals. Yandex respects it; Google ignores
  // it harmlessly.
  const cleanParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "yclid",
    "ymclid",
    "etext",
    "ysclid",
    "gclid",
    "fbclid",
    "gad_source",
  ].join("&");

  const lines = [
    "# ChinaChild — robots.txt",
    "",
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "User-Agent: Yandex",
    "Allow: /",
    "Disallow: /api/",
    `Clean-param: ${cleanParams}`,
    "",
    "User-Agent: Googlebot",
    "Allow: /",
    "Disallow: /api/",
    "",
    "User-Agent: Bingbot",
    "Allow: /",
    "Disallow: /api/",
    "",
    // Aggressive SEO/scraping bots — throttle to 10s between hits so they
    // don't drown out our crawl budget. They still index, just slower.
    "User-Agent: AhrefsBot",
    "Allow: /",
    "Disallow: /api/",
    "Crawl-delay: 10",
    "",
    "User-Agent: SemrushBot",
    "Allow: /",
    "Disallow: /api/",
    "Crawl-delay: 10",
    "",
    "User-Agent: MJ12bot",
    "Allow: /",
    "Disallow: /api/",
    "Crawl-delay: 10",
    "",
    "User-Agent: DotBot",
    "Allow: /",
    "Disallow: /api/",
    "Crawl-delay: 10",
    "",
    "User-Agent: BLEXBot",
    "Allow: /",
    "Disallow: /api/",
    "Crawl-delay: 10",
    "",
    // Block AI scrapers that don't bring traffic but consume bandwidth.
    // GPTBot/ClaudeBot/CCBot — content scraping for model training.
    "User-Agent: GPTBot",
    "Disallow: /",
    "",
    "User-Agent: CCBot",
    "Disallow: /",
    "",
    "User-Agent: ClaudeBot",
    "Disallow: /",
    "",
    "User-Agent: anthropic-ai",
    "Disallow: /",
    "",
    `Host: ${SITE_URL}`,
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `Sitemap: ${absoluteUrl("/sitemap-pages.xml")}`,
    `Sitemap: ${absoluteUrl("/sitemap-blog.xml")}`,
    `Sitemap: ${absoluteUrl("/sitemap-images.xml")}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
