import { absoluteUrl } from "@/lib/site-config";

export type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  images?: { loc: string; title?: string; caption?: string }[];
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function renderSitemap(entries: UrlEntry[], includeImageNs = false): string {
  const ns = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    includeImageNs ? 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : "",
  ]
    .filter(Boolean)
    .join(" ");

  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
      const changefreq = entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "";
      const priority = entry.priority !== undefined ? `<priority>${entry.priority.toFixed(2)}</priority>` : "";
      const images = entry.images
        ? entry.images
            .map(
              (img) =>
                `<image:image><image:loc>${escapeXml(img.loc)}</image:loc>${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""}${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ""}</image:image>`,
            )
            .join("")
        : "";

      return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmod}${changefreq}${priority}${images}</url>`;
    })
    .join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${ns}>
  ${urls}
</urlset>
`;
}

export function renderSitemapIndex(sitemaps: { loc: string; lastmod?: string }[]): string {
  const items = sitemaps
    .map(
      (s) =>
        `<sitemap><loc>${escapeXml(s.loc)}</loc>${s.lastmod ? `<lastmod>${s.lastmod}</lastmod>` : ""}</sitemap>`,
    )
    .join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${items}
</sitemapindex>
`;
}

export function abs(path: string) {
  return absoluteUrl(path);
}
