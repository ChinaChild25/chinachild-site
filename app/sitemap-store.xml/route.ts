import { renderRootSitemapIndex } from "@/lib/sitemap-helpers";

export const dynamic = "force-static";

export async function GET() {
  return new Response(renderRootSitemapIndex(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
