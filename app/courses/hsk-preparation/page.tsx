import type { Metadata } from "next";
import Link from "next/link";
import CourseLanding from "@/components/sections/CourseLanding";
import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Подготовка к HSK 1–6 онлайн — курсы ChinaChild",
    description:
      "Подготовка к HSK 1–6 онлайн: структура экзамена по уровням, лексика и проходной балл, мини-группы и преподаватели уровня HSK 4+. Бесплатный тест на уровень.",
    path: "/courses/hsk-preparation",
    keywords: [
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
      "поступление в китайский вуз",
    ],
  });
}

// ── «Что вы получаете» ────────────────────────────────────────────────────
const whyCards = [
  {
    tone: "card-violet-soft",
    eyebrow: "Под целевой уровень",
    title: "План под дату экзамена",
    body:
      "Стартовый тест определяет текущий уровень, дальше — программа под конкретную цель: HSK 2 для базы, HSK 4 для вуза, HSK 5–6 для магистратуры.",
  },
  {
    tone: "card-cream",
    eyebrow: "Реальные форматы",
    title: "Аудирование, чтение, письмо",
    body:
      "Каждый урок включает задания в формате реального HSK. Аудирование тренируем в нормальном темпе, а не в учебном замедлении.",
  },
  {
    tone: "card-lime-soft",
    eyebrow: "Преподаватели HSK 4+",
    title: "Те, кто сам сдавал экзамен",
    body:
      "Занятия ведут преподаватели уровня HSK 4 и выше с опытом подготовки к экзамену; на старших уровнях подключается носитель путунхуа.",
  },
  {
    tone: "card-sky",
    eyebrow: "Лицензия Москвы",
    title: "Налоговый вычет 13%",
    body:
      "Школа лицензирована Департаментом образования Москвы. Вернёте 13% стоимости обучения — до 19 500 ₽ в год; документы для вычета выдаём.",
  },
];

// ── «Что такое HSK» ───────────────────────────────────────────────────────
const aboutHsk = [
  {
    tone: "card-violet-soft",
    title: "Международный стандарт",
    body:
      "HSK (汉语水平考试) — официальный экзамен по китайскому для иностранцев. Шесть уровней: от HSK 1 (150 слов) до HSK 6 (5000+ слов).",
  },
  {
    tone: "card-cream-soft",
    title: "Зачем нужен сертификат",
    body:
      "Его признают университеты Китая, многие международные компании и российские работодатели с китайскими партнёрами. Сертификат идёт в резюме и в заявку на грант.",
  },
  {
    tone: "card-lime-soft",
    title: "Где сдают в России",
    body:
      "В Институтах Конфуция при вузах — Москва, Санкт-Петербург, Казань, Екатеринбург, Новосибирск, Владивосток. Регистрация на chinesetest.cn обычно за 4–5 недель до даты.",
  },
];

// ── Блок №3: таблица уровней HSK (данные из lib/hsk-levels.ts) ─────────────
const hskRows = [
  { level: "HSK 1", words: "150", hanzi: "174", cefr: "A1", hours: "80–100 ч", pass: "120 / 200", goal: "Путешествия и первый контакт" },
  { level: "HSK 2", words: "300", hanzi: "347", cefr: "A2", hours: "160–200 ч", pass: "120 / 200", goal: "Бытовое общение, поездки" },
  { level: "HSK 3", words: "600", hanzi: "617", cefr: "B1", hours: "280–320 ч", pass: "180 / 300", goal: "Самостоятельные ситуации, переписка" },
  { level: "HSK 4", words: "1200", hanzi: "1064", cefr: "B2", hours: "480–560 ч", pass: "180 / 300", goal: "Вузы Китая, работа с партнёрами" },
  { level: "HSK 5", words: "2500", hanzi: "1685", cefr: "C1", hours: "720–840 ч", pass: "180 / 300", goal: "Магистратура, переговоры" },
  { level: "HSK 6", words: "5000", hanzi: "2663", cefr: "C2", hours: "1200+ ч", pass: "180 / 300", goal: "Перевод, синология" },
];

