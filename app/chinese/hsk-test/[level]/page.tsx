import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import FAQSection from "@/components/sections/FAQSection";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import LevelHero from "@/components/hsk-test/LevelHero";
import LevelStartCard from "@/components/hsk-test/LevelStartCard";
import LevelExplainCards, {
  type ExplainSample,
} from "@/components/hsk-test/LevelExplainCards";
import LevelMistake from "@/components/hsk-test/LevelMistake";
import LevelNextStep from "@/components/hsk-test/LevelNextStep";
import LevelGrid from "@/components/hsk-test/LevelGrid";
import {
  getHskTestLevelBySlug,
  hskTestLevels,
  type HskTestLevelMeta,
} from "@/lib/hsk-test/levels";
import { hskTestFaq } from "@/lib/hsk-test/faq";
import { hskTestQuestions } from "@/lib/hsk-test/questions";
import { buildMetadata } from "@/lib/metadata";
import {
  createBreadcrumbNode,
  createFaqNode,
  type JsonLd as JsonLdType,
} from "@/lib/schema";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";

type LevelPageProps = {
  params: Promise<{ level: string }>;
};

export function generateStaticParams() {
  return hskTestLevels.map((l) => ({ level: l.slug }));
}

export async function generateMetadata({
  params,
}: LevelPageProps): Promise<Metadata> {
  const { level: slug } = await params;
  const meta = getHskTestLevelBySlug(slug);
  if (!meta) {
    return buildMetadata({
      title: "Тест HSK — уровень не найден | ChinaChild",
      description: "Запрошенный уровень HSK-теста отсутствует.",
      path: `/chinese/hsk-test/${slug}`,
    });
  }

  return buildMetadata({
    title: `Тест HSK ${meta.level} онлайн бесплатно — проверь уровень китайского`,
    description: `Бесплатный тест HSK ${meta.level}: ${meta.vocabSize}, ${meta.hanziCount}. 10–20 вопросов, результат без регистрации и рекомендации по подготовке.`,
    path: `/chinese/hsk-test/${meta.slug}`,
    keywords: [
      `тест HSK ${meta.level}`,
      `HSK ${meta.level} онлайн`,
      `HSK ${meta.level} тест`,
      `проверить уровень HSK ${meta.level}`,
      `как сдать HSK ${meta.level}`,
      `словарный запас HSK ${meta.level}`,
      `HSK ${meta.level} ${meta.cefr}`,
    ],
  });
}

const LEVEL_COPY: Record<
  HskTestLevelMeta["level"],
  {
    intro: string;
    skills: string[];
    sample: ExplainSample;
    /** Focal example (dark «screen» card) + fix + tip + «watch» pills. */
    mistake: {
      big: string;
      note: string;
      fix: string;
      tip: string;
      watch: string[];
    };
    typicalMistake: string;
    nextStep: string;
  }
