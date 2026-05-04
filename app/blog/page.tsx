import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import { formatPostDate, getAllPosts } from "@/lib/blog";
import { BLOG_HUBS } from "@/lib/blog-hubs";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Блог ChinaChild о китайском языке | Статьи для детей и взрослых",
    description:
      "Практические статьи ChinaChild про китайский язык: как начать ребёнку, как готовиться к HSK и зачем бизнесу китайский в 2026 году.",
    path: "/blog",
    keywords: [
      "блог про китайский язык",
      "статьи про HSK",
      "китайский для детей",
      "китайский для взрослых",
    ],
  });
}

const palette = ["card-cream-soft", "card-sky-soft", "card-lime-soft", "card-violet-soft", "card-peach-soft"];

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Блог", path: "/blog" },
        ]}
      />
      <PageHero
        variant="lime"
        eyebrow="Блог"
        title="Статьи о китайском языке"
        description="Методика, разбор HSK, советы родителям и истории учеников — всё, что помогает учиться эффективнее."
      />

      <section className="page-shell-wide pb-8" aria-label="Разделы блога">
        <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626]">
          Разделы блога
        </h2>
        <p className="mt-2 text-sm leading-[1.55] text-[#6b6b6b]">
          Статьи разбиты по темам — выберите интересующий раздел, чтобы найти
          материалы быстрее.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2.5">
          {BLOG_HUBS.map((hub) => (
            <Link
              key={hub.slug}
              href={`/blog/category/${hub.slug}`}
              className="blog-hub-pill"
            >
              {hub.heading}
            </Link>
          ))}
        </nav>
      </section>

      <section className="page-shell-wide pb-20">
        <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#262626]">
          Все статьи
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{post.excerpt}</p>
              <div className="mt-auto pt-6 flex items-center justify-between gap-4 text-xs text-[#6b6b6b]">
                <span>{formatPostDate(post.date)}</span>
                <span>{post.readingTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
