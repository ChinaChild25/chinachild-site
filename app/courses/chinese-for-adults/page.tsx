import type { Metadata } from "next";
import Link from "next/link";
import CourseLanding from "@/components/sections/CourseLanding";
import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { INDIVIDUAL_COURSE_MODULES } from "@/lib/course-modules";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для взрослых с нуля онлайн — ChinaChild",
    description:
      "Курс китайского для взрослых с нуля: программа HSK 1–2, мини-группа от 15 990 ₽, носитель путунхуа и документы для социального налогового вычета. Бесплатный пробный урок.",
    path: "/courses/chinese-for-adults",
    keywords: [
      "китайский язык для взрослых",
      "китайский с нуля онлайн",
      "разговорный китайский онлайн",
      "курсы китайского для взрослых",
      "учить китайский взрослому",
      "китайский для начинающих взрослых",
      "HSK для взрослых",
    ],
  });
}

// ── «Что вы получаете» — 4 карточки ───────────────────────────────────────
const whyCards = [
  {
    tone: "card-violet-soft",
    eyebrow: "С нуля",
    title: "От пиньиня до простых диалогов",
    body:
      "Программа HSK 1–2: фонетика, тоны, базовые иероглифы, грамматика и говорение. Вы выходите на бытовые диалоги и чтение коротких текстов с опорой на пиньинь.",
  },
  {
    tone: "card-cream",
    eyebrow: "Честный темп",
    title: "4–6 часов в неделю",
    body:
      "1–2 живых занятия плюс 20–30 минут тренажёра в день. Мы не обещаем «китайский за месяц» — это дистанция, и мы даём ритм, который реально совместить с работой.",
  },
  {
    tone: "card-lime-soft",
    eyebrow: "Практика с носителем",
    title: "Живая речь, а не только учебник",
    body:
      "Русскоязычный методист ставит произношение и объясняет грамматику через русскую логику, а носитель путунхуа подключается для живой речи и естественных фраз.",
  },
  {
    tone: "card-sky",
    eyebrow: "Лицензия Москвы",
    title: "Налоговый вычет 13%",
    body:
      "При наличии права на социальный вычет можно вернуть до 19 500 ₽ за своё обучение. Сумма зависит от расходов, уплаченного НДФЛ и законных лимитов; документы выдаём.",
  },
];

// ── «Кому подходит» — 4 карточки ──────────────────────────────────────────
const audienceCards = [
  {
    tone: "card-violet-soft",
    badge: "«Уже поздно в 30/40/50»",
    body:
      "Возраст — не помеха: взрослые быстрее видят структуру языка и системно строят связи. Вы занимаетесь в своём темпе, без гонки с группой школьников.",
  },
  {
    tone: "card-cream-soft",
    badge: "Путешествия и переезд",
    body:
      "Готовитесь к поездке, ВНЖ или жизни в Китае: разбираем бытовые ситуации — транспорт, кафе, аптека, документы, простой разговор с местными.",
  },
  {
    tone: "card-lime-soft",
    badge: "Работа с Китаем",
    body:
      "Общаетесь с поставщиками или партнёрами: база HSK 1–2 плюс лексика под ваши задачи. Для команд есть отдельный корпоративный формат.",
  },
  {
    tone: "card-sky-soft",
    badge: "Кому не подойдёт",
    body:
      "Если ищете «выучить китайский за 30 дней» — это не к нам. HSK 1–2 — это около полугода регулярных занятий, зато без откатов и брошенных на полпути тонов.",
  },
];

// ── Блок №3: страхи vs реальность ─────────────────────────────────────────
const fears = [
  {
    tone: "card-violet-soft",
    fear: "«Тоны невозможно поставить»",
    reality:
      "Тоны — это не музыкальный слух, а повторяемые паттерны. AI-тренажёр в личном кабинете слушает вашу запись, показывает, на каком слоге сбивается тон, и подбирает упражнение под конкретную ошибку.",
  },
  {
    tone: "card-lime-soft",
    fear: "«Иероглифы нереально запомнить»",
    reality:
      "Это не зубрёжка, а интервальные повторения. Для HSK 1 нужно около 150 иероглифов — их учат через ассоциации и порядок черт, по 3–5 знаков за урок, с возвратами в тренажёре.",
  },
  {
    tone: "card-sky",
    fear: "«Нет времени»",
    reality:
      "Нужно 4–6 часов в неделю: 1–2 занятия плюс короткий тренажёр в день. Расписание подстраивается под рабочую неделю, а уроки записываются — пропустили, посмотрели позже.",
  },
];

