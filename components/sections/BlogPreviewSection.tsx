import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import type { BlogPost } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog";

export default function BlogPreviewSection({
  posts,
}: {
  posts: BlogPost[];
}) {
  return (
    <SectionShell
      id="blog"
      label="Блог"
      title="Последние статьи ChinaChild"
      description="Контентный блог усиливает кластер SEO-запросов вокруг обучения китайскому языку: дети, HSK, взрослые, бизнес и методика."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {posts.map((post) => (
          <Reveal key={post.slug}>
            <article className="surface-card h-full rounded-[28px] p-6">
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                {post.category}
              </div>
              <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-[#1A1A2E]">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#4B5563]">{post.excerpt}</p>
              <div className="mt-6 flex items-center justify-between gap-4 text-sm text-[#6B7280]">
                <span>{formatPostDate(post.date)}</span>
                <span>{post.readingTime}</span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/blog" className={buttonStyles({ variant: "secondary" })}>
          Открыть блог
        </Link>
      </div>
    </SectionShell>
  );
}
