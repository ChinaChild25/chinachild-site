import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import {
  formatPostDate,
  getBlogPostBySlug,
  getBlogPostSlugs,
  parseArticleBlocks,
  type ArticleBlock,
} from "@/lib/blog";
import { buildMetadata } from "@/lib/metadata";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function renderBlock(block: ArticleBlock, index: number): React.ReactNode {
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
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return <p key={`${block.text}-${index}`}>{block.text}</p>;
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

  return buildMetadata({
    title: `${post.title} | Блог ChinaChild`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const blocks = parseArticleBlocks(post.content);

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Блог", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <article className="page-shell section-space pt-10">
        <div className="mx-auto max-w-3xl">
          <span className="tag-pill">{post.category}</span>
          <h1 className="mt-6 text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] text-[#1b1b1b] sm:text-[2.6rem]">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-[#4b4b4b] sm:text-lg">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#6b6b6b]">
            <span>{formatPostDate(post.date)}</span>
            <span>{post.readingTime}</span>
          </div>
        </div>

        <div className="prose-article mx-auto mt-12 max-w-3xl">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
      </article>
    </main>
  );
}
