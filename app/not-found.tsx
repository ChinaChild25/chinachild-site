import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Страница не найдена — ${SITE_NAME}`,
  description: "Запрошенная страница не существует или была перенесена.",
  robots: { index: false, follow: true },
  alternates: { canonical: absoluteUrl("/") },
};

export default function NotFound() {
  return (
    <main className="page-shell section-space">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9a9a]">
          404
        </p>
        <h1 className="mt-4 text-[2.4rem] font-bold leading-[1.04] tracking-[-0.04em] text-[#1b1b1b] sm:text-[3rem]">
          Эта страница не найдена
        </h1>
        <p className="mt-5 text-base leading-7 text-[#4b4b4b] sm:text-lg">
          Возможно, ссылка устарела или содержит опечатку. Загляните на главную
          или в каталог курсов — мы расскажем, как начать учить китайский.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-pill btn-ink">
            На главную
          </Link>
          <Link href="/courses" className="btn-pill btn-white">
            Все курсы
          </Link>
          <Link href="/blog" className="btn-pill btn-white">
            Блог
          </Link>
        </div>
      </div>
    </main>
  );
}
