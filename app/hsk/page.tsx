import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
import JsonLd from "@/components/seo/JsonLd";
import {
  GlobeCharacter,
  Headphones,
  HskCoin,
  PercentMedal,
  SpeechBubbles,
} from "@/components/decor/Decor";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";
import { createCourseSchema, createFaqSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Подготовка к HSK 1, 2, 3, 4, 5, 6 онлайн | ChinaChild",
    description:
      "Курсы подготовки к HSK 1–6 онлайн в школе ChinaChild. Лицензированная программа, мини-группы до 5 человек, разговорный уровень за 6 месяцев. Бесплатный тест на уровень HSK.",
    path: "/hsk",
    keywords: [
      "HSK",
      "подготовка к HSK",
      "HSK 1",
      "HSK 2",
      "HSK 3",
      "HSK 4",
      "HSK 5",
      "HSK 6",
      "тест HSK",
      "сдать HSK",
      "экзамен HSK",
    ],
  });
}

const levels = [
  {
    level: "HSK 1",
    href: "/kursy",
    card: "card-violet-soft",
    description: "150 базовых слов, простые фразы, фонетика и пиньинь. Старт для новичков.",
    duration: "80 занятий",
    price: "от 4 999 ₽",
  },
  {
    level: "HSK 2",
    href: "/kursy",
    card: "card-cream",
    description: "300 слов, бытовые диалоги, аудирование и чтение. Разговорный уровень за 6 месяцев.",
    duration: "6 месяцев",
    price: "от 4 999 ₽",
  },
  {
    level: "HSK 3",
    href: "/kursy",
    card: "card-lime-soft",
    description: "600 слов, более сложные тексты, базовая письменная речь. Подготовка к самостоятельному общению.",
    duration: "По модулям",
    price: "по запросу",
  },
  {
    level: "HSK 4",
    href: "/kursy",
    card: "card-sky",
    description: "1200 слов, понимание новостей и фильмов, развёрнутые диалоги. Уровень для работы и учёбы.",
    duration: "По модулям",
    price: "по запросу",
  },
  {
    level: "HSK 5",
    href: "/kursy",
    card: "card-peach-soft",
    description: "2500 слов, аутентичные тексты СМИ, продвинутая грамматика. Уровень для университета.",
    duration: "По модулям",
    price: "по запросу",
  },
  {
    level: "HSK 6",
    href: "/kursy",
    card: "card-cream-soft",
    description: "5000+ слов, литературные тексты, академические статьи. Высший уровень владения языком.",
    duration: "По модулям",
    price: "по запросу",
  },
];

const hskFaqs = [
  {
    question: "Что такое HSK и зачем сдавать экзамен?",
    answer:
      "HSK (汉语水平考试) — это международный экзамен по китайскому языку для иностранцев. Сертификат HSK признаётся в вузах Китая и многими работодателями. Уровень HSK 4 считается достаточным для поступления в большинство китайских университетов.",
  },
  {
    question: "Сколько уровней в HSK?",
    answer:
      "Шесть уровней: HSK 1 — базовый, HSK 6 — продвинутый. С 2021 года также действует обновлённая система HSK 7–9, но она пока используется реже.",
  },
  {
    question: "Сколько времени нужно на подготовку к HSK 2?",
    answer:
      "В нашей программе разговорный уровень и сертификат HSK 2 достигаются за 6 месяцев — при регулярных занятиях в мини-группе и выполнении домашних заданий.",
  },
  {
    question: "Как пройти бесплатный тест на уровень HSK?",
    answer:
      "На сайте chinachild.ru есть бесплатное онлайн-тестирование: 25 вопросов с вариантами ответа, по результатам — рекомендация курса. Тест охватывает уровни HSK 1–4.",
  },
  {
    question: "Где сдают экзамен HSK в России?",
    answer:
      "HSK сдают в Институтах Конфуция при российских вузах. Запись на экзамен идёт через официальный портал chinesetest.cn — мы помогаем студентам подготовиться к нужной дате.",
  },
];

export default function HskHubPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "HSK", path: "/hsk" },
        ]}
      />
      <JsonLd data={createFaqSchema(hskFaqs)} id="hsk-faq-schema" />
      <JsonLd
        data={levels.map((lvl) =>
          createCourseSchema({
            slug: lvl.level.toLowerCase().replace(" ", "-"),
            title: `${lvl.level} — подготовка онлайн`,
            href: lvl.href,
            level: lvl.level,
            duration: lvl.duration,
            format: "Онлайн, мини-группа",
            price: lvl.price,
            description: lvl.description,
            audience: "Подростки 12+ и взрослые",
            outcome: `Сертификат ${lvl.level}`,
          }),
        )}
        id="hsk-courses-schema"
      />

      <PageHero
        eyebrow="HSK 1–6 онлайн"
        title="Подготовка к HSK онлайн — все уровни от 1 до 6"
        description="Лицензированная программа подготовки к международному экзамену HSK. Мини-группы до 5 человек, индивидуальные занятия, преподаватели ЮФУ и ДГТУ с опытом 10+ лет."
        primaryCta={{ label: "Пройти тест на уровень", href: "/test-hsk" }}
        secondaryCta={{ label: "Записаться на курс", href: REGISTER_URL }}
      />

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {levels.map((lvl, idx) => (
            <Reveal key={lvl.level} delay={idx * 0.05}>
              <Link
                href={lvl.href}
                className={`card-block group relative flex h-full flex-col overflow-hidden transition hover:-translate-y-1 ${lvl.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="tag-pill">{lvl.level}</span>
                  <HskCoin className="-mr-2 -mt-2 h-16 w-16 opacity-90" />
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                  {lvl.level} — подготовка онлайн
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">{lvl.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="tag-pill">{lvl.duration}</span>
                  <span className="tag-pill">{lvl.price}</span>
                </div>
                <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                  Записаться на {lvl.level} →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="card-block card-block-lg card-violet relative overflow-hidden">
          <PercentMedal
            value="HSK"
            className="pointer-events-none absolute -right-8 -bottom-8 h-56 w-48 opacity-95"
          />
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                Не знаете свой уровень HSK?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
                Пройдите бесплатный онлайн-тест из 25 вопросов. По результату подберём
                подходящий курс — HSK 1, HSK 2, HSK 3 или HSK 4.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/test-hsk" className={buttonStyles({ size: "large", variant: "secondary" })}>
                  Пройти тест бесплатно
                </Link>
                <Link
                  href={REGISTER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ size: "large", className: "bg-white/15 text-white hover:bg-white/25" })}
                >
                  Записаться на пробное
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="card-block card-cream relative overflow-hidden">
            <SpeechBubbles className="absolute -right-2 -bottom-2 h-32 w-36 opacity-95" />
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">Аудирование</h3>
            <p className="mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">
              Тренируем восприятие на слух с первого занятия — понимаем темп речи носителей и
              учим выделять знакомые слова.
            </p>
          </div>
          <div className="card-block card-lime-soft relative overflow-hidden">
            <GlobeCharacter className="absolute -right-2 -bottom-2 h-32 w-32 opacity-95" />
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">Чтение</h3>
            <p className="mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">
              От пиньиня до иероглифов и аутентичных текстов. К HSK 3 ученики читают новости и
              разбирают тексты СМИ.
            </p>
          </div>
          <div className="card-block card-sky relative overflow-hidden">
            <Headphones className="absolute -right-2 -bottom-2 h-32 w-32 opacity-95" />
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">Говорение</h3>
            <p className="mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">
              70% курса — разговорная практика. В мини-группе у каждого хватает времени на
              речь и обратную связь от преподавателя.
            </p>
          </div>
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
