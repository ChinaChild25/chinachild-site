import { getAllPosts } from "@/lib/blog";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";
import { teachers } from "@/lib/site-data";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllPosts();
  const updated = posts[0]?.dateModified ?? new Date().toISOString();

  const entries = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const author =
        teachers.find((t) => t.slug === post.authorSlug) ?? teachers[0];

      return `<entry>
  <id>${url}</id>
  <title>${escapeXml(post.title)}</title>
  <link rel="alternate" type="text/html" href="${url}"/>
  <published>${post.date}</published>
  <updated>${post.dateModified}</updated>
  <author>
    <name>${escapeXml(author.name)}</name>
  </author>
  <category term="${escapeXml(post.category)}"/>
  <summary type="text">${escapeXml(post.excerpt || post.description)}</summary>
</entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ru">
  <title>${escapeXml(SITE_NAME)} — Блог</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link rel="self" type="application/atom+xml" href="${SITE_URL}/feed.xml"/>
  <link rel="alternate" type="text/html" href="${SITE_URL}/blog"/>
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
  <icon>${absoluteUrl("/icon.png")}</icon>
  <logo>${absoluteUrl("/icon.png")}</logo>
  <rights>© ${new Date().getFullYear()} ${escapeXml(SITE_NAME)}</rights>
${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