const milestonePhrases = [
  {
    hanzi: "你好，我叫……",
    pinyin: "Nǐ hǎo, wǒ jiào……",
    ru: "«Здравствуйте, меня зовут…» — знакомство с первых уроков.",
  },
  {
    hanzi: "我想买一张去北京的火车票。",
    pinyin: "Wǒ xiǎng mǎi yì zhāng qù Běijīng de huǒchē piào.",
    ru: "«Хочу купить билет на поезд до Пекина» — бытовые ситуации HSK 1–2.",
  },
  {
    hanzi: "这个菜很好吃，但是有点儿辣。",
    pinyin: "Zhège cài hěn hǎochī, dànshì yǒudiǎnr là.",
    ru: "«Очень вкусно, но немного остро» — поддержать диалог на HSK 2.",
  },
];

// ── Как устроены занятия — 4 шага ─────────────────────────────────────────
const processSteps = [
  {
    step: "01",
    title: "Заявка и звонок куратора",
    body:
      "Оставляете заявку — ежедневно с 09:00 до 21:00 МСК обычно отвечаем в течение 1–2 часов. Уточняем цель, уровень и удобное время. Никаких автосписаний и подписок.",
  },
  {
    step: "02",
    title: "Бесплатный пробный урок",
    body:
      "60 минут с преподавателем онлайн. Проверяем фонетику и базу, показываем личный кабинет и тренажёр. Решение продолжать — после урока, без давления.",
  },
  {
    step: "03",
    title: "Подбор формата и преподавателя",
    body:
      "Выбираем мини-группу до 5 человек или индивидуальные занятия, согласуем расписание и подписываем договор. После оплаты — доступ ко всем материалам платформы.",
  },
  {
    step: "04",
    title: "Занятия и практика между ними",
    body:
      "Говорим, читаем, разбираем грамматику и иероглифы. Между уроками — AI-разбор тонов и словарный тренажёр. Каждые 4 занятия — короткий чек-пойнт прогресса.",
  },
];

// ── Форматы и цена ────────────────────────────────────────────────────────
const priceCards = [
  {
    tone: "card-violet-soft",
    title: "Самостоятельно «Введение»",
    price: "4 990 ₽",
    body:
      "80 уроков для самостоятельного прохождения: диалоги носителей, интересные факты о Китае и тест после каждого раздела.",
  },
  {
    tone: "card-cream-soft",
    title: "Мини-группа до 5",
    price: "15 990 ₽",
    body:
      "8 занятий с преподавателем в небольшой группе — как с репетитором, но дешевле. Записи уроков, закрытый чат и сопровождение куратора.",
  },
  {
    tone: "card-lime-soft",
    title: "Индивидуально",
    price: "от 17 990 ₽",
    body:
      "Модуль на месяц: 8 занятий один на один по 60 минут. После него можно продолжить обучение, отдельно оплатив следующий модуль; автоматического списания нет.",
  },
];

// ── Команда ───────────────────────────────────────────────────────────────
const teamRows = [
  {
    role: "Русскоязычный методист",
    body:
      "Анастасия Пономарёва ведёт старт с нуля и подготовку к HSK 1–2. Училась в Даляньском университете иностранных языков и Южно-Китайском педагогическом университете.",
  },
  {
    role: "Носитель путунхуа",
    body:
      "Чжао Ли живёт в Китае и даёт живую речь, естественные фразы и культурный контекст — то, к чему не привыкнуть по учебнику.",
  },
  {
    role: "AI-помощник в кабинете",
    body:
      "Не заменяет преподавателя — держит ритм между уроками: слушает произношение, напоминает слабые слова и поднимает нужные задания в тренажёре.",
  },
];

const h2Class =
  "text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl";
const leadClass = "mt-4 text-base leading-[1.65] text-[var(--muted-strong)]";

