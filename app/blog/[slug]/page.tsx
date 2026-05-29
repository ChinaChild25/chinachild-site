import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Avatar from "@/components/ui/Avatar";
import ArticleFaq from "@/components/content/article-blocks/ArticleFaq";
import Callout from "@/components/content/article-blocks/Callout";
import MistakesBlock from "@/components/content/article-blocks/MistakesBlock";
import StatsStrip from "@/components/content/article-blocks/StatsStrip";
import TLDRBox from "@/components/content/article-blocks/TLDRBox";
import ArticleToc, { type TocItem } from "@/components/content/article-blocks/ArticleToc";
import InlineAudio from "@/components/content/article-blocks/InlineAudio";
import ScrollDepthTracker from "@/components/analytics/ScrollDepthTracker";
import {
  formatPostDate,
  getBlogPostBySlug,
  getBlogPostSlugs,
  parseArticleBlocks,
  slugifyHeading,
  type ArticleBlock,
} from "@/lib/blog";
import { makeAutolinker } from "@/lib/blog-autolinker";
import { getBlogHowTo } from "@/lib/blog-howto";
import { buildMetadata } from "@/lib/metadata";
import { createArticleGraph, createBlogHowToNode } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site-config";
import { teachers } from "@/lib/site-data";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

// ISR: rebuild each post at most once per day even without a deploy, so
// dateModified bumps and content edits surface within 24h.
export const revalidate = 86400;

/** Разбирает inline-markdown: `code` + **жирный** + autolink, возвращает
 *  массив React-узлов. `code` режется первым и не участвует в bold/links —
 *  иначе бектики из таблиц рендерились бы как литеральные символы. */
