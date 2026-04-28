import { getAllPosts } from "@/lib/blog";
import { getAllGlossaryTerms } from "@/lib/glossary";
import { absoluteUrl, INDEXNOW_KEY, SITE_URL } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "/",
  "/about",
  "/methodology",
  "/results",
  "/reviews",
  "/blog",
  "/courses",
  "/courses/online-chinese",
  "/courses/hsk-preparation",
  "/courses/chinese-for-adults",
  "/courses/chinese-for-kids",
  "/courses/business-chinese",
  "/cities/moscow",
  "/glossary",
  "/zayavka",
];

const HOST = new URL(SITE_URL).host;
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://yandex.com/indexnow",
  "https://www.bing.com/indexnow",
];

async function ping(urlList: string[]) {
  const body = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  });

  const results = await Promise.allSettled(
    ENDPOINTS.map(async (endpoint) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      return {
        endpoint,
        status: res.status,
        ok: res.ok,
      };
    }),
  );

  return results.map((r) => (r.status === "fulfilled" ? r.value : { error: r.reason?.message ?? "unknown" }));
}

/**
 * GET /api/indexnow?secret=...
 * Submits all known URLs (static routes + blog posts + glossary) to IndexNow endpoints.
 *
 * Auth: accepts either ?secret=INDEXNOW_SECRET (manual trigger) or the
 * Authorization: Bearer ${CRON_SECRET} header sent by Vercel Cron Jobs.
 */
export async function GET(request: Request) {
  const indexnowSecret = process.env.INDEXNOW_SECRET;
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  const isCron = cronSecret ? authHeader === `Bearer ${cronSecret}` : false;

  if (indexnowSecret && !isCron) {
    const provided = new URL(request.url).searchParams.get("secret");
    if (provided !== indexnowSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const posts = await getAllPosts();
  const blogUrls = posts.map((post) => absoluteUrl(`/blog/${post.slug}`));
  const glossary = await getAllGlossaryTerms();
  const glossaryUrls = glossary.map((term) => absoluteUrl(`/glossary/${term.slug}`));
  const urlList = [...STATIC_ROUTES.map(absoluteUrl), ...blogUrls, ...glossaryUrls];

  const results = await ping(urlList);
  return Response.json({ submitted: urlList.length, results });
}

/**
 * POST /api/indexnow
 * Body: { urls: string[], secret?: string }
 * Submits a custom list of URLs (e.g. only updated pages).
 */
export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { urls?: string[]; secret?: string };
  if (secret && payload.secret !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!payload.urls || !Array.isArray(payload.urls) || payload.urls.length === 0) {
    return Response.json({ error: "Provide non-empty urls[]" }, { status: 400 });
  }

  const results = await ping(payload.urls);
  return Response.json({ submitted: payload.urls.length, results });
}
