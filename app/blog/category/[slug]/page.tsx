import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { formatPostDate, getAllPosts } from "@/lib/blog";
import { BLOG_HUBS, getHubBySlug } from "@/lib/blog-hubs";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site-config";

export function generateStaticParams() {
  return BLOG_HUBS.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hub = getHubBySlug(slug);
  if (!hub) {
    return buildMetadata({
      title: "Категория не найдена | Блог ChinaChild",
      description: "Раздел блога не существует.",
      path: `/blog/category/${slug}`,
    });
  }
  return buildMetadata({
    title: hub.title,
    description: hub.description,
    path: `/blog/category/${hub.slug}`,
    keywords: hub.keywords,
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hub = getHubBySlug(slug);
  if (!hub) notFound();

  const allPosts = await getAllPosts();
  const posts = allPosts.filter((p) => p.category === hub.category);

  // ItemList schema — Yandex и Google любят, когда категории
  // декларируют структуру списка статей.
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/blog/category/${hub.slug}#itemlist`,
    name: hub.heading,
    description: hub.intro,
    numberOfItems: posts.length,
    itemListElement: posts.map((post, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: absoluteUrl(`/blog/${post.slug}`),
      name: post.title,
    })),
  };

  const palette = [
    "card-cream-soft",
    "card-sky-soft",
    "card-lime-soft",
    "card-violet-soft",
    "card-peach-soft",
  ];

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Блог", path: "/blog" },
          { name: hub.heading, path: `/blog/category/${hub.slug}` },
        ]}
      />
      <JsonLd data={itemListSchema} id={`category-${hub.slug}-list`} />

      <section className="page-shell pt-8 pb-12 sm:pt-12 sm:pb-16">
        <header className="max-w-3xl">
          <span className="tag-pill">{SITE_NAME} · Блог</span>
          <h1 className="mt-6 text-[2rem] font-medium leading-[1.1] tracking-[-0.025em] text-[#262626] sm:text-[2.6rem]">
            {hub.heading}
          </h1>
          <p className="mt-5 text-base leading-[1.6] text-[#4b4b4b] sm:text-[1.0625rem]">
            {hub.intro}
          </p>
        </header>
      </section>

      <section className="page-shell-wide pb-16">
        {posts.length === 0 ? (
          <div className="card-block card-cream-soft">
            <p className="text-base leading-[1.55] text-[#4b4b4b]">
              Пока в этой категории нет статей. Загляните в общий блог — там
              есть материалы о других сторонах изучения китайского.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-flex text-sm font-medium text-[#262626] underline underline-offset-4"
            >
              Открыть все статьи →
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[index % palette.length]}`}
              >
                <span className="tag-pill self-start">{post.category}</span>
                <h2 className="mt-6 text-[1.25rem] font-medium leading-[1.2] tracking-[-0.01em] text-[#262626]">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-6 flex items-center justify-between gap-4 text-xs text-[#6b6b6b]">
                  <span>{formatPostDate(post.date)}</span>
                  <span>{post.readingTime}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {hub.relatedTerms && hub.relatedTerms.length > 0 ? (
        <section className="page-shell pb-20">
          <div className="card-block card-block-lg card-cream">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626]">
              Связанные термины
            </h2>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              Чтобы лучше разобраться в теме, посмотрите словарные статьи нашего
              глоссария.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {hub.relatedTerms.map((termSlug) => (
                <Link
                  key={termSlug}
                  href={`/glossary/${termSlug}`}
                  className="tag-pill underline-offset-4 hover:underline"
                >
                  {termSlug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="page-shell pb-24">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] text-white leading-[1.15] sm:text-[2rem]">
            Все статьи блога
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.55] text-white/80">
            Полный список материалов: методика, грамматика, подготовка к HSK,
            бизнес-китайский, истории учеников и преподавателей школы.
          </p>
          <div className="mt-8">
            <Link href="/blog" className="btn-pill btn-white btn-pill-large">
              Открыть весь блог
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
