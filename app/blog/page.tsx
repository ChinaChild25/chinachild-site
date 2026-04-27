import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buttonStyles } from "@/components/ui/button";
import { formatPostDate, getAllPosts } from "@/lib/blog";
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
      <section className="page-shell section-space pt-8">
        <span className="section-label">Контент</span>
        <h1 className="section-title">Блог ChinaChild</h1>
        <p className="section-description">
          Статьи под информационные запросы усиливают SEO-кластер школы и
          помогают пользователям выбрать формат обучения осознанно.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="surface-card rounded-[28px] p-6">
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                {post.category}
              </div>
              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-[#1A1A2E]">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#4B5563]">
                {post.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between gap-4 text-sm text-[#6B7280]">
                <span>{formatPostDate(post.date)}</span>
                <span>{post.readingTime}</span>
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className={buttonStyles({ variant: "secondary", className: "mt-6" })}
              >
                Читать статью
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
