import type { Metadata } from "next";
import Link from "next/link";
import CourseLanding from "@/components/sections/CourseLanding";
import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { INDIVIDUAL_COURSE_MODULES } from "@/lib/course-modules";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для школьников 12+ онлайн — ChinaChild",
    description:
      "Курс китайского для школьников строго с 12 лет: индивидуальный модуль 17 990 ₽ за месяц, 8 занятий по 60 минут, и мини-группы. Налоговый вычет для родителя.",
    path: "/courses/chinese-for-kids",
    keywords: [
      "китайский язык для детей",
      "китайский для школьников",
      "китайский с 12 лет",
      "китайский для детей онлайн",
      "китайский для подростков",
      "ОГЭ китайский язык",
      "ЕГЭ китайский язык",
    ],
  });
}

// ── Что получает школьник ─────────────────────────────────────────────────
const whyCards = [
  {
    tone: "card-violet-soft",
    eyebrow: "Программа HSK 1–2",
    title: "С 12 лет, без зубрёжки",
    body:
      "Фонетика, тоны, базовые иероглифы и живые диалоги. Подросток выходит на разговорный уровень и готовится к сертификату HSK 1–2.",
  },
  {
    tone: "card-cream",
    eyebrow: "Под школьную нагрузку",
    title: "Индивидуально или мини-группа",
    body:
      "Расписание подстраивается под школу, кружки и часовой пояс. Индивидуально — свой темп; мини-группа до 5 — живой диалог и дешевле.",
  },
  {
    tone: "card-lime-soft",
    eyebrow: "Помесячный модуль",
    title: "17 990 ₽ за 8 занятий",
    body:
      "8 индивидуальных занятий по 60 минут за один месяц. После модуля можно продолжить обучение, отдельно оплатив следующий; автоматического списания и обязательной покупки нет.",
  },
  {
    tone: "card-sky",
    eyebrow: "Для родителя",
    title: "Налоговый вычет 13%",
    body:
      "При наличии права можно вернуть до 14 300 ₽ за обучение ребёнка. Лимит общий для обоих родителей, а сумма зависит от расходов и уплаченного НДФЛ; документы выдаём.",
  },
];

// ── Почему именно 12+ ─────────────────────────────────────────────────────
const ageCards = [
  {
    tone: "card-violet-soft",
    badge: "Гибкая память и дисциплина",
    body:
      "В 12–17 лет мозг быстрее ставит тоны и запоминает иероглифы, чем у взрослых, а учебной дисциплины уже хватает для регулярных занятий.",
  },
  {
    tone: "card-cream-soft",
    badge: "Мотивация подростка",
    body:
      "Контекст уроков — то, что подростку интересно: китайский интернет, музыка, игры, дунхуа. Не «животные и цвета», как в курсах для малышей.",
  },
  {
    tone: "card-lime-soft",
    badge: "Второй иностранный и аттестат",
    body:
      "Китайский можно сдавать как второй иностранный на ОГЭ и ЕГЭ. Старт в школе даёт фору: к экзамену ребёнок приходит с реальной базой.",
  },
  {
    tone: "card-sky-soft",
    badge: "Путь к вузам КНР",
    body:
      "Ранний старт — это к 11 классу уровень для поступления и сертификат HSK, который смотрят университеты Китая и программы с грантами.",
  },
];

// ── Блок №3: дорожная карта класс → уровень → экзамен ─────────────────────
const roadmap = [
  { stage: "Старт (5–7 класс)", goal: "Пиньинь, 4 тона, базовые фразы о себе и семье", hsk: "Движение к HSK 1" },
  { stage: "7–8 класс", goal: "Бытовые диалоги, чтение коротких текстов, 150–300 слов", hsk: "HSK 1–2" },
  { stage: "9 класс · ОГЭ", goal: "Уверенная база, аудирование, простая письменная речь", hsk: "Ориентировочно между HSK 2 и 3" },
  { stage: "10–11 класс · ЕГЭ", goal: "Развёрнутые темы, связные тексты, аргументация", hsk: "Ориентировочно HSK 3–4" },
];

// ── Как проходит занятие ──────────────────────────────────────────────────
const processSteps = [
  { step: "01", title: "Заявка и звонок", body: "Ежедневно с 09:00 до 21:00 МСК обычно отвечаем в течение 1–2 часов, уточняем возраст, цель и удобное время. Никаких автосписаний и подписок." },
  { step: "02", title: "Бесплатный пробный урок", body: "60 минут онлайн: преподаватель оценивает уровень ребёнка и показывает личный кабинет — родитель видит, как устроено обучение." },
  { step: "03", title: "Преподаватель и расписание", body: "Подбираем преподавателя под возраст и характер, согласуем расписание вокруг школы и кружков, подписываем договор." },
  { step: "04", title: "Занятия и прогресс", body: "Уроки + короткая интересная домашка, которую хочется обсудить. Отчёт о прогрессе раз в 4 занятия — родитель в курсе." },
];