const levelLinks = [
  { level: "HSK 1", href: "/hsk/hsk-1", outcome: "Пиньинь, 4 тона, простые фразы о себе" },
  { level: "HSK 2", href: "/hsk/hsk-2", outcome: "Бытовые диалоги: покупки, поездки, планы" },
  { level: "HSK 3", href: "/hsk/hsk-3", outcome: "Связная речь и первая письменная часть" },
  { level: "HSK 4", href: "/hsk/hsk-4", outcome: "Рабочие темы, минимум для вузов Китая" },
  { level: "HSK 5", href: "/hsk/hsk-5", outcome: "Пресса, презентации, аргументация" },
  { level: "HSK 6", href: "/hsk/hsk-6", outcome: "Свободное чтение и пересказ текста" },
];

// ── «Какой HSK нужен для вашей цели» ──────────────────────────────────────
const goalCards = [
  { tone: "card-violet-soft", badge: "Путешествия и быт", body: "Достаточно HSK 1–2: купить билет, заказать еду, объяснить маршрут, рассказать о себе." },
  { tone: "card-cream-soft", badge: "Бакалавриат в Китае", body: "Частый минимальный порог — HSK 4. Конкретные требования смотрите на сайте вуза: они различаются по программам." },
  { tone: "card-lime-soft", badge: "Магистратура и работа", body: "HSK 5–6: свободная речь, чтение прессы, академические и профессиональные тексты." },
  { tone: "card-sky-soft", badge: "Резюме и партнёры из КНР", body: "HSK 3–4 — заметный для работодателя уровень и база для деловой переписки." },
];

// ── Как идёт подготовка ───────────────────────────────────────────────────
const processSteps = [
  { step: "01", title: "Диагностика уровня", body: "Бесплатный тест на сайте и пробное занятие определяют, с какого уровня стартовать и где пробелы." },
  { step: "02", title: "Программа под цель", body: "Куратор строит план под целевой уровень и дату экзамена. Лексику учим по частоте встречаемости в тестах, а не по порядку учебника." },
  { step: "03", title: "Занятия в формате HSK", body: "Аудирование, чтение и письмо в формате реального экзамена. AI-тренажёр ставит тоны и тренирует восприятие на слух в нормальном темпе." },
  { step: "04", title: "Пробники и разбор", body: "Пробные тесты на время и чек-пойнты каждые несколько недель. После каждого пробника — разбор, где и почему теряются баллы." },
];

// ── Форматы и цена ────────────────────────────────────────────────────────
const priceCards = [
  { tone: "card-cream-soft", title: "Мини-группа до 5", price: "15 990 ₽", body: "8 занятий с преподавателем уровня HSK 4+ — как с репетитором, но дешевле. Записи уроков и закрытый чат." },
  { tone: "card-lime-soft", title: "Индивидуально", price: "17 990 ₽", body: "8 занятий один на один: персональный план под дату экзамена, гибкий график и сопровождение куратора." },
];

// ── Команда ───────────────────────────────────────────────────────────────
const teamRows = [
  { role: "Преподаватель с базой HSK 1–4", body: "Анастасия Ерина получила языковое образование в Китае — Wuhan University и 武昌理工学院. Готовит к HSK по актуальным материалам." },
  { role: "Автор учебных пособий", body: "Милена-Мария Карлова — преподаватель с 13-летним стажем, автор самоучителей и словарей по китайскому, сертификат HSK 4." },
  { role: "Носитель путунхуа", body: "Чжао Ли тренирует аудирование и устную часть (HSKK): живая речь в нормальном темпе и постановка произношения." },
];

const h2Class =
  "text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl";
const leadClass = "mt-4 text-base leading-[1.65] text-[var(--muted-strong)]";

