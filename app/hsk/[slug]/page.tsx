import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LeadModal from "@/components/forms/LeadModal";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import ShareButtons from "@/components/ui/ShareButtons";
import { buttonStyles } from "@/components/ui/button";
import { hskLevels, getHskLevelBySlug, type HskLevel } from "@/lib/hsk-levels";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";

type HskPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = false;

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
    title: `HSK ${level.level}: всё об уровне — слова, иероглифы, экзамен, подготовка | ChinaChild`,
    description: `HSK ${level.level}: ${formatWords(level)} слов, ${level.hanziCount} иероглифов, CEFR ${level.cefrEquivalent}. Темы экзамена и план подготовки ChinaChild.`,
    path: `/hsk/${level.slug}`,
    keywords: [
      `HSK ${level.level}`,
      `экзамен HSK ${level.level}`,
      `подготовка к HSK ${level.level}`,
      `HSK ${level.level} слова`,
      `HSK ${level.level} иероглифы`,
      `сдать HSK ${level.level}`,
      `HSK ${level.level} онлайн`,
    ],
  });
}

function formatWords(level: HskLevel) {
  return level.level === 6 ? `${level.words}+` : String(level.words);
}

function getNeighbor(level: HskLevel, direction: -1 | 1) {
  return hskLevels.find((item) => item.level === level.level + direction) ?? null;
}

