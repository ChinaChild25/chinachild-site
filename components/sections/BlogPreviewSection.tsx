import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import type { BlogPost } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog";

const palette = ["card-cream-soft", "card-sky-soft", "card-lime-soft"] as const;

export default function BlogPreviewSection({
  posts,
}: {
  posts: BlogPost[];
}) {
  return (
    <SectionShell
      id="blog"
      title="Последние статьи о китайском"
      description="Методика, разбор HSK, советы родителям и истории учеников — всё, что помогает учиться эффективнее."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <Reveal key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[index % palette.length]}`}
            >
              <span className="tag-pill self-start">{post.category}</span>
              <h3 className="mt-6 text-[1.25rem] font-medium leading-[1.2] tracking-[-0.01em] text-[#1e1e1e]">
                {post.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{post.excerpt}</p>
              <div className="mt-auto pt-6 flex items-center justify-between gap-4 text-xs text-[#6b6b6b]">
                <span>{formatPostDate(post.date)}</span>
                <span>{post.readingTime}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link href="/blog" className={buttonStyles({ variant: "secondary" })}>
          Открыть блог
        </Link>
      </div>
    </SectionShell>
  );
}
