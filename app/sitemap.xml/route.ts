import { renderSitemapIndex } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET() {
  const now = new Date().toISOString();
  const xml = renderSitemapIndex([
    { loc: absoluteUrl("/sitemap-pages.xml"), lastmod: now },
    { loc: absoluteUrl("/sitemap-blog.xml"), lastmod: now },
    { loc: absoluteUrl("/sitemap-images.xml"), lastmod: now },
  ]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
