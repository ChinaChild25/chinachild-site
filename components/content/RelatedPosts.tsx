import Link from "next/link";
import { formatPostDate, type BlogPost } from "@/lib/blog";

/**
 * Похожие статьи под материалом. Разметка карточки повторяет ленту блога,
 * чтобы не заводить второй визуальный язык для одного и того же объекта.
 */
const palette = [
  "card-sky-soft",
  "card-lime-soft",
  "card-violet-soft",
  "card-peach-soft",
];

export default function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section className="page-shell-wide mt-20" aria-label="Похожие статьи">
      <h2 className="text-[1.5rem] font-medium leading-[1.2] tracking-[-0.01em] text-[#262626]">
        Читайте дальше
      </h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[index % palette.length]}`}
          >
            <span className="tag-pill self-start">{post.category}</span>
            <h3 className="mt-6 text-[1.25rem] font-medium leading-[1.2] tracking-[-0.01em] text-[#262626]">
              {post.title}
            </h3>
            <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
              {post.excerpt}
            </p>
            <div className="mt-auto flex items-center justify-between gap-4 pt-6 text-xs text-[#6b6b6b]">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span>{post.readingTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
