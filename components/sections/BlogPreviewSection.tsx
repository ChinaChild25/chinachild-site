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
              className={`card-block blog-preview-card group flex h-full flex-col ${palette[index % palette.length]}`}
            >
              <span className="blog-preview-arrow" aria-hidden="true">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  className="transition-transform duration-200 group-hover:rotate-90"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.99997 0.25H0V4.24997H3.99997V0.25ZM4 0.25H7.99997V4.24997H4V0.25ZM12 0.25H8V4.24997H12V0.25ZM12 0.25H16V4.24997H12V0.25ZM16 0.25H20V4.24997H16V0.25ZM12 4.25H16V8.24997H12V4.25ZM12 8.25H8V12.25H12V8.25ZM4 12.25H7.99997V16.25H4V12.25ZM3.99997 16.25H0V20.25H3.99997V16.25ZM16 8.25H20V12.25H16V8.25ZM20 12.25H16V16.25H20V12.25ZM16 16.25H20V20.25H16V16.25ZM20 4.25H16V8.24997H20V4.25Z"
                    fill="#726BFF"
                  />
                </svg>
              </span>
              <span className="tag-pill self-start">{post.category}</span>
              <h3 className="mt-6 text-[1.25rem] font-medium leading-[1.2] tracking-[-0.01em] text-[#262626]">
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