// ── Форматы и цена ────────────────────────────────────────────────────────
const priceCards = [
  { tone: "card-cream-soft", title: "Индивидуально для школьника", price: "17 990 ₽", note: "1 месяц · 8 занятий по 60 минут", body: "Один на один с преподавателем. После модуля можно продолжить обучение, отдельно оплатив следующий; автоматического списания нет." },
  { tone: "card-lime-soft", title: "Мини-группа до 5", price: "15 990 ₽", note: "8 занятий", body: "Живой диалог со сверстниками и поддержка группы — как с репетитором, но дешевле." },
];

// ── Команда ───────────────────────────────────────────────────────────────
const teamRows = [
  { role: "Преподаватель для школьников", body: "Милена-Мария Карлова работает со школьниками, автор детских учебных пособий и самоучителей, преподаёт 13 лет, сертификат HSK 4." },
  { role: "Старт с нуля", body: "Анастасия Пономарёва спокойно проводит через первые тревожные недели — пиньинь, тоны, первые иероглифы и страх сказать фразу вслух." },
  { role: "AI-помощник в кабинете", body: "Держит ритм между уроками: слушает произношение, напоминает слабые слова и поднимает задания в тренажёре. Родитель видит прогресс в кабинете." },
];

const h2Class =
  "text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl";
const leadClass = "mt-4 text-base leading-[1.65] text-[var(--muted-strong)]";

