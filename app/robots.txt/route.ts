import { absoluteUrl, SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

const ROBOTS_CACHE_SECONDS = 300;

const indexableAllowPaths = [
  "/courses",
  "/courses/",
  "/price",
  "/free-trial",
  "/learn/",
  "/hsk/",
  "/chinese/hsk-test",
  "/cities",
  "/cities/",
  "/corporate",
  "/about",
  "/methodology",
  "/results",
  "/reviews",
  "/license",
  "/team",
  "/team/",
  "/blog",
  "/blog/",
  "/grammar",
  "/grammar/",
  "/dictionary",
  "/dictionary/",
  "/glossary",
  "/glossary/",
];

function robotGroup(userAgent: string, extraLines: string[] = []) {
  return [
    `User-Agent: ${userAgent}`,
    "Allow: /",
    ...indexableAllowPaths.map((path) => `Allow: ${path}`),
    "Disallow: /api/",
    ...extraLines,
  ];
}

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
  const host = new URL(SITE_URL).host;

  const lines = [
    ...robotGroup("*"),
    "",
    ...robotGroup("Yandex", [`Clean-param: ${cleanParams}`]),
    "",
    ...robotGroup("Googlebot"),
    "",
    ...robotGroup("Google-InspectionTool"),
    "",
    ...robotGroup("Bingbot"),
    "",
    `Host: ${host}`,
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": `public, max-age=${ROBOTS_CACHE_SECONDS}, must-revalidate`,
    },
  });
}
