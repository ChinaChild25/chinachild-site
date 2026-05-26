import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import FAQSection from "@/components/sections/FAQSection";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import HskHeroHanzi from "@/components/hsk-test/HskHeroHanzi";
import LevelStartCard from "@/components/hsk-test/LevelStartCard";
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

/** One signature character per level — picked because it's both a real
 *  HSK-level lemma and visually distinct in stroke-order animation. */
const LEVEL_HANZI: Record<HskTestLevelMeta["level"], string> = {
  1: "你",
  2: "学",
  3: "想",
  4: "题",
};

const LEVEL_COPY: Record<
  HskTestLevelMeta["level"],
  {
    intro: string;
    skills: string[];
    sample: string;
    typicalMistake: string;
    nextStep: string;
  }
> = {
  1: {
    intro:
      "HSK 1 — это базовый уровень китайского. Здесь проверяется знание 150 ключевых слов и умение строить простые фразы: представиться, спросить дорогу, заказать еду, рассказать о семье. Тест HSK 1 займёт около 5–10 минут и подходит тем, кто только начал учить китайский или хочет понять, насколько крепкая база у вас сложилась после самостоятельных занятий.",
    skills: [
      "Узнавание базовых иероглифов: 你好, 谢谢, 学生, 老师, 水, 中国",
      "Пиньинь и базовые тоны — māma, xuésheng, gāoxìng",
      "Простая грамматика: 是, 有, отрицание 不, вопрос с 吗",
      "Счётные слова и порядок «время → место → действие»",
    ],
    sample:
      "Пример вопроса HSK 1: «Что означает 你好?» — A) Привет, B) Спасибо, C) До свидания, D) Извините.",
    typicalMistake:
      "Самая частая ошибка на HSK 1 — путать второй и третий тон в коротких словах. Если тест укажет на «слабую лексику», скорее всего, дело именно в этом.",
    nextStep:
      "После HSK 1 имеет смысл переходить к HSK 2: добавляются прошедшее время с 了, модальные глаголы 会 / 能 / 可以 и сравнение с 比.",
  },
  2: {
    intro:
      "HSK 2 — элементарный уровень. На этом этапе вы поддерживаете простой разговор о повседневных темах: семья, покупки, поездки, погода, планы. Словарный запас увеличивается до 300 слов, появляется прошедшее время с 了 и модальные глаголы. Тест HSK 2 покажет, готовы ли вы к самостоятельной поездке в Китай и к старту HSK 3.",
    skills: [
      "Лексика бытовых ситуаций: 火车, 机场, 颜色, 已经, 锻炼",
      "Прошедшее с 了 и опыт с 过",
      "Модальные глаголы: 想, 会, 能, 可以, 应该",
      "Сравнение A 比 B + признак и наречия 很, 非常, 有点儿",
    ],
    sample:
      "Пример вопроса HSK 2: «我 ___ 说汉语» — выберите модальный глагол со значением «уметь».",
    typicalMistake:
      "На HSK 2 студенты часто переносят русский порядок слов в сравнения: «我高比他» вместо правильного «我比他高».",
    nextStep:
      "После HSK 2 переход на HSK 3 — это письменная часть, конструкция 把 и связные тексты в 4–5 предложений.",
  },
  3: {
    intro:
      "HSK 3 — средний уровень. Вы уверенно ведёте бытовые диалоги, читаете адаптированные тексты, пишете короткие сообщения. Появляется письменная часть экзамена, конструкция 把, условные предложения 如果...就... и наречия 已经 / 还 / 就. Тест HSK 3 проверит, удержите ли вы плотность связного текста и нюансы грамматики.",
    skills: [
      "Связная лексика: 习惯, 经验, 影响, 解决, 建议, 其实",
      "Конструкция 把 и пассив с 被",
      "Сложные предложения: 如果...就..., 虽然...但是..., 一边...一边...",
      "Чтение коротких текстов с пониманием намерения говорящего",
    ],
    sample:
      "Пример вопроса HSK 3: «我已经 ___ 作业写完了» — выберите служебный элемент (把).",
    typicalMistake:
      "На HSK 3 чаще всего «проседает» письменная часть: студенты собирают предложения по русскому порядку слов и забывают результат после 把.",
    nextStep:
      "После HSK 3 переход на HSK 4 — это удвоение лексики до 1200 слов, рабочие темы и сложные союзы 不仅...而且..., 只要...就....",
  },
  4: {
    intro:
      "HSK 4 — уверенный средний уровень. На этом этапе вы обсуждаете рабочие и учебные темы, читаете адаптированные СМИ, ведёте деловую переписку и понимаете развёрнутые объяснения. Это первый сертификат, который реально заметен работодателю и нужен для бакалавриата в Китае. Тест HSK 4 покажет, готовы ли вы к экзамену в аккредитованном центре.",
    skills: [
      "Абстрактная лексика: 效率, 竞争, 趋势, 适应, 态度, 推广",
      "Сложные союзы: 虽然...但是..., 只要...就..., 不仅...而且..., 无论...都...",
      "Пассивные конструкции и сложные определения с 的",
      "Чтение текстов с причинно-следственными связями и аргументацией",
    ],
    sample:
      "Пример вопроса HSK 4: «无论遇到什么困难，他 ___ 不放弃» — выберите наречие (都).",
    typicalMistake:
      "На HSK 4 студенты часто понимают общий смысл текста, но теряют детали в вопросе — это видно по баллу за «Чтение» в результате.",
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

      {/* Hero */}
      <section className="page-shell-wide section-space">
        <div className={`card-block card-block-lg ${meta.cardClass}`}>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <span className="eyebrow eyebrow-on-light">
                Уровень HSK {meta.level} · CEFR {meta.cefr}
              </span>
              <h1 className="mt-5 text-[2.25rem] font-normal leading-[1.05] tracking-[-0.03em] text-[#1b1b1b] sm:text-[3rem] lg:text-[3.75rem]">
                Тест HSK {meta.level} онлайн — проверьте свой уровень китайского за 10 минут
              </h1>
              <p className="mt-5 max-w-[600px] text-base leading-[1.55] text-[#1b1b1b] sm:text-lg">
                {meta.blurb}
              </p>
              <div className="hsk-test-trust">
                <span className="hsk-test-trust-item">{meta.vocabSize}</span>
                <span className="hsk-test-trust-item">{meta.hanziCount}</span>
                <span className="hsk-test-trust-item">{meta.hours}</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <HskHeroHanzi
                hanzi={LEVEL_HANZI[meta.level]}
                size={280}
                strokeColor="#1b1b1b"
              />
            </div>
          </div>
        </div>
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

      {/* What's checked + skills */}
      <section className="page-shell-wide section-space">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-[1.5rem] font-normal leading-[1.2] tracking-[-0.02em] text-[#1b1b1b] sm:text-[2rem]">
              Что проверяет тест HSK {meta.level}
            </h2>
            <p className="mt-4 text-base leading-[1.6] text-[#4b4b4b]">
              {copy.intro}
            </p>
          </div>
          <div className="card-block card-cream">
            <h3 className="text-[1.25rem] font-medium leading-[1.2] text-[#1b1b1b]">
              На уровне HSK {meta.level} вы умеете:
            </h3>
            <ul className="mt-5 grid gap-3">
              {copy.skills.map((skill) => (
                <li
                  key={skill}
                  className="flex gap-3 text-base leading-[1.55] text-[#4b4b4b]"
                >
                  <span className="mt-[0.15rem] inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/70 text-sm font-semibold text-[#262626]">
                    ✓
                  </span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-[14px] bg-white/65 p-4 text-sm leading-[1.55] text-[#4b4b4b]">
              <strong className="text-[#1b1b1b]">Образец:</strong> {copy.sample}
            </div>
          </div>
        </div>
      </section>

      {/* Mistake + next step */}
      <section className="page-shell-wide section-space">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="card-block card-peach-soft">
            <h2 className="text-[1.25rem] font-medium leading-[1.2] text-[#1b1b1b]">
              Типичная ошибка на HSK {meta.level}
            </h2>
            <p className="mt-4 text-base leading-[1.6] text-[#4b4b4b]">
              {copy.typicalMistake}
            </p>
          </article>
          <article className="card-block card-lime-soft">
            <h2 className="text-[1.25rem] font-medium leading-[1.2] text-[#1b1b1b]">
              Что дальше после HSK {meta.level}
            </h2>
            <p className="mt-4 text-base leading-[1.6] text-[#4b4b4b]">
              {copy.nextStep}
            </p>
          </article>
        </div>
      </section>

      {/* Other levels */}
      <section className="page-shell-wide section-space">
        <h2 className="text-[1.5rem] font-normal leading-[1.2] tracking-[-0.02em] text-[#1b1b1b] sm:text-[2rem]">
          Другие уровни HSK-теста
        </h2>
        <div className="mt-8">
          <LevelGrid />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <FAQSection
          title={`Частые вопросы про HSK ${meta.level}`}
          description="Если не нашли ответа — напишите, и куратор подскажет, какой уровень подойдёт именно вам."
          items={hskTestFaq}
          schemaId={`hsk-test-${meta.slug}-faq`}
        />
      </section>

      {/* Final CTA */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl">
                Готовы к курсу HSK {meta.level}?
              </h2>
              <p className="mt-4 max-w-[560px] text-base leading-[1.55] text-white/85 sm:text-lg">
                Откроем доступ к программе под ваш уровень и подберём преподавателя. Первое занятие бесплатное — поможет окончательно понять, ваш ли это уровень.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/zayavka"
                className={buttonStyles({ variant: "secondary", size: "large" })}
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
                Подробнее о HSK {meta.level}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
