import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Avatar from "@/components/ui/Avatar";
import {
  formatPostDate,
  getBlogPostBySlug,
  getBlogPostSlugs,
  parseArticleBlocks,
  type ArticleBlock,
} from "@/lib/blog";
import { makeAutolinker } from "@/lib/blog-autolinker";
import { buildMetadata } from "@/lib/metadata";
import { createArticleGraph } from "@/lib/schema";
import { teachers } from "@/lib/site-data";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

// ISR: rebuild each post at most once per day even without a deploy, so
// dateModified bumps and content edits surface within 24h.
export const revalidate = 86400;

function renderBlock(
  block: ArticleBlock,
  index: number,
  autolink: (text: string) => React.ReactNode | string,
): React.ReactNode {
  if (block.type === "heading" && block.level === 2) {
    return <h2 key={`${block.text}-${index}`}>{block.text}</h2>;
  }
  if (block.type === "heading" && block.level === 3) {
    return <h3 key={`${block.text}-${index}`}>{block.text}</h3>;
  }
  if (block.type === "list") {
    return (
      <ul key={`list-${index}`}>
        {block.items.map((item) => (
          <li key={item}>{autolink(item)}</li>
        ))}
      </ul>
    );
  }
  return <p key={`${block.text}-${index}`}>{autolink(block.text)}</p>;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Статья не найдена | ChinaChild",
      description: "Материал не найден.",
      path: `/blog/${slug}`,
    });
  }

  const author = teachers.find((t) => t.slug === post.authorSlug) ?? teachers[0];

  return buildMetadata({
    title: `${post.title} | Блог ChinaChild`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    article: {
      publishedTime: post.date,
      modifiedTime: post.dateModified,
      authors: [author.name],
      section: post.category,
      tags: post.keywords,
    },
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const author = teachers.find((t) => t.slug === post.authorSlug) ?? teachers[0];
  const blocks = parseArticleBlocks(post.content);
  const autolink = makeAutolinker();

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Блог", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <JsonLd
        data={createArticleGraph({
          url: `/blog/${post.slug}`,
          title: post.title,
          description: post.description,
          category: post.category,
          datePublished: post.date,
          dateModified: post.dateModified,
          authorSlug: post.authorSlug,
          breadcrumbs: [
            { name: "Главная", path: "/" },
            { name: "Блог", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ],
          keywords: post.keywords,
        })}
        id={`article-${post.slug}-graph`}
      />

      <article className="page-shell section-space pt-10">
        <header className="mx-auto max-w-3xl">
          <span className="tag-pill">{post.category}</span>
          <h1 className="mt-6 text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] text-[#1b1b1b] sm:text-[2.6rem]">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-[#4b4b4b] sm:text-lg">
            {post.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[rgba(0,0,0,0.08)] pt-6">
            <Avatar name={author.name} size={48} />
            <div className="flex flex-col gap-0.5 text-sm">
              <span className="font-semibold text-[#1b1b1b]">{author.name}</span>
              <span className="text-[#6b6b6b]">{author.specialization}</span>
            </div>
            <div className="ml-auto flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#6b6b6b]">
              <time dateTime={post.date}>Опубликовано {formatPostDate(post.date)}</time>
              {post.dateModified && post.dateModified !== post.date ? (
                <time dateTime={post.dateModified}>
                  Обновлено {formatPostDate(post.dateModified)}
                </time>
              ) : null}
              <span>{post.readingTime}</span>
            </div>
          </div>
        </header>

        <div className="prose-article mx-auto mt-12 max-w-3xl">
          {blocks.map((block, index) => renderBlock(block, index, autolink))}
        </div>
      </article>
    </main>
  );
}
