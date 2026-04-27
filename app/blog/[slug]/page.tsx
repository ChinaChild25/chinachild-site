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
      <article className="page-shell section-space pt-8">
        <div className="max-w-4xl">
          <span className="section-label">{post.category}</span>
          <h1 className="section-title">{post.title}</h1>
          <p className="section-description">{post.description}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-[#6B7280]">
            <span>{formatPostDate(post.date)}</span>
            <span>{post.readingTime}</span>
          </div>
        </div>

        <div className="prose-article mt-10 max-w-3xl">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
      </article>
    </main>
  );
}