export default function ChineseForAdultsPage() {
  return (
    <CourseLanding
      breadcrumb={{ name: "Китайский для взрослых", path: "/courses/chinese-for-adults" }}
      pageHero={{
        variant: "violet",
        eyebrow: "Взрослым без подготовки",
        title: "Китайский язык для взрослых онлайн с нуля",
        description:
          "С первых тонов до простого разговора по лицензированной программе HSK 1–2 — для тех, кто никогда не открывал учебник китайского. Мини-группы до 5 человек, носитель путунхуа и собственная платформа без Zoom.",
      }}
      sections={
        <>
          {/* === ЧТО ВЫ ПОЛУЧАЕТЕ ============================================ */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Что вы получаете</span>
              <h2 className={`mt-4 ${h2Class}`}>
                Что даёт курс китайского для взрослых с нуля
              </h2>
              <p className={leadClass}>
                Лицензированная программа HSK 1–2 ведёт вас от первого тона до
                простого разговора. Базы не нужно — мы начинаем с пиньиня и
                объясняем китайский через привычную русскую логику, а не через
                перевод бесконечных текстов.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {whyCards.map((card) => (
                <Reveal key={card.title}>
                  <article className={`card-block h-full ${card.tone}`}>
                    <div className="text-sm font-medium text-[var(--ink)]/55">
                      {card.eyebrow}
                    </div>
                    <h3 className="mt-4 text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                      {card.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === КОМУ ПОДХОДИТ =============================================== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Кому подходит</span>
              <h2 className={`mt-4 ${h2Class}`}>
                Кому подходит курс — и кому он не подойдёт
              </h2>
              <p className={leadClass}>
                Курс рассчитан на взрослых без подготовки. Преподаватель и темп
                подбираются под вашу цель — поэтому честно скажем и о том, кому
                лучше выбрать другой формат.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {audienceCards.map((card) => (
                <Reveal key={card.badge}>
                  <article className={`card-block h-full ${card.tone}`}>
                    <div className="tag-pill">{card.badge}</div>
                    <p className="mt-4 text-sm leading-[1.6] text-[var(--muted-strong)]">
                      {card.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === БЛОК №3: СТРАХИ vs РЕАЛЬНОСТЬ + ФРАЗЫ ====================== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Страхи и реальность</span>
              <h2 className={`mt-4 ${h2Class}`}>
                Три страха новичка — и как на самом деле
              </h2>
              <p className={leadClass}>
                Большинство взрослых бросают китайский не из-за сложности языка,
                а из-за трёх мифов. Разберём каждый честно.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {fears.map((f) => (
                <Reveal key={f.fear}>
                  <article className={`card-block h-full ${f.tone}`}>
                    <div className="text-sm font-medium text-[var(--ink)]/55">
                      Страх
                    </div>
                    <h3 className="mt-2 text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">
                      {f.fear}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                      <span className="font-medium text-[var(--ink)]">
                        На самом деле:{" "}
                      </span>
                      {f.reality}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="mt-5 card-block card-block-lg card-cream-soft">
                <h3 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[var(--ink)]">
                  Что вы уже произносите на первых уровнях
                </h3>
                <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                  Это реальные фразы из программы HSK 1–2 — говорить вы начинаете
                  с первого занятия, а не «когда выучите всю грамматику».
                </p>
                <ul className="mt-6 grid gap-4 md:grid-cols-3">
                  {milestonePhrases.map((p) => (
                    <li key={p.hanzi} className="card-block bg-[var(--background-2)]">
                      <div className="text-[1.375rem] leading-[1.3] text-[var(--ink)]">
                        {p.hanzi}
                      </div>
                      <div className="mt-2 text-sm text-[var(--ink)]/55">
                        {p.pinyin}
                      </div>
                      <p className="mt-3 text-sm leading-[1.55] text-[var(--muted-strong)]">
                        {p.ru}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </section>

          {/* === КАК ПРОХОДИТ ОБУЧЕНИЕ ====================================== */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-cream-soft">
              <div className="max-w-3xl">
                <span className="tag-pill">Как проходит обучение</span>
                <h2 className={`mt-4 ${h2Class}`}>Как устроены занятия</h2>
                <p className={leadClass}>
                  От заявки до первого урока обычно проходит 2–3 рабочих дня.
                  Всё онлайн — в браузере, без установки Zoom; записи уроков
                  и тренажёры хранятся в личном кабинете.
                </p>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {processSteps.map((s) => (
                  <Reveal key={s.step}>
                    <article className="card-block repetitor-process-step-card h-full">
                      <div className="text-2xl font-medium tracking-[-0.01em] text-[var(--ink)]">
                        {s.step}
                      </div>
                      <h3 className="mt-3 text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                        {s.body}
                      </p>
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
                    Программа одна — отличается формат и темп. Мини-группа
                    дешевле и даёт живой диалог с одногруппниками; индивидуально —
                    это ваш темп и расписание под рабочий график. Стоимость
                    закрепляется в договоре до старта курса.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/compare/mini-group-vs-individual"
                      className={buttonStyles({ variant: "secondary" })}
                    >
                      Сравнить форматы
                    </Link>
                    <Link
                      href="/price"
                      className={buttonStyles({
                        className: "bg-white/15 text-white hover:bg-white/25",
                      })}
                    >
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
                        <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">
                          {c.title}
                        </h3>
                        <span className="text-[1.25rem] font-medium tracking-[-0.01em] text-[var(--ink)]">
                          {c.price}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                        {c.body}
                      </p>
                    </article>
                  </Reveal>
                ))}
                <p className="text-sm leading-[1.55] text-[var(--muted-strong)]">
                  При наличии права на социальный вычет можно вернуть до 19 500 ₽
                  за своё обучение. Фактическая сумма зависит от расходов,
                  уплаченного НДФЛ и законных лимитов; помогаем с документами.
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
                    Кто будет вас учить
                  </h2>
                  <p className="mt-5 text-base leading-[1.65] text-[var(--muted-strong)]">
                    Русскоязычные методисты ставят фонетику и объясняют грамматику
                    через русский язык, а носитель путунхуа даёт живую речь.
                    Куратор подберёт преподавателя под вашу цель и характер — если
                    не сложится, поменяем без вопросов.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/team" className={buttonStyles({})}>
                      Все преподаватели
                    </Link>
                    <Link
                      href="/methodology"
                      className={buttonStyles({ variant: "secondary" })}
                    >
                      Методика школы
                    </Link>
                  </div>
                </div>
                <Reveal>
                  <ul className="grid gap-3">
                    {teamRows.map((t) => (
                      <li key={t.role} className="card-block bg-[var(--background-2)]">
                        <div className="text-sm font-medium text-[var(--ink)]/55">
                          {t.role}
                        </div>
                        <p className="mt-2 text-sm leading-[1.55] text-[var(--muted-strong)]">
                          {t.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </section>

          {/* === SEO LONG-READ (под конверсионными блоками) ================ */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-cream-soft">
              <h2 className={h2Class}>Как взрослому выучить китайский с нуля</h2>
              <div className="mt-6 grid gap-3 text-base leading-[1.65] text-[var(--muted-strong)]">
                <p>
                  Главный барьер для взрослого — не сам язык, а отсутствие
                  системы. Китайский кажется хаотичным набором знаков, пока нет
                  понятного маршрута. Программа HSK 1–2 как раз и есть такой
                  маршрут: сначала фонетика и тоны, затем пиньинь и базовые
                  иероглифы, потом грамматика и говорение. Каждый шаг опирается на
                  предыдущий — вы не учите «куда-то в темноту», а на каждом этапе
                  видите, что уже умеете и сколько осталось до следующего уровня.
                </p>
                <p>
                  Онлайн-формат для китайского работает не хуже офлайна, а часто
                  удобнее: занятия идут в браузере без Zoom, уроки записываются, а
                  произношение можно отрабатывать в AI-тренажёре в любое время.
                  Взрослому это критично — не нужно ехать через весь город после
                  работы, можно догнать пропущенное занятие по записи и заниматься
                  с телефона, планшета или ноутбука.
                </p>
                <p>
                  Реалистичный расчёт времени важнее красивых обещаний. При 4–6
                  часах занятий в неделю программа HSK 1–2 проходится примерно за
                  полгода — это разговорная база: представиться, спросить дорогу,
                  заказать еду, написать простое сообщение партнёру или знакомому.
                  Дальше можно продолжить обучение на платформе вплоть до HSK 6
                  или сделать паузу и вернуться позже. Мы намеренно не обещаем
                  «китайский за месяц»: устойчивый результат даёт регулярность, а
                  не интенсивный рывок с последующим откатом и брошенными тонами.
                </p>
                <p>
                  Если сомневаетесь, с чего начать, пройдите{" "}
                  <Link
                    href="/chinese/hsk-test"
                    className="font-medium text-[var(--ink)] underline-offset-4 hover:underline"
                  >
                    бесплатный тест на уровень HSK
                  </Link>{" "}
                  или запишитесь на пробное занятие — преподаватель оценит
                  фонетику и поможет выбрать формат: мини-группу или{" "}
                  <Link
                    href="/repetitor-kitayskogo"
                    className="font-medium text-[var(--ink)] underline-offset-4 hover:underline"
                  >
                    индивидуальные занятия с репетитором
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
          question: "С какого уровня можно начать?",
          answer:
            "С нуля. Если вы никогда раньше не учили китайский — мы берём вас на старт программы HSK 1. Если база уже есть, пройдите бесплатный тест на уровень HSK на сайте, и преподаватель уточнит точку входа на пробном занятии.",
        },
        {
          question: "Сколько часов в неделю реально нужно?",
          answer:
            "4–6 часов: 1–2 живых занятия по 60 минут плюс 20–30 минут самостоятельной работы в тренажёре каждый день. Это базовый темп, при котором программа HSK 1–2 проходится примерно за полгода.",
        },
        {
          question: "Не поздно ли начинать в 40 или 50 лет?",
          answer:
            "Нет. Взрослые быстрее видят структуру языка и системно строят связи между правилами. Вы занимаетесь в своём темпе, без сравнения с группой школьников, а произношение ставится через микрофон с AI-разбором.",
        },
        {
          question: "Сложно ли поставить тоны?",
          answer:
            "Тоны — это не музыкальный слух, а повторяемые паттерны. AI-тренажёр в личном кабинете слушает запись и показывает, на каком слоге сбивается тон, и подбирает упражнение под конкретную ошибку.",
        },
        {
          question: "Нужно ли учить тысячи иероглифов наизусть?",
          answer:
            "Нет. Для HSK 1 нужно около 150 иероглифов, для HSK 2 — около 350. Их учат не зубрёжкой, а через ассоциации, порядок черт и интервальные повторения в тренажёре — по 3–5 знаков за урок.",
        },
        {
          question: "Сколько стоит курс и можно ли вернуть часть денег?",
          answer:
            "Самостоятельное «Введение» — 4 990 ₽ за 80 уроков, мини-группа — 15 990 ₽. Индивидуальный модуль — от 17 990 ₽ за один месяц: 8 занятий по 60 минут. После него можно продолжить обучение, отдельно оплатив следующий модуль. Это не подписка и не рассрочка; автоматического списания и обязательной покупки следующих модулей нет. При наличии права на вычет можно вернуть до 19 500 ₽ за своё обучение.",
        },
        {
          question: "Можно ли учиться с телефона?",
          answer:
            "Да. Личный кабинет полностью адаптирован под мобильное устройство: лекции, тесты, тренажёры и видеозаписи занятий доступны с телефона, планшета или ноутбука.",
        },
        {
          question: "Что будет после курса HSK 2?",
          answer:
            "Можно продолжить обучение на платформе вплоть до HSK 6 — со сложными заданиями, интенсивной практикой и сопровождением кураторов, либо взять паузу и вернуться, когда понадобится следующий уровень.",
        },
        {
          question: "Как пройти бесплатный тест на уровень?",
          answer:
            "На сайте есть бесплатное онлайн-тестирование: 25 вопросов с вариантами ответа, по результату — рекомендация курса. Тест покрывает уровни HSK 1–4 и помогает понять, с чего начать.",
        },
      ]}
      schemaCourse={{
        slug: "chinese-for-adults",
        title: "Китайский язык для взрослых онлайн",
        href: "/courses/chinese-for-adults",
        level: "HSK 1–2",
        duration: "6 месяцев",
        format: "Мини-группа или индивидуально",
        price: "от 4 990 ₽",
        priceValue: "4990",
        description:
          "Лицензированный курс китайского языка для взрослых без подготовки. Разговорный уровень и подготовка к сертификату HSK 2 по программе на 6 месяцев.",
        audience: "Взрослые с нуля",
        outcome: "Разговорный уровень и подготовка к HSK 2",
        teaches: [
          "Произношение и тоны путунхуа",
          "Пиньинь и базовые иероглифы",
          "Грамматика HSK 1–2",
          "Аудирование и чтение коротких текстов",
          "Разговорные сценарии бытового общения",
        ],
        prerequisites: "Не требуется. Курс рассчитан на старт с нуля.",
        credentialAwarded:
          "Документ о прохождении программы дополнительного профессионального образования. Подготовка к сертификату HSK 2.",
        timeRequiredIso: "PT80H",
        instructorSlug: "anastasia-ponomareva",
      }}
      individualModule={INDIVIDUAL_COURSE_MODULES.adults}
      ctaText="60 минут с преподавателем онлайн: проверим фонетику, обсудим цель и покажем личный кабинет. Никаких автосписаний и подписок — продолжать или нет, решаете вы."
      related={[
        { title: "Подготовка к HSK 1–6", href: "/courses/hsk-preparation" },
        { title: "Онлайн-курсы китайского", href: "/courses/online-chinese" },
        { title: "Репетитор китайского 1 на 1", href: "/repetitor-kitayskogo" },
        { title: "Мини-группа или индивидуально", href: "/compare/mini-group-vs-individual" },
        { title: "Бесплатный тест на уровень HSK", href: "/chinese/hsk-test" },
        { title: "Сколько времени учить китайский", href: "/blog/how-long-to-learn-chinese" },
      ]}
    />
  );
}
