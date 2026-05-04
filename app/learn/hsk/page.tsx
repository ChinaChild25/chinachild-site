import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import { hskLevels } from "@/lib/hsk-levels";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";
import { getAllPosts } from "@/lib/blog";
import { getAllGlossaryTerms } from "@/lib/glossary";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "HSK — все уровни экзамена и подготовка | Хаб ChinaChild",
  description:
    "Полный гид по HSK: 6 уровней от базового до свободного, программа подготовки, словарный запас, время на прохождение, центры сдачи в России. Курсы, статьи, глоссарий — всё в одном месте.",
  path: "/learn/hsk",
  keywords: [
    "HSK",
    "уровни HSK",
    "подготовка HSK",
    "HSK экзамен",
    "HSK словарь",
    "HSK расписание",
  ],
});

const palette = ["card-violet-soft", "card-cream", "card-lime-soft", "card-sky", "card-peach-soft", "card-cream-soft"];

export default async function LearnHskHub() {
  const [posts, glossary] = await Promise.all([
    getAllPosts(),
    getAllGlossaryTerms(),
  ]);
  const hskPosts = posts.filter((p) => /hsk|пиньинь|тон/i.test(p.title + p.description + (p.keywords ?? []).join(" ")));
  const hskTerms = glossary.filter((t) => /hsk|пиньинь|путунхуа/i.test(t.term));

  const hubGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/learn/hsk")}#hub`,
        url: absoluteUrl("/learn/hsk"),
        name: "HSK — все уровни и подготовка",
        description:
          "Хаб всех материалов по HSK на сайте ChinaChild: уровни 1–6, курсы, статьи блога, термины глоссария.",
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${SITE_URL}#website` },
        about: { "@id": `${SITE_URL}#organization` },
        hasPart: hskLevels.map((l) => ({
          "@type": "Course",
          name: `HSK ${l.level}`,
          url: absoluteUrl(`/hsk/${l.slug}`),
        })),
      },
    ],
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "HSK", path: "/learn/hsk" },
        ]}
      />
      <JsonLd data={hubGraph} id="learn-hsk-hub-graph" />

      <PageHero
        eyebrow="Хаб HSK"
        title="HSK — всё, что нужно знать"
        description="HSK (汉语水平考试) — международный экзамен по китайскому языку для иностранцев. 6 уровней — от 150 слов на HSK 1 до 5000+ на HSK 6. Сертификат признают университеты Китая и работодатели. Здесь — все наши материалы про HSK в одном месте."
        primaryCta={{
          label: "Записаться на подготовку",
          modal: true,
          defaultCourse: "hsk-preparation",
        }}
        secondaryCta={{ label: "Курс подготовки", href: "/courses/hsk-preparation" }}
        illustration="/heroes/hsk.webp"
        illustrationAlt="3D иллюстрация HSK в фиолетовом цвете"
        illustrationWidth={1134}
        illustrationHeight={499}
      />

      <section className="page-shell-wide section-space">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            6 уровней HSK
          </h2>
          <Link
            href="/courses/hsk-preparation"
            className="text-sm font-semibold text-[#1b1b1b] underline-offset-4 hover:underline"
          >
            Полный курс →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hskLevels.map((level, idx) => (
            <Link
              key={level.slug}
              href={`/hsk/${level.slug}`}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[idx % palette.length]}`}
            >
              <div className="flex items-center justify-between">
                <span className="tag-pill">HSK {level.level}</span>
                <span className="text-xs text-[#6b6b6b]">{level.words} слов</span>
              </div>
              <h3 className="mt-5 text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                {level.positioning.split(" — ")[0]}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{level.outcome}</p>
              <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                Открыть HSK {level.level} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {hskPosts.length > 0 ? (
        <section className="page-shell-wide section-space">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Статьи по HSK
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hskPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="card-block card-cream-soft group flex h-full flex-col transition hover:-translate-y-1"
                >
                  <span className="tag-pill self-start">{post.category}</span>
                  <h3 className="mt-4 text-[1.125rem] font-medium tracking-[-0.005em] text-[#262626] leading-[1.2]">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.55] text-[#4b4b4b]">{post.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hskTerms.length > 0 ? (
        <section className="page-shell-wide section-space">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Термины
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {hskTerms.map((term) => (
              <li key={term.slug}>
                <Link href={`/glossary/${term.slug}`} className="tag-pill">
                  {term.term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
            Готовитесь к HSK?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Запишитесь на бесплатное пробное занятие. Преподаватель оценит ваш уровень,
            подберёт цель и составит план подготовки к ближайшему экзамену.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
              source="learn-hsk-hub-cta"
              defaultCourse="hsk-preparation"
            >
              Записаться на пробное
            </LeadModal>
            <Link
              href="/courses/hsk-preparation"
              className={buttonStyles({
                size: "large",
                className: "bg-white/15 text-white hover:bg-white/25",
              })}
            >
              Курс подготовки к HSK
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