function renderInline(
  text: string,
  autolink: (text: string) => React.ReactNode | string,
): React.ReactNode {
  // Outer split вокруг `inline code` — нечётные сегменты остаются как есть.
  const codeParts = text.split(/`([^`]+)`/g);
  return codeParts.flatMap((segment, codeIdx) => {
    if (codeIdx % 2 === 1) {
      return <code key={`code-${codeIdx}`}>{segment}</code>;
    }
    // Внутри не-code сегментов — bold и links как раньше.
    const parts = segment.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={`bold-${codeIdx}-${i}`}>
            {renderMarkdownLinks(part, autolink, `bold-${codeIdx}-${i}`)}
          </strong>
        );
      }
      return (
        <span key={`text-${codeIdx}-${i}`}>
          {renderMarkdownLinks(part, autolink, `text-${codeIdx}-${i}`)}
        </span>
      );
    });
  });
}

function renderMarkdownLinks(
  text: string,
  autolink: (text: string) => React.ReactNode | string,
  keyPrefix: string,
): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text))) {
    const before = text.slice(lastIndex, match.index);
    if (before) parts.push(autolink(before));

    const href = match[2];
    const isExternal = /^https?:\/\//i.test(href);
    parts.push(
      <Link
        key={`${keyPrefix}-${match.index}`}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="font-semibold text-[#1b1b1b] underline underline-offset-4 decoration-[rgba(0,0,0,0.18)] hover:decoration-[rgba(0,0,0,0.6)]"
      >
        {match[1]}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }

  const rest = text.slice(lastIndex);
  if (rest) parts.push(autolink(rest));
  return parts.length > 0 ? parts : autolink(text);
}

function renderBlock(
  block: ArticleBlock,
  index: number,
  autolink: (text: string) => React.ReactNode | string,
  firstImageIndex: number,
): React.ReactNode {
  if (block.type === "heading" && block.level === 2) {
    return (
      <h2 key={`heading2-${index}`} id={slugifyHeading(block.text)}>
        {block.text}
      </h2>
    );
  }
  if (block.type === "heading" && block.level === 3) {
    return (
      <h3 key={`heading3-${index}`} id={slugifyHeading(block.text)}>
        {block.text}
      </h3>
    );
  }
  if (block.type === "list") {
    return (
      <ul key={`list-${index}`}>
        {block.items.map((item, idx) => (
          <li key={`${item}-${idx}`}>{renderInline(item, autolink)}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "table") {
    return (
      <div key={`table-${index}`} className="prose-table-wrap">
        <table className="prose-table">
          <thead>
            <tr>
              {block.headers.map((cell, idx) => (
                <th key={idx} scope="col">
                  {renderInline(cell, autolink)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx}>{renderInline(cell, autolink)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "image") {
    // src может быть пустым на этапе scaffolding — генератор заполнит после
    // первого прогона. Не показываем сломанный <img>, оставляем подпись как
    // подсказку для следующего билда.
    if (!block.src) {
      return (
        <div
          key={`image-pending-${index}`}
          className="article-image-pending"
          aria-label="Иллюстрация будет добавлена"
        >
          {block.caption ?? block.alt}
        </div>
      );
    }
    // Первое изображение статьи — кандидат на LCP. priority + fetchPriority high
    // дают браузеру шанс начать загрузку до того, как React-гидратация дошла
    // до дальних блоков. Остальные картинки лениво — экономим начальный байт.
    const isFirstImage = index === firstImageIndex;
    return (
      <figure key={`image-${index}`} className="prose-figure">
        <Image
          src={block.src}
          alt={block.alt}
          width={block.width ?? 1536}
          height={block.height ?? 1024}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 768px"
          priority={isFirstImage}
          fetchPriority={isFirstImage ? "high" : undefined}
        />
        {(block.caption ?? block.alt) ? (
          <figcaption>{block.caption ?? block.alt}</figcaption>
        ) : null}
      </figure>
    );
  }
  if (block.type === "audio") {
    return (
      <InlineAudio
        key={`audio-${index}`}
        src={block.src}
        hanzi={block.hanzi}
        pinyin={block.pinyin}
        translation={block.translation}
      />
    );
  }
  if (block.type === "tldr") {
    return <TLDRBox key={`tldr-${index}`} points={block.points} />;
  }
  if (block.type === "callout") {
    return (
      <Callout
        key={`callout-${index}`}
        variant={block.variant}
        title={block.title}
        body={block.body}
      />
    );
  }
  if (block.type === "mistakes") {
    return (
      <MistakesBlock
        key={`mistakes-${index}`}
        heading={block.heading}
        intro={block.intro}
        items={block.items}
      />
    );
  }
  if (block.type === "stats") {
    return <StatsStrip key={`stats-${index}`} items={block.items} />;
  }
  if (block.type === "faq") {
    return (
      <ArticleFaq
        key={`faq-${index}`}
        items={block.items}
        title={block.title}
        description={block.description}
        jsonLd={block.jsonLd}
        schemaId={`faq-block-${index}`}
      />
    );
  }
  return <p key={`paragraph-${index}`}>{renderInline(block.text, autolink)}</p>;
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
  const autolink = makeAutolinker(post.slug);
  const howto = getBlogHowTo(post.slug);
  const articleUrl = absoluteUrl(`/blog/${post.slug}`);

  // Собираем TOC из H2/H3 блоков. Показываем TOC только когда статья
  // достаточно структурирована (≥4 H2) — иначе компонент даёт шума больше,
  // чем пользы. Это эвристика для «длинных» статей; точный word-count в
  // парсере не считаем, чтобы не усложнять.
  const tocItems: TocItem[] = blocks
    .filter(
      (block): block is Extract<ArticleBlock, { type: "heading" }> =>
        block.type === "heading",
    )
    .map((block) => ({ level: block.level, text: block.text }));
  const h2Count = tocItems.filter((item) => item.level === 2).length;
  const showToc = h2Count >= 4;

  const firstImageIndex = blocks.findIndex((b) => b.type === "image" && Boolean(b.src));

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
      {howto ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            ...createBlogHowToNode({
              url: articleUrl,
              name: howto.name,
              description: howto.description,
              totalTime: howto.totalTime,
              steps: howto.steps,
            }),
          }}
          id={`article-${post.slug}-howto`}
        />
      ) : null}

      <article className="page-shell section-space pt-10">
        <header className="mx-auto max-w-3xl">
          <span className="tag-pill">{post.category}</span>
          <h1 className="mt-6 text-[2rem] font-medium leading-[1.1] tracking-[-0.025em] text-[#262626] sm:text-[2.6rem]">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-[1.55] text-[#4b4b4b] sm:text-[1.125rem]">
            {post.description}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[rgba(0,0,0,0.06)] pt-6">
            <Link
              href={`/team/${author.slug}`}
              className="flex items-center gap-4 rounded-[12px] transition hover:opacity-75"
              aria-label={`Профиль автора: ${author.name}`}
            >
              <Avatar
                name={author.name}
                size={48}
                src={author.image}
                alt={author.imageAlt}
                title={author.imageTitle}
              />
              <div className="flex flex-col gap-0.5 text-sm">
                <span className="font-medium text-[#262626]">{author.name}</span>
                <span className="text-[#6b6b6b]">{author.specialization}</span>
              </div>
            </Link>
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

        <div className="prose-article mx-auto mt-14 max-w-3xl">
          {showToc ? <ArticleToc items={tocItems} /> : null}
          {blocks.map((block, index) => renderBlock(block, index, autolink, firstImageIndex))}
        </div>
      </article>
      <ScrollDepthTracker slug={post.slug} />
    </main>
  );
}
