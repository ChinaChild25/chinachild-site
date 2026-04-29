import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LeadModal from "@/components/forms/LeadModal";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import { hskLevels, getHskLevelBySlug, type HskLevel } from "@/lib/hsk-levels";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site-config";

type HskPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return hskLevels.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: HskPageProps): Promise<Metadata> {
  const { slug } = await params;
  const level = getHskLevelBySlug(slug);
  if (!level) {
    return buildMetadata({
      title: "Уровень HSK не найден | ChinaChild",
      description: "Запрошенный уровень HSK отсутствует.",
      path: `/hsk/${slug}`,
    });
  }
  return buildMetadata({
    title: `Подготовка к HSK ${level.level} онлайн — школа ChinaChild`,
    description: `Курс подготовки к HSK ${level.level}: ${level.words} слов, ${level.hours}. ${level.positioning}`,
    path: `/hsk/${level.slug}`,
    keywords: [
      `HSK ${level.level}`,
      `подготовка к HSK ${level.level}`,
      `курс HSK ${level.level}`,
      `HSK ${level.level} онлайн`,
      `HSK ${level.level} с нуля`,
    ],
  });
}

function buildLevelGraph(level: HskLevel) {
  const url = absoluteUrl(`/hsk/${level.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${url}#course`,
        name: `Подготовка к HSK ${level.level}`,
        description: level.positioning,
        url,
        provider: { "@id": `${SITE_URL}#organization` },
        educationalLevel: `HSK ${level.level}`,
        inLanguage: "ru-RU",
        teaches: [`HSK ${level.level}`, `${level.words} слов китайского`, "Иероглифический минимум"],
        coursePrerequisites:
          level.level === 1
            ? "Не требуется — программа с нуля."
            : `Уровень HSK ${level.level - 1} или равноценная подготовка.`,
        educationalCredentialAwarded: `Подготовка к экзамену HSK ${level.level}`,
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: level.hours,
          inLanguage: "ru-RU",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          location: { "@type": "VirtualLocation", url },
        },
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };
}

export default async function HskLevelPage({ params }: HskPageProps) {
  const { slug } = await params;
  const level = getHskLevelBySlug(slug);
  if (!level) notFound();

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "HSK", path: "/learn/hsk" },
          { name: `HSK ${level.level}`, path: `/hsk/${level.slug}` },
        ]}
      />
      <JsonLd data={buildLevelGraph(level)} id={`hsk-${level.slug}-graph`} />

      <PageHero
        eyebrow={`HSK ${level.level}`}
        title={`Подготовка к HSK ${level.level} онлайн`}
        description={level.positioning}
        primaryCta={{
          label: "Записаться на пробное",
          modal: true,
          defaultCourse: "hsk-preparation",
        }}
        secondaryCta={{ label: "Все курсы HSK", href: "/learn/hsk" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="card-block card-violet-soft">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b6b6b]">
              Словарь
            </div>
            <div className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[#1b1b1b]">
              {level.words}
            </div>
            <p className="mt-2 text-sm text-[#4b4b4b]">слов</p>
          </article>
          <article className="card-block card-cream">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b6b6b]">
              Время
            </div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#1b1b1b]">
              {level.hours}
            </div>
            <p className="mt-2 text-sm text-[#4b4b4b]">подготовки</p>
          </article>
          <article className="card-block card-lime-soft">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b6b6b]">
              Уровень
            </div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#1b1b1b]">
              {level.level === 1
                ? "Базовый"
                : level.level === 2
                ? "Элементарный"
                : level.level === 3
                ? "Средний"
                : level.level === 4
                ? "Уверенный"
                : level.level === 5
                ? "Продвинутый"
                : "Свободный"}
            </div>
          </article>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-block card-block-lg card-cream-soft">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
              Что вы сможете после подготовки
            </h2>
            <p className="mt-4 text-base leading-7 text-[#4b4b4b]">{level.outcome}</p>
          </div>
          <div className="card-block card-block-lg card-sky-soft">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
              Кому подходит
            </h2>
            <p className="mt-4 text-base leading-7 text-[#4b4b4b]">{level.audience}</p>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
            Зачем нужен HSK {level.level}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">{level.goal}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
              source={`hsk-${level.slug}-cta`}
              defaultCourse="hsk-preparation"
            >
              Записаться на подготовку
            </LeadModal>
            <Link
              href="/courses/hsk-preparation"
              className={buttonStyles({
                size: "large",
                className: "bg-white/15 text-white hover:bg-white/25",
              })}
            >
              Курс подготовки
            </Link>
          </div>
        </div>
      </section>

      {/* Cross-link other levels */}
      <section className="page-shell-wide section-space">
        <h2 className="text-2xl font-bold tracking-[-0.035em] text-[#1b1b1b]">
          Другие уровни HSK
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {hskLevels
            .filter((l) => l.slug !== level.slug)
            .map((l) => (
              <li key={l.slug}>
                <Link href={`/hsk/${l.slug}`} className="tag-pill">
                  HSK {l.level}
                </Link>
              </li>
            ))}
          <li>
            <Link href={`/learn/hsk`} className="tag-pill tag-pill-ink">
              Хаб HSK
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
