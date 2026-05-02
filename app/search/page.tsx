import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { getAllPosts } from "@/lib/blog";
import { getAllGlossaryTerms } from "@/lib/glossary";
import { buildMetadata } from "@/lib/metadata";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q = "" } = await searchParams;
  const query = q.trim();

  return buildMetadata({
    title: query
      ? `Поиск: «${query}» | ChinaChild`
      : "Поиск по сайту | ChinaChild",
    description: query
      ? `Результаты поиска по запросу «${query}» в блоге и глоссарии ChinaChild.`
      : "Поиск по статьям блога и терминам глоссария ChinaChild.",
    path: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
  });
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = normalize(q);
  const hasQuery = query.length > 0;

  const [posts, terms] = await Promise.all([getAllPosts(), getAllGlossaryTerms()]);

  const matchedPosts = hasQuery
    ? posts.filter((p) => {
        const haystack = normalize(
          `${p.title} ${p.excerpt} ${p.description ?? ""} ${(p.keywords ?? []).join(" ")}`,
        );
        return haystack.includes(query);
      })
    : [];

  const matchedTerms = hasQuery
    ? terms.filter((t) => {
        const haystack = normalize(`${t.term} ${t.shortDefinition} ${t.body}`);
        return haystack.includes(query);
      })
    : [];

  const total = matchedPosts.length + matchedTerms.length;

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Поиск", path: "/search" },
        ]}
      />

      <section className="page-shell-wide pt-6 pb-16 sm:pt-10">
        <div className="card-block card-block-lg card-cream-soft">
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-on-light">Поиск</span>
            <h1 className="mt-6 text-[2.25rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3rem]">
              {hasQuery ? `Результаты по запросу «${q.trim()}»` : "Поиск по сайту"}
            </h1>
            {hasQuery ? (
              <p className="mt-4 text-base leading-[1.55] text-[#4b4b4b]">
                Найдено {total} {total === 1 ? "результат" : total >= 2 && total <= 4 ? "результата" : "результатов"} в
                блоге и глоссарии.
              </p>
            ) : (
              <p className="mt-4 text-base leading-[1.55] text-[#4b4b4b]">
                Введите запрос в адресной строке: <code className="rounded bg-[rgba(0,0,0,0.06)] px-1.5 py-0.5 text-sm">?q=ваш запрос</code>
                . Поиск идёт по статьям блога и терминам глоссария.
              </p>
            )}

            <form
              action="/search"
              method="get"
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              role="search"
            >
              <label htmlFor="search-q" className="sr-only">
                Поиск
              </label>
              <input
                id="search-q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="HSK, пиньинь, китайский с нуля…"
                className="h-12 w-full rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-white px-4 text-base text-[#262626] outline-none transition focus:border-[rgba(0,0,0,0.3)]"
                autoComplete="off"
              />
              <button
                type="submit"
                className="h-12 rounded-[8px] bg-[#262626] px-6 text-base font-medium text-white transition hover:bg-[#2c2c2c]"
              >
                Найти
              </button>
            </form>
          </div>
        </div>
      </section>

      {hasQuery ? (
        <section className="page-shell-wide pb-16">
          {total === 0 ? (
            <div className="card-block card-cream-soft text-center">
              <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#262626]">
                Ничего не нашли
              </h2>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
                Попробуйте другой запрос или загляните в{" "}
                <Link href="/blog" className="underline underline-offset-4">блог</Link> и{" "}
                <Link href="/glossary" className="underline underline-offset-4">глоссарий</Link>.
              </p>
            </div>
          ) : (
            <div className="grid gap-10">
              {matchedPosts.length > 0 ? (
                <div>
                  <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#262626]">
                    Статьи блога
                    <span className="ml-2 text-sm font-normal text-[#6b6b6b]">
                      ({matchedPosts.length})
                    </span>
                  </h2>
                  <ul className="mt-6 grid gap-3">
                    {matchedPosts.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/blog/${p.slug}`}
                          className="card-block card-cream-soft block transition hover:-translate-y-0.5"
                        >
                          <span className="tag-pill self-start">{p.category}</span>
                          <h3 className="mt-4 text-[1.125rem] font-medium tracking-[-0.005em] text-[#262626]">
                            {p.title}
                          </h3>
                          <p className="mt-2 text-sm leading-[1.55] text-[#4b4b4b]">
                            {p.excerpt}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {matchedTerms.length > 0 ? (
                <div>
                  <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#262626]">
                    Термины глоссария
                    <span className="ml-2 text-sm font-normal text-[#6b6b6b]">
                      ({matchedTerms.length})
                    </span>
                  </h2>
                  <ul className="mt-6 grid gap-3 md:grid-cols-2">
                    {matchedTerms.map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={`/glossary/${t.slug}`}
                          className="card-block card-violet-soft block transition hover:-translate-y-0.5"
                        >
                          <h3 className="text-[1.125rem] font-medium tracking-[-0.005em] text-[#262626]">
                            {t.term}
                          </h3>
                          <p className="mt-2 text-sm leading-[1.55] text-[#4b4b4b]">
                            {t.shortDefinition}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
