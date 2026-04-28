import { getAllPosts } from "@/lib/blog";
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
 * Submits all known URLs (static routes + blog posts) to IndexNow endpoints.
 * Protect with INDEXNOW_SECRET env var to prevent abuse.
 */
export async function GET(request: Request) {
  const secret = process.env.INDEXNOW_SECRET;
  if (secret) {
    const provided = new URL(request.url).searchParams.get("secret");
    if (provided !== secret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const posts = await getAllPosts();
  const blogUrls = posts.map((post) => absoluteUrl(`/blog/${post.slug}`));
  const urlList = [...STATIC_ROUTES.map(absoluteUrl), ...blogUrls];

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
