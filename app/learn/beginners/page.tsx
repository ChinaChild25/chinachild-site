import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";
import { getAllPosts } from "@/lib/blog";
import { getAllGlossaryTerms } from "@/lib/glossary";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Китайский с нуля — хаб для начинающих | ChinaChild",
  description:
    "Хаб «Китайский с нуля»: пиньинь, тоны, первые иероглифы, грамматика HSK 1, материалы и статьи. Реалистичный план для взрослых и подростков.",
  path: "/learn/beginners",
  keywords: [
    "китайский с нуля",
    "китайский для начинающих",
    "как начать учить китайский",
    "пиньинь",
    "тоны китайского",
    "первые иероглифы",
    "курс HSK 1",
  ],
});

const ROADMAP = [
  {
    step: 1,
    title: "Пиньинь и тоны",
    description:
      "Латинская запись слогов и 4 тона + нейтральный. Без этого фундамента всё остальное проседает.",
    href: "/blog/pinyin-uchim-za-7-dney",
    tone: "card-violet-soft",
    cta: "Гайд по пиньиню",
  },
  {
    step: 2,
    title: "Первые иероглифы",
    description:
      "Радикалы, черты и компоненты. С 8 лет ребёнок справится, взрослому хватит 2 недель.",
    href: "/glossary/ieroglify",
    tone: "card-cream",
    cta: "Термин «иероглифы»",
  },
  {
    step: 3,
    title: "Грамматика HSK 1",
    description:
      "Порядок слов, отрицание, вопросы, частицы. К концу — 150 слов и пробный экзамен.",
    href: "/blog/podgotovka-k-hsk-1-za-3-mesyatsa",
    tone: "card-lime-soft",
    cta: "12-недельный план",
  },
];

const STARTER_TERMS = [
  "pinyin",
  "tony",
  "ieroglify",
  "putonghua",
  "mandarin",
  "hsk",
  "radikaly",
  "shengmu-yunmu",
  "bihua",
  "bushou",
];

const palette = [
  "card-violet-soft",
  "card-cream",
  "card-lime-soft",
  "card-sky",
  "card-peach-soft",
  "card-cream-soft",
];

export default async function LearnBeginnersHub() {
  const [posts, glossary] = await Promise.all([
    getAllPosts(),
    getAllGlossaryTerms(),
  ]);

  const beginnersPosts = posts
    .filter((p) =>
      p.category === "Для начинающих" ||
      /пиньинь|тон|иероглиф|с нуля|для начинающих|базов/i.test(p.title),
    )
    .slice(0, 9);

  const beginnersTerms = glossary.filter((t) =>
    STARTER_TERMS.includes(t.slug),
  );

  const hubGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/learn/beginners")}#hub`,
        url: absoluteUrl("/learn/beginners"),
        name: "Китайский с нуля — хаб для начинающих",
        description:
          "Все материалы ChinaChild для тех, кто только начинает: пиньинь, тоны, иероглифы, грамматика HSK 1, статьи преподавателей.",
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        hasPart: [
          {
            "@type": "Course",
            name: "Онлайн-курсы китайского с нуля",
            url: absoluteUrl("/courses/online-chinese"),
          },
          ...beginnersPosts.map((p) => ({
            "@type": "Article",
            name: p.title,
            url: absoluteUrl(`/blog/${p.slug}`),
          })),
        ],
      },
    ],
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Китайский с нуля", path: "/learn/beginners" },
        ]}
      />
      <JsonLd data={hubGraph} id="learn-beginners-hub-graph" />

      <PageHero
        eyebrow="Хаб для начинающих"
        title="Китайский с нуля — всё в одном месте"
        description="Если вы только начинаете учить китайский, не пытайтесь сразу зубрить иероглифы. Сначала пиньинь и тоны — это фундамент. Здесь — пошаговый маршрут, статьи преподавателей и базовые термины. Подходит взрослым и подросткам с 12 лет."
        primaryCta={{
          label: "Записаться на пробное",
          modal: true,
          defaultCourse: "online-chinese",
        }}
        secondaryCta={{ label: "Курс с нуля", href: "/courses/online-chinese" }}
        variant="cream"
      />

      <section className="page-shell-wide section-space">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Маршрут «с нуля до HSK 1»
          </h2>
          <Link
            href="/courses/online-chinese"
            className="text-sm font-semibold text-[#1b1b1b] underline-offset-4 hover:underline"
          >
            Полный курс →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {ROADMAP.map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${item.tone}`}
            >
              <span className="tag-pill self-start">Шаг {item.step}</span>
              <h3 className="mt-5 text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-[#1b1b1b]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{item.description}</p>
              <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                {item.cta} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet-soft">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Что ждёт новичка в первые 3 месяца
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-[1.6] text-[#4b4b4b] md:grid-cols-2">
            <p>
              Первые две недели — звуки и тоны. Не иероглифы, не грамматика — только то,
              как звучит китайский слог. Без этого фундамента дальнейшая лексика
              превратится в кашу из похожих звуков.
            </p>
            <p>
              Третья–шестая неделя — первые 50–80 слов, простые конструкции, отрицание,
              вопросы. Тут уже можно строить короткие диалоги: «у меня есть книга»,
              «она идёт в школу», «мы пьём чай».
            </p>
            <p>
              Седьмая–десятая неделя — иероглифы и аудирование. Подключаются первые 100
              иероглифов через радикалы, и тренируется привычка к темпу китайской речи.
            </p>
            <p>
              Одиннадцатая–двенадцатая — пробный HSK 1. К этому моменту уже понятно,
              стоит ли идти на регистрацию или нужен ещё месяц повторений.
            </p>
          </div>
        </div>
      </section>

      {beginnersPosts.length > 0 ? (
        <section className="page-shell-wide section-space">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Статьи для начинающих
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {beginnersPosts.map((post, idx) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${palette[idx % palette.length]}`}
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

      {beginnersTerms.length > 0 ? (
        <section className="page-shell-wide section-space">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            Базовые термины
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-[1.6] text-[#4b4b4b]">
            Если встретили незнакомое слово — оно почти наверняка в глоссарии.
            Здесь самые частотные термины для уровня HSK 1–2.
          </p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {beginnersTerms.map((term) => (
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
            Хотите начать структурно?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            На бесплатном пробном уроке преподаватель оценит ваше произношение, поможет
            расставить тоны и подскажет, какой темп подойдёт именно вам — с курса
            или индивидуально.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({
                variant: "secondary",
                size: "large",
              })}
              source="learn-beginners-hub-cta"
              defaultCourse="online-chinese"
            >
              Записаться на пробное
            </LeadModal>
            <Link
              href="/courses/online-chinese"
              className={buttonStyles({
                size: "large",
                className: "bg-white/15 text-white hover:bg-white/25",
              })}
            >
              Курс с нуля
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