export default function HskPreparationPage() {
  return (
    <CourseLanding
      breadcrumb={{ name: "Подготовка к HSK", path: "/courses/hsk-preparation" }}
      pageHero={{
        variant: "violet",
        eyebrow: "HSK 1–6",
        title: "Подготовка к HSK онлайн — все уровни от 1 до 6",
        description:
          "Лицензированная программа подготовки к международному экзамену HSK. Мини-группы до 5 человек, преподаватели уровня HSK 4+, реальные форматы экзамена на каждом уроке и пробные тесты на время.",
      }}
      sections={
        <>
          {/* === ЧТО ВЫ ПОЛУЧАЕТЕ ============================================ */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Что вы получаете</span>
              <h2 className={`mt-4 ${h2Class}`}>Как устроена подготовка к HSK в ChinaChild</h2>
              <p className={leadClass}>
                HSK — это не «выучить язык вообще», а сдать конкретный экзамен на
                конкретный балл. Поэтому подготовка строится от цели: дата, нужный
                уровень, формат заданий — и план, который к этому ведёт.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {whyCards.map((card) => (
                <Reveal key={card.title}>
                  <article className={`card-block h-full ${card.tone}`}>
                    <div className="text-sm font-medium text-[var(--ink)]/55">{card.eyebrow}</div>
                    <h3 className="mt-4 text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">{card.title}</h3>
                    <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">{card.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === ЧТО ТАКОЕ HSK =============================================== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Что такое HSK</span>
              <h2 className={`mt-4 ${h2Class}`}>Зачем нужен экзамен и где его сдают</h2>
              <p className={leadClass}>
                Если вы только присматриваетесь к HSK — короткая вводная, чтобы
                понять, какой уровень и зачем нужен именно вам.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {aboutHsk.map((card) => (
                <Reveal key={card.title}>
                  <article className={`card-block h-full ${card.tone}`}>
                    <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">{card.title}</h3>
                    <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">{card.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === БЛОК №3: ТАБЛИЦА УРОВНЕЙ HSK =============================== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Уровни HSK</span>
              <h2 className={`mt-4 ${h2Class}`}>Все уровни HSK 1–6: слова, иероглифы, сроки и баллы</h2>
              <p className={leadClass}>
                Объём лексики и иероглифики, ориентировочные часы на освоение,
                соответствие шкале CEFR и проходной балл по каждому уровню.
                Часы — приблизительные: реальный темп зависит от занятий и практики.
              </p>
            </div>
            <Reveal>
              <div className="mt-8 card-block card-block-lg card-cream-soft">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm md:text-base">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.12)]">
                        <th className="py-4 pr-4 font-semibold text-[var(--ink)]">Уровень</th>
                        <th className="py-4 pr-4 font-semibold text-[var(--ink)]">Слова</th>
                        <th className="py-4 pr-4 font-semibold text-[var(--ink)]">Иероглифы</th>
                        <th className="py-4 pr-4 font-semibold text-[var(--ink)]">CEFR</th>
                        <th className="py-4 pr-4 font-semibold text-[var(--ink)]">Объём</th>
                        <th className="py-4 pr-4 font-semibold text-[var(--ink)]">Проходной балл</th>
                        <th className="py-4 font-semibold text-[var(--ink)]">Для какой цели</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hskRows.map((r) => (
                        <tr key={r.level} className="border-b border-[rgba(0,0,0,0.06)]">
                          <td className="py-4 pr-4 font-medium text-[var(--ink)]">{r.level}</td>
                          <td className="py-4 pr-4 text-[var(--muted-strong)]">{r.words}</td>
                          <td className="py-4 pr-4 text-[var(--muted-strong)]">{r.hanzi}</td>
                          <td className="py-4 pr-4 text-[var(--muted-strong)]">{r.cefr}</td>
                          <td className="py-4 pr-4 text-[var(--muted-strong)]">{r.hours}</td>
                          <td className="py-4 pr-4 text-[var(--muted-strong)]">{r.pass}</td>
                          <td className="py-4 text-[var(--muted-strong)]">{r.goal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {levelLinks.map((l) => (
                <Reveal key={l.level}>
                  <Link href={l.href} className="card-block bg-[var(--background-2)] flex h-full flex-col transition hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[1.125rem] font-medium text-[var(--ink)]">{l.level}</h3>
                      <span className="text-sm text-[var(--ink)]/55">Подробнее →</span>
                    </div>
                    <p className="mt-2 text-sm leading-[1.55] text-[var(--muted-strong)]">{l.outcome}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === КАКОЙ HSK ДЛЯ ЦЕЛИ ========================================= */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Какой уровень нужен</span>
              <h2 className={`mt-4 ${h2Class}`}>Какой HSK нужен под вашу цель</h2>
              <p className={leadClass}>
                Точные требования к баллу различаются по странам, вузам и
                работодателям — ниже честные ориентиры, от которых стоит
                отталкиваться.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {goalCards.map((card) => (
                <Reveal key={card.badge}>
                  <article className={`card-block h-full ${card.tone}`}>
                    <div className="tag-pill">{card.badge}</div>
                    <p className="mt-4 text-sm leading-[1.6] text-[var(--muted-strong)]">{card.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === КАК ИДЁТ ПОДГОТОВКА ======================================== */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-cream-soft">
              <div className="max-w-3xl">
                <span className="tag-pill">Как идёт подготовка</span>
                <h2 className={`mt-4 ${h2Class}`}>От диагностики до пробного экзамена</h2>
                <p className={leadClass}>
                  Школа не является официальным экзаменационным центром — мы
                  готовим к экзамену по программе и помогаем выбрать ближайший
                  центр и записаться на удобную дату.
                </p>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {processSteps.map((s) => (
                  <Reveal key={s.step}>
                    <article className="card-block repetitor-process-step-card h-full">
                      <div className="text-2xl font-medium tracking-[-0.01em] text-[var(--ink)]">{s.step}</div>
                      <h3 className="mt-3 text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">{s.title}</h3>
                      <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">{s.body}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* === ФОРМАТЫ И ЦЕНА ============================================= */}
          <section className="page-shell-wide section-space">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <Reveal>
                <div className="card-block card-block-lg card-ink h-full">
                  <span className="tag-pill tag-pill-ink">Форматы и цена</span>
                  <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-[2.25rem]">
                    Мини-группа или индивидуально
                  </h2>
                  <p className="mt-5 text-base leading-7 text-white/85">
                    Базовый курс HSK 1–2 рассчитан примерно на полгода, дальше —
                    подготовка к нужному уровню на платформе. Мини-группа дешевле,
                    индивидуально — это план строго под вашу дату экзамена. Также
                    доступно самостоятельное «Введение» за 4 990 ₽.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/chinese/hsk-test" className={buttonStyles({ variant: "secondary" })}>
                      Пройти тест на уровень
                    </Link>
                    <Link href="/price" className={buttonStyles({ className: "bg-white/15 text-white hover:bg-white/25" })}>
                      Все цены и пакеты
                    </Link>
                  </div>
                </div>
              </Reveal>
              <div className="grid gap-4">
                {priceCards.map((c) => (
                  <Reveal key={c.title}>
                    <article className={`card-block ${c.tone}`}>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">{c.title}</h3>
                        <span className="text-[1.25rem] font-medium tracking-[-0.01em] text-[var(--ink)]">{c.price}</span>
                      </div>
                      <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">{c.body}</p>
                    </article>
                  </Reveal>
                ))}
                <p className="text-sm leading-[1.55] text-[var(--muted-strong)]">
                  Со всех форматов можно вернуть 13% — налоговый вычет до 19 500 ₽ в год.
                </p>
              </div>
            </div>
          </section>

          {/* === КОМАНДА ==================================================== */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-sky">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div>
                  <span className="tag-pill">Команда</span>
                  <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-[2.25rem]">
                    Кто готовит к экзамену
                  </h2>
                  <p className="mt-5 text-base leading-[1.65] text-[var(--muted-strong)]">
                    Подготовку ведут преподаватели уровня HSK 4 и выше с опытом
                    подготовки к экзамену, а аудирование и устную часть отрабатывает
                    носитель путунхуа. Куратор подберёт преподавателя под целевой
                    уровень и дату.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/team" className={buttonStyles({})}>Все преподаватели</Link>
                    <Link href="/methodology" className={buttonStyles({ variant: "secondary" })}>Методика школы</Link>
                  </div>
                </div>
                <Reveal>
                  <ul className="grid gap-3">
                    {teamRows.map((t) => (
                      <li key={t.role} className="card-block bg-[var(--background-2)]">
                        <div className="text-sm font-medium text-[var(--ink)]/55">{t.role}</div>
                        <p className="mt-2 text-sm leading-[1.55] text-[var(--muted-strong)]">{t.body}</p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </section>

          {/* === SEO LONG-READ ============================================= */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-cream-soft">
              <h2 className={h2Class}>Как готовиться к HSK онлайн и не завалить экзамен</h2>
              <div className="mt-6 grid gap-3 text-base leading-[1.65] text-[var(--muted-strong)]">
                <p>
                  Главная ошибка самостоятельной подготовки — учить «язык вообще»
                  вместо экзамена. HSK проверяет конкретные навыки в конкретном
                  формате: аудирование на время, чтение с ловушками, в HSK 3 и
                  выше — письменная часть. Поэтому готовиться нужно не только по
                  лексике, но и по формату каждого раздела.
                </p>
                <p>
                  Второй типичный провал — лексика. На каждом уровне есть свой
                  банк слов (от 150 на HSK 1 до 5000 на HSK 6), и эффективнее
                  учить их по частоте встречаемости в тестах с интервальными
                  повторениями, а не подряд по учебнику. Аудирование тренируется
                  в нормальном темпе речи: на HSK 4 запись играет один раз, и к
                  этому нужно привыкнуть заранее.
                </p>
                <p>
                  Реалистичные сроки важнее обещаний. Базовый уровень HSK 1–2 —
                  это около полугода регулярных занятий; HSK 4 от старта —
                  ориентировочно полтора года при 4–6 часах в неделю. Точные
                  требования к баллу для поступления различаются по вузам и
                  программам — проверяйте их на сайте конкретного университета, а
                  мы поможем выстроить план под вашу дату и{" "}
                  <Link href="/blog/gde-sdat-hsk-v-rossii-2026" className="font-medium text-[var(--ink)] underline-offset-4 hover:underline">
                    выбрать центр сдачи
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        </>
      }
      faqs={[
        {
          question: "Сколько времени нужно на подготовку к HSK 2?",
          answer:
            "Базовый курс HSK 1–2 рассчитан примерно на полгода при двух занятиях в неделю и регулярных домашних заданиях. Это разговорная база: около 300 слов и уверенные диалоги в типовых ситуациях.",
        },
        {
          question: "Сколько времени нужно на HSK 4?",
          answer:
            "HSK 4 — это около 1200 слов и 1064 иероглифа. От старта при темпе 4–6 часов в неделю — ориентировочно полтора года. HSK 4 часто указывают как минимальный порог для поступления в университеты Китая.",
        },
        {
          question: "Где и как сдают экзамен HSK в России?",
          answer:
            "В Институтах Конфуция при вузах: Москва, Санкт-Петербург, Казань, Екатеринбург, Новосибирск, Владивосток и другие города. Регистрация идёт через официальный портал chinesetest.cn — обычно за 4–5 недель до даты экзамена.",
        },
        {
          question: "Какой проходной балл на HSK?",
          answer:
            "На HSK 1–2 — 120 из 200, на HSK 3–6 — 180 из 300. Балл по каждому разделу и итог приходят в официальном сертификате. Мы тренируем на пробниках так, чтобы вы стабильно проходили порог с запасом.",
        },
        {
          question: "Чем ваш тест на уровень отличается от настоящего HSK?",
          answer:
            "Наш онлайн-тест — диагностический инструмент школы: он построен по логике официального экзамена и помогает понять, с какого уровня начать. Настоящий международный сертификат выдают только официальные экзаменационные центры.",
        },
        {
          question: "Нужно ли сдавать HSKK (устную часть)?",
          answer:
            "HSKK — отдельный устный экзамен; нужен он или нет, зависит от требований вуза или работодателя. Если нужен — отрабатываем устную часть с носителем путунхуа: монолог, ответы на вопросы, темп речи.",
        },
        {
          question: "Что такое HSK 3.0 и новые уровни 7–9?",
          answer:
            "Классическая шкала HSK 1–6 действует и признаётся повсеместно; реформа HSK 3.0 добавляет продвинутые уровни 7–9 и усиливает устную часть. Это отдельная большая тема — на старте ориентируйтесь на уровни 1–6, а актуальные требования уточняйте под свою цель.",
        },
        {
          question: "Сколько стоит подготовка к HSK?",
          answer:
            "Мини-группа до 5 человек — 15 990 ₽, индивидуальные занятия — 17 990 ₽ за 8 занятий с преподавателем уровня HSK 4+. Есть и самостоятельное «Введение» за 4 990 ₽. Со всех форматов возвращается 13% налогового вычета.",
        },
        {
          question: "Как пройти бесплатный тест на уровень HSK?",
          answer:
            "На сайте есть бесплатное онлайн-тестирование: 25 вопросов с вариантами ответа, по результату — рекомендация уровня и курса. Тест покрывает HSK 1–4 и помогает выбрать точку старта.",
        },
      ]}
      schemaCourse={{
        slug: "hsk-preparation",
        title: "Подготовка к HSK онлайн",
        href: "/courses/hsk-preparation",
        level: "HSK 1–6",
        duration: "От 6 месяцев",
        format: "Онлайн, мини-группа или индивидуально",
        price: "от 15 990 ₽",
        priceValue: "15990",
        description:
          "Лицензированная программа подготовки к международному экзамену HSK всех уровней — от HSK 1 до HSK 6, с реальными форматами экзамена и пробными тестами.",
        audience: "Подростки 12+ и взрослые",
        outcome: "Подготовка к сертификату HSK любого уровня от 1 до 6",
        teaches: [
          "HSK 1: 150 слов, 174 иероглифа",
          "HSK 2: разговорный уровень, 300 слов",
          "HSK 3: самостоятельный пользователь",
          "HSK 4: уровень для университета (1200 слов)",
          "HSK 5–6: продвинутый уровень для магистратуры",
          "Стратегии аудирования, чтения и письма",
        ],
        prerequisites: "Для HSK 1 — не требуется. Для HSK 2+ рекомендуется бесплатный тест на уровень.",
        credentialAwarded: "Подготовка к официальному сертификату HSK любого уровня.",
        timeRequiredIso: "PT240H",
        instructorSlug: "anastasia-erina",
      }}
      ctaText="60 минут с преподавателем онлайн: определим уровень, обсудим целевой балл и дату экзамена, покажем личный кабинет и тренажёры. Без обязательств."
      related={[
        { title: "HSK 1: старт с нуля", href: "/hsk/hsk-1" },
        { title: "HSK 4: уровень для вузов Китая", href: "/hsk/hsk-4" },
        { title: "Все уровни HSK — хаб", href: "/learn/hsk" },
        { title: "Бесплатный тест на уровень HSK", href: "/chinese/hsk-test" },
        { title: "Где сдать HSK в России в 2026", href: "/blog/gde-sdat-hsk-v-rossii-2026" },
        { title: "Курс китайского для взрослых", href: "/courses/chinese-for-adults" },
      ]}
    />
  );
}