export default function ChineseForKidsPage() {
  return (
    <CourseLanding
      breadcrumb={{ name: "Китайский для детей", path: "/courses/chinese-for-kids" }}
      pageHero={{
        variant: "violet",
        eyebrow: "Школьники 12+",
        title: "Курс китайского языка для детей онлайн",
        description:
          "Индивидуально или в мини-группе по программе HSK 1–2 для школьников с 12 лет. Разговорный уровень примерно за полгода — без зубрёжки, с живой практикой и расписанием под школьную нагрузку.",
      }}
      sections={
        <>
          {/* === ЧТО ПОЛУЧАЕТ ШКОЛЬНИК ====================================== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Что получает школьник</span>
              <h2 className={`mt-4 ${h2Class}`}>Курс китайского для школьников с 12 лет</h2>
              <p className={leadClass}>
                Это не упрощённая программа, а полноценный лицензированный маршрут
                HSK 1–2 для подростков. Мы работаем с 12 лет: уже хватает учебной
                дисциплины, а память ещё гибкая для тонов и иероглифов.
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

          {/* === ПОЧЕМУ 12+ ================================================= */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Почему именно 12+</span>
              <h2 className={`mt-4 ${h2Class}`}>Почему мы учим подростков, а не дошкольников</h2>
              <p className={leadClass}>
                Это отдельный трек для подростков 12–17 лет — с мотивацией и
                целями их возраста, а не общий «детский китайский» с песнями и
                карточками.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {ageCards.map((card) => (
                <Reveal key={card.badge}>
                  <article className={`card-block h-full ${card.tone}`}>
                    <div className="tag-pill">{card.badge}</div>
                    <p className="mt-4 text-sm leading-[1.6] text-[var(--muted-strong)]">{card.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === БЛОК №3: ДОРОЖНАЯ КАРТА ==================================== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Дорожная карта</span>
              <h2 className={`mt-4 ${h2Class}`}>Класс, уровень и подготовка к ОГЭ/ЕГЭ</h2>
              <p className={leadClass}>
                Ориентир для родителя: с какого класса начать и к какому уровню
                подойти к экзаменам. Сроки приблизительные — зависят от старта и
                регулярности занятий.
              </p>
            </div>
            <Reveal>
              <div className="mt-8 card-block card-block-lg card-cream-soft">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm md:text-base">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.12)]">
                        <th className="py-4 pr-4 font-semibold text-[var(--ink)]">Класс / этап</th>
                        <th className="py-4 pr-4 font-semibold text-[var(--ink)]">Что умеет ребёнок</th>
                        <th className="py-4 font-semibold text-[var(--ink)]">Ориентир по HSK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roadmap.map((r) => (
                        <tr key={r.stage} className="border-b border-[rgba(0,0,0,0.06)]">
                          <td className="py-4 pr-4 font-medium text-[var(--ink)]">{r.stage}</td>
                          <td className="py-4 pr-4 text-[var(--muted-strong)]">{r.goal}</td>
                          <td className="py-4 text-[var(--muted-strong)]">{r.hsk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-5 text-sm leading-[1.55] text-[var(--ink)]/55">
                  Важно: ОГЭ и ЕГЭ по китайскому проводятся по кодификатору ФИПИ и
                  имеют собственную структуру. Соответствие уровням HSK здесь —
                  наш ориентир для планирования, а не официальная шкала.
                </p>
              </div>
            </Reveal>
          </section>

          {/* === КАК ПРОХОДИТ ЗАНЯТИЕ ======================================= */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-cream-soft">
              <div className="max-w-3xl">
                <span className="tag-pill">Как проходит обучение</span>
                <h2 className={`mt-4 ${h2Class}`}>Как устроены занятия для школьника</h2>
                <p className={leadClass}>
                  Всё онлайн — в браузере, без установки Zoom. Записи уроков и
                  тренажёры хранятся в кабинете, поэтому родитель всегда видит, что
                  происходит на занятиях.
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
                    Индивидуально или в мини-группе
                  </h2>
                  <p className="mt-5 text-base leading-7 text-white/85">
                    Индивидуально удобнее под плотный школьный график — не нужно
                    подстраиваться под чужое расписание. Мини-группа дешевле и
                    добавляет живой диалог со сверстниками. Цена закрепляется в
                    договоре до старта.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/compare/mini-group-vs-individual" className={buttonStyles({ variant: "secondary" })}>
                      Сравнить форматы
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
                      <div className="mt-1 text-sm text-[var(--ink)]/55">{c.note}</div>
                      <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">{c.body}</p>
                    </article>
                  </Reveal>
                ))}
                <p className="text-sm leading-[1.55] text-[var(--muted-strong)]">
                  При наличии права родитель может вернуть до 14 300 ₽ за обучение
                  ребёнка. Лимит общий для обоих родителей, а фактическая сумма
                  зависит от расходов и уплаченного НДФЛ. Помогаем с документами.
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
                    Кто будет учить ребёнка
                  </h2>
                  <p className="mt-5 text-base leading-[1.65] text-[var(--muted-strong)]">
                    Со школьниками работает преподаватель с опытом детских и
                    подростковых групп и автор учебных пособий. Куратор подберёт
                    преподавателя под возраст и характер ребёнка — если не
                    сложится, поменяем без вопросов.
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
              <h2 className={h2Class}>Зачем подростку китайский и с чего начать</h2>
              <div className="mt-6 grid gap-3 text-base leading-[1.65] text-[var(--muted-strong)]">
                <p>
                  Китайский для школьника — это не только «второй иностранный для
                  галочки». Это навык, который реально пригодится: китайский можно
                  сдавать на ОГЭ и ЕГЭ, с ним проще поступать на программы с КНР и
                  претендовать на гранты, а сам подросток получает доступ к
                  огромному пласту культуры — от музыки и игр до дунхуа.
                </p>
                <p>
                  Возраст 12+ выбран не случайно. В этом возрасте у ребёнка уже
                  достаточно учебной дисциплины, чтобы заниматься регулярно, и
                  одновременно сохраняется гибкость памяти, которая помогает
                  ставить тоны и запоминать иероглифы быстрее, чем у взрослых.
                  Поэтому мы ведём подростков отдельным треком, а не вместе с
                  дошкольниками.
                </p>
                <p>
                  Начать стоит с бесплатного пробного урока: преподаватель оценит
                  уровень и покажет, как устроены занятия и личный кабинет. Дальше
                  программа HSK 1–2 ведёт от пиньиня и тонов к разговорной базе
                  примерно за полгода регулярных занятий, а родитель видит прогресс
                  в кабинете и получает отчёт каждые несколько уроков. Если
                  сомневаетесь в уровне — начните с{" "}
                  <Link href="/chinese/hsk-test" className="font-medium text-[var(--ink)] underline-offset-4 hover:underline">
                    бесплатного теста на уровень HSK
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
          question: "С какого возраста и класса подходит курс?",
          answer:
            "С 12 лет — это минимальный возраст, при котором у ребёнка достаточно учебной дисциплины для регулярных занятий и при этом сохраняется гибкость памяти для постановки тонов и иероглифов. Начинать можно с любого класса начиная с 5–6.",
        },
        {
          question: "Сколько стоит детский курс китайского?",
          answer:
            "Индивидуальный модуль для школьника 12+ стоит 17 990 ₽ за один месяц: 8 занятий по 60 минут. После него можно продолжить обучение, отдельно оплатив следующий модуль. Это не подписка и не рассрочка; автоматического списания и обязательной покупки следующих модулей нет. Мини-группа до 5 человек — 15 990 ₽ за 8 занятий.",
        },
        {
          question: "Как проходят занятия и видит ли родитель прогресс?",
          answer:
            "Занятия идут онлайн в браузере, без установки Zoom. Все лекции, тесты и видеозаписи сохраняются в личном кабинете, а раз в 4 урока родитель получает отчёт о прогрессе — что освоено и над чем работаем.",
        },
        {
          question: "Есть ли домашнее задание?",
          answer:
            "Да, но оно короткое и связано с темой урока. Мы стараемся, чтобы домашняя работа была интересной и её хотелось обсудить на следующем занятии, а не превращалась в стопку текстов.",
        },
        {
          question: "Можно ли вернуть налоговый вычет за ребёнка?",
          answer:
            "При наличии права на социальный вычет можно вернуть до 14 300 ₽ за обучение каждого ребёнка. Лимит расходов 110 000 ₽ на ребёнка общий для обоих родителей; фактический возврат зависит от расходов и уплаченного НДФЛ. Документы выдаём.",
        },
        {
          question: "Подойдёт ли курс для подготовки к ОГЭ или ЕГЭ по китайскому?",
          answer:
            "Курс даёт прочную языковую базу HSK 1–2 и дальше — уровень, ориентировочно соответствующий требованиям ОГЭ и ЕГЭ. При этом сами экзамены проводятся по кодификатору ФИПИ со своей структурой: мы выстраиваем программу под эту цель, а соответствие HSK используем как ориентир для планирования.",
        },
        {
          question: "Нужен ли подростку преподаватель-носитель?",
          answer:
            "На старте важнее русскоязычный методист: он ставит фонетику и объясняет грамматику понятным языком. Носитель путунхуа подключается позже — для живой речи и разговорной практики, когда у ребёнка есть база.",
        },
        {
          question: "Можно ли начать с полного нуля?",
          answer:
            "Да, большинство школьников приходят без подготовки. Преподаватель начинает с пиньиня и тонов, постепенно вводит иероглифы и доводит ребёнка до разговорного уровня HSK 1–2.",
        },
      ]}
      schemaCourse={{
        slug: "chinese-for-kids",
        title: "Китайский язык для школьников 12+ онлайн",
        href: "/courses/chinese-for-kids",
        level: "HSK 1–2",
        duration: "От 1 месяца",
        format: "Индивидуально или мини-группа",
        price: "от 15 990 ₽",
        priceValue: "15990",
        description:
          "Лицензированный курс китайского языка для школьников с 12 лет. Программа HSK 1–2, разговорный уровень примерно за полгода, подготовка к ОГЭ/ЕГЭ.",
        audience: "Школьники 12+",
        outcome: "Разговорный уровень и подготовка к сертификату HSK 1–2",
        teaches: [
          "Постановка тонов и произношения",
          "Иероглифика и пиньинь",
          "Базовая грамматика и диалоги",
          "Подготовка к ОГЭ и ЕГЭ по китайскому",
          "Подготовка к HSK 1–2",
        ],
        prerequisites: "Возраст от 12 лет. Предварительная подготовка не требуется.",
        credentialAwarded: "Подготовка к сертификату HSK 1 и HSK 2.",
        timeRequiredIso: "PT60H",
        instructorSlug: "milena-karlova",
      }}
      individualModule={INDIVIDUAL_COURSE_MODULES.kids}
      ctaText="60 минут онлайн: преподаватель оценит уровень ребёнка, покажет личный кабинет и формат занятий. Решение продолжать — за вами, без давления и автосписаний."
      related={[
        { title: "Подготовка к HSK 1–6", href: "/courses/hsk-preparation" },
        { title: "Онлайн-курсы китайского", href: "/courses/online-chinese" },
        { title: "Репетитор китайского 1 на 1", href: "/repetitor-kitayskogo" },
        { title: "Мини-группа или индивидуально", href: "/compare/mini-group-vs-individual" },
        { title: "Бесплатный тест на уровень HSK", href: "/chinese/hsk-test" },
        { title: "Как учить китайский с нуля", href: "/blog/how-to-learn-chinese-from-scratch" },
      ]}
    />
  );
}