> = {
  1: {
    intro:
      "HSK 1 — базовый уровень китайского. Проверяем 150 ключевых слов и умение строить простые фразы: представиться, спросить дорогу, заказать еду, рассказать о семье.",
    skills: [
      "Базовые иероглифы: 你好, 谢谢, 中国",
      "Пиньинь и тоны: māma, xuésheng",
      "Грамматика: 是, 有, 不, 吗",
      "Счётные слова и порядок слов",
    ],
    sample: {
      q: "Что означает 你好?",
      options: ["Привет", "Спасибо", "До свидания", "Извините"],
      correct: 0,
    },
    mistake: {
      big: "mā · má · mǎ",
      note: "1-й ровный, 2-й вверх, 3-й вниз-вверх — это три разных тона",
      fix: "Проговаривайте новые слова вслух с тоном: 2-й идёт вверх, 3-й — вниз и вверх. Так снимается большинство ошибок HSK 1",
      tip: "Слушайте записи и повторяйте вслух — тоны закрепляются только через проговаривание",
      watch: ["2-й тон", "3-й тон", "пиньинь", "иероглифы", "счётные слова"],
    },
    typicalMistake:
      "Студенты путают 2-й и 3-й тон в коротких словах — тест засчитывает это как слабую лексику",
    nextStep:
      "После HSK 1 имеет смысл переходить к HSK 2: добавляются прошедшее время с 了, модальные глаголы 会 / 能 / 可以 и сравнение с 比.",
  },
  2: {
    intro:
      "HSK 2 — элементарный уровень. Простой разговор о повседневном: семья, покупки, поездки, погода. 300 слов, прошедшее время с 了 и модальные глаголы.",
    skills: [
      "Бытовая лексика: 火车, 机场, 颜色",
      "Прошедшее с 了 и опыт с 过",
      "Модальные: 想, 会, 能, 可以",
      "Сравнение A 比 B + признак",
    ],
    sample: {
      q: "Выберите модальный глагол «уметь»: 我 ___ 说汉语。",
      options: ["会", "想", "在", "要"],
      correct: 0,
    },
    mistake: {
      big: "我比他高",
      note: "не «我高比他»: признак идёт после 比 и объекта",
      fix: "Держите шаблон «A 比 B + признак»: сравнение строится через 比, а прилагательное всегда в конце",
      tip: "Придумывайте свои фразы со сравнением через 比 — так шаблон входит в привычку",
      watch: ["比", "了", "会 / 能", "过", "порядок слов"],
    },
    typicalMistake:
      "Переносят русский порядок слов в сравнения: «我高比他» вместо «我比他高»",
    nextStep:
      "После HSK 2 переход на HSK 3 — это письменная часть, конструкция 把 и связные тексты в 4–5 предложений.",
  },
  3: {
    intro:
      "HSK 3 — средний уровень. Связные диалоги, чтение адаптированных текстов и короткие сообщения. Появляется письмо, конструкция 把 и условные предложения.",
    skills: [
      "Связная лексика: 习惯, 经验, 建议",
      "Конструкция 把 и пассив с 被",
      "Сложные предложения: 如果...就...",
      "Чтение коротких текстов",
    ],
    sample: {
      q: "Выберите служебное слово: 我已经 ___ 作业写完了。",
      options: ["把", "被", "给", "在"],
      correct: 0,
    },
    mistake: {
      big: "我把作业写完了",
      note: "после 把 нужен результат: 写完, а не просто 写",
      fix: "С конструкцией 把 добавляйте результат действия — 完, 好, 到. Без него фраза звучит незаконченной",
      tip: "Переписывайте короткие тексты от руки: письменная часть подтягивается быстрее всего",
      watch: ["把", "被", "了", "письмо", "результат"],
    },
    typicalMistake:
      "Проседает письмо: предложения собирают по русскому порядку и забывают результат после 把",
    nextStep:
      "После HSK 3 переход на HSK 4 — это удвоение лексики до 1200 слов, рабочие темы и сложные союзы 不仅...而且..., 只要...就....",
  },
  4: {
    intro:
      "HSK 4 — уверенный средний уровень. Рабочие и учебные темы, чтение адаптированных СМИ, деловая переписка. Первый сертификат, заметный работодателю.",
    skills: [
      "Абстрактная лексика: 效率, 趋势",
      "Союзы: 虽然...但是..., 只要...就...",
      "Пассив и определения с 的",
      "Чтение с аргументацией",
    ],
    sample: {
      q: "Выберите наречие: 无论遇到什么困难，他 ___ 不放弃。",
      options: ["都", "也", "就", "才"],
      correct: 0,
    },
    mistake: {
      big: "детали → ответ",
      note: "в «Чтении» ответ часто спрятан в одной фразе, а не в общем смысле",
      fix: "Не торопитесь в чтении: сверяйте каждую деталь вопроса с текстом — общий смысл вы и так понимаете",
      tip: "Читайте новости с карандашом — отмечайте, какая деталь дала ответ на вопрос",
      watch: ["детали", "союзы", "的", "логика", "чтение"],
    },
    typicalMistake:
      "Понимают общий смысл текста, но теряют детали в вопросе — это видно по баллу за «Чтение»",
    nextStep:
      "После HSK 4 переход на HSK 5 — это пресса, эссе и переход к 2500 словам.",
  },
};