function buildLevelGraph(level: HskLevel) {
  const url = absoluteUrl(`/hsk/${level.slug}`);
  const previousLevel = getNeighbor(level, -1);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${url}#course`,
        name: `Подготовка к HSK ${level.level}`,
        description: level.positioning,
        url,
        provider: { "@id": `${SITE_URL}/#organization` },
        educationalLevel: `HSK ${level.level}, CEFR ${level.cefrEquivalent}`,
        inLanguage: "ru-RU",
        teaches: [
          `HSK ${level.level}`,
          `${formatWords(level)} слов китайского`,
          `${level.hanziCount} иероглифов`,
          ...level.topicAreas,
          ...level.grammarPoints,
        ],
        coursePrerequisites:
          level.level === 1
            ? "Не требуется — программа с нуля."
            : `Уровень HSK ${level.level - 1} или равноценная подготовка.`,
        ...(previousLevel
          ? { competencyRequired: absoluteUrl(`/hsk/${previousLevel.slug}`) }
          : {}),
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

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base leading-[1.55] text-[#4b4b4b]">
          <span className="mt-[0.15rem] inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/70 text-sm font-semibold text-[#262626]">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function LevelScale({ level }: { level: HskLevel }) {
  return (
    <div className="grid gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {hskLevels.map((item) => {
          const isCurrent = item.level === level.level;
          return (
            <Link
              key={item.slug}
              href={`/hsk/${item.slug}`}
              className={`min-w-[76px] flex-1 rounded-[12px] px-3 py-4 text-center text-sm font-semibold transition hover:-translate-y-0.5 ${
                isCurrent ? "card-violet text-[#262626]" : "bg-[var(--background-2)] text-[#4b4b4b]"
              }`}
              aria-current={isCurrent ? "page" : undefined}
            >
              HSK {item.level}
            </Link>
          );
        })}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {hskLevels.map((item) => {
          const isCurrent = item.level === level.level;
          return (
            <span
              key={item.cefrEquivalent}
              className={`min-w-[76px] flex-1 rounded-[10px] px-3 py-2 text-center text-xs font-semibold ${
                isCurrent ? "bg-[#262626] text-white" : "bg-white/70 text-[#6b6b6b]"
              }`}
            >
              {item.cefrEquivalent}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default async function HskLevelPage({ params }: HskPageProps) {
  const { slug } = await params;
  const level = getHskLevelBySlug(slug);
  if (!level) notFound();

  const previousLevel = getNeighbor(level, -1);
  const nextLevel = getNeighbor(level, 1);
  const totalQuestions = level.examParts.reduce((sum, part) => sum + part.questions, 0);
  const taskMinutes = level.examParts.reduce((sum, part) => sum + part.timeMinutes, 0);
  const pageUrl = absoluteUrl(`/hsk/${level.slug}`);
  const shareTitle = `HSK ${level.level}: ${formatWords(level)} слов, ${level.hanziCount} иероглифов, экзамен ${level.examDuration}`;

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
        title={`HSK ${level.level}: уровень китайского, экзамен и подготовка`}
        description={level.positioning}
        primaryCta={{
          label: "Записаться на пробное",
          modal: true,
          defaultCourse: "hsk-preparation",
        }}
        secondaryCta={{ label: "Все курсы HSK", href: "/learn/hsk" }}
      />

      <section className="page-shell-wide pt-8">
        <div className="flex flex-wrap gap-3">
          <span className="tag-pill">CEFR: {level.cefrEquivalent}</span>
          <span className="tag-pill">Слов: {formatWords(level)}</span>
          <span className="tag-pill">Иероглифов: {level.hanziCount}</span>
          <span className="tag-pill">Экзамен: {level.examDuration}</span>
          <span className="tag-pill">Стоимость: {level.examFee}</span>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-violet-soft">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Лексика и грамматика HSK {level.level}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-[1.6] text-[#4b4b4b]">
            {level.outcome}
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-[1.25rem] font-medium leading-[1.2] text-[#262626]">
                Темы лексики
              </h3>
              <Checklist items={level.topicAreas} />
            </div>
            <div>
              <h3 className="text-[1.25rem] font-medium leading-[1.2] text-[#262626]">
                Грамматические конструкции
              </h3>
              <Checklist items={level.grammarPoints} />
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
          Примеры предложений HSK {level.level}
        </h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {level.sampleSentences.slice(0, 3).map((sentence) => (
            <article key={sentence.chinese} className="card-block card-cream">
              <p className="text-2xl font-medium leading-[1.25] text-[#262626]">
                {sentence.chinese}
              </p>
              <p className="mt-4 text-sm leading-[1.5] text-[#6b6b6b]">{sentence.pinyin}</p>
              <p className="mt-3 text-base leading-[1.55] text-[#4b4b4b]">
                {sentence.russian}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-cream-soft">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Формат экзамена HSK {level.level}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-[1.6] text-[#4b4b4b]">
            Разделы: {level.examSections.join(", ")}. Проходной балл - {level.passingScore}.
            Регистрационный сбор в России зависит от центра, ориентир - {level.examFee}.
          </p>
          <div className="mt-6 overflow-x-auto rounded-[12px] border border-[rgba(0,0,0,0.06)] bg-white/55">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-white/60">
                  <th className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-left font-medium text-[#262626]">
                    Раздел
                  </th>
                  <th className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-left font-medium text-[#262626]">
                    Вопросов
                  </th>
                  <th className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-left font-medium text-[#262626]">
                    Время
                  </th>
                  <th className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-left font-medium text-[#262626]">
                    Описание заданий
                  </th>
                </tr>
              </thead>
              <tbody>
                {level.examParts.map((part) => (
                  <tr key={part.name}>
                    <td className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3 font-medium text-[#262626]">
                      {part.name}
                    </td>
                    <td className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-[#4b4b4b]">
                      {part.questions}
                    </td>
                    <td className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-[#4b4b4b]">
                      {part.timeMinutes} мин
                    </td>
                    <td className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-[#4b4b4b]">
                      {part.description}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="px-4 py-3 text-[#262626]">Итого</td>
                  <td className="px-4 py-3 text-[#262626]">{totalQuestions}</td>
                  <td className="px-4 py-3 text-[#262626]">
                    {taskMinutes} мин в заданиях / {level.examDuration} экзамен
                  </td>
                  <td className="px-4 py-3 text-[#262626]">
                    Стоимость: {level.examFee}. Проходной балл: {level.passingScore}.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
              Уровень на шкале
            </h2>
            <p className="mt-4 text-base leading-[1.6] text-[#4b4b4b]">
              HSK {level.level} соответствует CEFR {level.cefrEquivalent}. Шкала помогает
              увидеть, где вы сейчас и какой следующий шаг даст заметный рост.
            </p>
          </div>
          <div className="card-block card-sky-soft">
            <LevelScale level={level} />
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
          Чем отличается от соседних уровней
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="card-block card-cream">
            <div className="tag-pill">{previousLevel ? `← HSK ${previousLevel.level}` : "Старт"}</div>
            <h3 className="mt-5 text-[1.35rem] font-medium leading-[1.2] text-[#262626]">
              Что уже должно быть понятно
            </h3>
            <p className="mt-4 text-base leading-[1.6] text-[#4b4b4b]">
              {level.diffFromPrev ?? "Это стартовый уровень: до него не требуется знание китайского, но важно сразу поставить произношение и тоны."}
            </p>
            {previousLevel ? (
              <Link
                href={`/hsk/${previousLevel.slug}`}
                className="mt-6 inline-flex text-sm font-semibold text-[#262626] underline-offset-4 hover:underline"
              >
                Открыть HSK {previousLevel.level}
              </Link>
            ) : null}
          </article>
          <article className="card-block card-lime-soft">
            <div className="tag-pill">{nextLevel ? `HSK ${nextLevel.level} →` : "Финиш шкалы"}</div>
            <h3 className="mt-5 text-[1.35rem] font-medium leading-[1.2] text-[#262626]">
              Что добавит следующий уровень
            </h3>
            <p className="mt-4 text-base leading-[1.6] text-[#4b4b4b]">
              {level.diffToNext ?? "Вы достигли максимума классической шкалы HSK 1-6: дальше развивают специализацию, перевод, академическое письмо и профессиональную лексику."}
            </p>
            {nextLevel ? (
              <Link
                href={`/hsk/${nextLevel.slug}`}
                className="mt-6 inline-flex text-sm font-semibold text-[#262626] underline-offset-4 hover:underline"
              >
                Открыть HSK {nextLevel.level}
              </Link>
            ) : null}
          </article>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="card-block card-peach-soft">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              ⚠ Типичные ошибки
            </h2>
            <Checklist items={level.typicalMistakes} />
          </article>
          <article className="card-block card-lime-soft">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
              ✓ Советы по подготовке
            </h2>
            <Checklist items={level.studyTips} />
          </article>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Где применяется HSK {level.level}
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.65] text-[#4b4b4b]">
            {level.realWorldUse}
          </p>
          <p className="mt-4 max-w-4xl text-base leading-[1.65] text-[#4b4b4b]">
            {level.goal}
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {level.useCases.map((useCase) => (
              <div key={useCase} className="rounded-[14px] bg-white/65 p-4">
                <div className="text-xl leading-none">✓</div>
                <p className="mt-3 text-sm font-medium leading-[1.45] text-[#262626]">
                  {useCase}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-cream-soft">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                Полезно? Поделитесь с теми, кто учит китайский
              </h2>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">
                Ссылка откроет эту страницу HSK {level.level} с таблицей экзамена,
                примерами и советами по подготовке.
              </p>
            </div>
            <ShareButtons url={pageUrl} title={shareTitle} />
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
            Зачем нужен HSK {level.level}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">{level.goal}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
              source={`hsk-${level.slug}-cta`}
              defaultCourse="hsk-preparation"
              suppressFloatingCta
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

      <section className="page-shell-wide section-space">
        <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]">
          Другие уровни HSK
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {hskLevels
            .filter((item) => item.slug !== level.slug)
            .map((item) => (
              <li key={item.slug}>
                <Link href={`/hsk/${item.slug}`} className="tag-pill">
                  HSK {item.level}
                </Link>
              </li>
            ))}
          <li>
            <Link href="/learn/hsk" className="tag-pill">
              Хаб HSK
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
