import { getGlossarySlugs, getGlossaryTermBySlug } from "@/lib/glossary";
import { renderGenericOg } from "@/lib/og-templates";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Глоссарий китайского языка — ChinaChild";

export async function generateStaticParams() {
  const slugs = await getGlossarySlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function GlossaryOgImage({ params }: Params) {
  const { slug } = await params;
  const term = await getGlossaryTermBySlug(slug);

  return renderGenericOg({
    badge: "Глоссарий",
    title: term?.term ?? "Глоссарий китайского",
    subtitle: term?.shortDefinition ?? "Термины китайского языка простыми словами",
    footer: "chinachild.ru / glossary",
    background: "#e8f3ff",
    accentColor: "#1f6feb",
  });
}