export default async function HskTestLevelPage({ params }: LevelPageProps) {
  const { level: slug } = await params;
  const meta = getHskTestLevelBySlug(slug);
  if (!meta) notFound();

  const copy = LEVEL_COPY[meta.level];
  const url = absoluteUrl(`/chinese/hsk-test/${meta.slug}`);
  const totalQuestions = hskTestQuestions[meta.level].length;

  const breadcrumbs = [
    { name: "Главная", path: "/" },
    { name: "Китайский", path: "/courses" },
    { name: "Тест на уровень HSK", path: "/chinese/hsk-test" },
    { name: `HSK ${meta.level}`, path: `/chinese/hsk-test/${meta.slug}` },
  ];

  const graph: JsonLdType = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `Тест HSK ${meta.level} онлайн`,
        description: `Бесплатный тест на уровень HSK ${meta.level} (CEFR ${meta.cefr}) — ${meta.vocabSize}, ${meta.hanziCount}.`,
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        ...createBreadcrumbNode(breadcrumbs),
        "@id": `${url}#breadcrumb`,
      },
      {
        "@type": "Quiz",
        "@id": `${url}#quiz`,
        name: `Тест на уровень HSK ${meta.level}`,
        description: `Интерактивный тест уровня HSK ${meta.level}: лексика, грамматика, чтение. ${totalQuestions} вопросов в банке, 10–20 случайно.`,
        url,
        inLanguage: "ru-RU",
        learningResourceType: "Quiz",
        educationalLevel: `HSK ${meta.level} / CEFR ${meta.cefr}`,
        about: ["HSK", "Chinese language", `HSK ${meta.level}`],
        provider: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: true,
      },
      {
        ...createFaqNode(hskTestFaq),
        "@id": `${url}#faq`,
      },
    ],
  };

  return (
    <main>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graph} id={`hsk-test-${meta.slug}-graph`} />

      {/* Hero — dark landing-style card with the level's own 3D object */}
      <section className="page-shell-wide section-space">
        <LevelHero meta={meta} />
      </section>

      {/* Mode picker — primary CTA */}
      <section className="page-shell-wide section-space" id="start">
        <div className="text-center">
          <h2 className="text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-[#1b1b1b] sm:text-4xl">
            Выберите формат теста
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-base leading-[1.55] text-[#4b4b4b]">
            Тест бесплатный, регистрация не требуется. Результат сохранится в браузере, его можно перепройти в любой момент.
          </p>
        </div>
        <div className="mt-10">
          <LevelStartCard level={meta.level} />
        </div>
      </section>

      {/* How the test works — three cards that stack on scroll (Praktikum) */}
      <section className="page-shell-wide section-space">
        <h2 className="mb-12 text-center text-[1.875rem] font-normal leading-[1.1] tracking-[-0.02em] text-[#1b1b1b] sm:mb-16 sm:text-[2.5rem] lg:text-[3rem]">
          Как устроен тест <span className="whitespace-nowrap">HSK&nbsp;{meta.level}</span>
        </h2>
        <LevelExplainCards
          level={meta.level}
          intro={copy.intro}
          skills={copy.skills}
          sample={copy.sample}
        />
      </section>

      {/* Typical mistake — Praktikum hero collage (absolute composition) */}
      <section className="section-space">
        <div className="page-shell-wide hsk-mistake-heading text-center">
          <h2 className="text-[1.875rem] font-normal leading-[1.1] tracking-[-0.02em] text-[#1b1b1b] sm:text-[2.5rem] lg:text-[3rem]">
            Типичные ошибки на <span className="whitespace-nowrap">HSK&nbsp;{meta.level}</span>
            <span className="block text-[#9a9a9a]">и как их обойти</span>
          </h2>
        </div>
        <LevelMistake
          level={meta.level}
          mistake={copy.mistake}
          typicalMistake={copy.typicalMistake}
        />
      </section>

      {/* What's next — standalone green shape with the HSK-ladder timeline */}
      <section className="page-shell-wide section-space">
        <h2 className="mb-12 text-center text-[1.875rem] font-normal leading-[1.1] tracking-[-0.02em] text-[#1b1b1b] sm:mb-16 sm:text-[2.5rem] lg:text-[3rem]">
          Что дальше после <span className="whitespace-nowrap">HSK&nbsp;{meta.level}</span>
        </h2>
        <LevelNextStep level={meta.level} note={copy.nextStep} />
      </section>

      {/* Other levels */}
      <section className="page-shell-wide section-space">
        <h2 className="mb-12 text-center text-[1.875rem] font-normal leading-[1.1] tracking-[-0.02em] text-[#1b1b1b] sm:mb-16 sm:text-[2.5rem] lg:text-[3rem]">
          Другие уровни <span className="whitespace-nowrap">HSK-теста</span>
        </h2>
        <div>
          <LevelGrid excludeLevel={meta.level} />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <FAQSection
          title={`Частые вопросы про HSK\u00A0${meta.level}`}
          description="Если не нашли ответа — напишите, и куратор подскажет, какой уровень подойдёт именно вам."
          items={hskTestFaq}
          schema={false}
          schemaId={`hsk-test-${meta.slug}-faq`}
        />
      </section>

      {/* Final CTA */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl">
                Готовы к курсу HSK&nbsp;{meta.level}?
              </h2>
              <p className="mt-4 max-w-[560px] text-base leading-[1.55] text-white/85 sm:text-lg">
                Откроем доступ к программе под ваш уровень и подберём преподавателя. Первое занятие бесплатное — поможет окончательно понять, ваш ли это уровень.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/zayavka"
                className={buttonStyles({ variant: "secondary", size: "large" })}
                data-floating-cta-suppress="true"
              >
                Записаться на пробное
              </Link>
              <Link
                href={`/hsk/hsk-${meta.level}`}
                className={buttonStyles({
                  size: "large",
                  className: "bg-white/15 text-white hover:bg-white/25",
                })}
              >
                Подробнее о HSK&nbsp;{meta.level}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
