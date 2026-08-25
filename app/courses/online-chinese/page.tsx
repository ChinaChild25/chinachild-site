import type { Metadata } from "next";
import Link from "next/link";
import CourseLanding from "@/components/sections/CourseLanding";
import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Онлайн-курсы китайского языка — школа ChinaChild",
    description:
      "Онлайн-курсы китайского: мини-группы до 5 от 15 990 ₽, индивидуально и самостоятельно, носитель и русскоязычные преподаватели. Лицензия Москвы и документы для социального налогового вычета.",
    path: "/courses/online-chinese",
    keywords: [
      "онлайн курсы китайского",
      "курсы китайского языка онлайн",
      "китайский онлайн",
      "учить китайский онлайн",
      "школа китайского онлайн",
      "обучение китайскому языку онлайн",
    ],
  });
}

// ── Почему онлайн работает ────────────────────────────────────────────────
const whyCards = [
  {
    tone: "card-violet-soft",
    eyebrow: "Без Zoom",
    title: "Занятия в браузере",
    body:
      "Уроки идут прямо в личном кабинете — ничего не нужно устанавливать. Видео, чат и расписание в одном окне.",
  },
  {
    tone: "card-cream",
    eyebrow: "Ничего не теряется",
    title: "Записи всех уроков",
    body:
      "Пропустили занятие — посмотрели запись позже. К сложной теме можно вернуться в любой момент, материалы остаются в кабинете.",
  },
  {
    tone: "card-lime-soft",
    eyebrow: "Практика 24/7",
    title: "AI-тренажёр и словарь",
    body:
      "Между уроками — разбор тонов по записи вашего голоса и интервальные повторения лексики. Тренируетесь тогда, когда удобно.",
  },
  {
    tone: "card-sky",
    eyebrow: "Лицензия Москвы",
    title: "Налоговый вычет 13%",
    body:
      "При наличии права можно вернуть до 19 500 ₽ за своё обучение или до 14 300 ₽ за обучение ребёнка. Сумма зависит от расходов, уплаченного НДФЛ и законных лимитов.",
  },
];

// ── Pillar-роутинг: выберите курс ─────────────────────────────────────────
const routes = [
  { tone: "card-violet-soft", title: "Детям от 7 лет", body: "Программа по возрасту: игровой старт с 7 лет, HSK 1–2 и подготовка к ОГЭ/ЕГЭ для старших.", href: "/courses/chinese-for-kids" },
  { tone: "card-cream-soft", title: "Взрослым с нуля", body: "Старт без подготовки: тоны, пиньинь, простые диалоги и разбор страхов новичка.", href: "/courses/chinese-for-adults" },
  { tone: "card-lime-soft", title: "Подготовка к HSK", body: "Все уровни 1–6: структура экзамена, лексика по частотности и пробные тесты.", href: "/courses/hsk-preparation" },
  { tone: "card-sky-soft", title: "Бизнес-китайский", body: "Корпоративные мини-группы: переписка с поставщиками, отчётность и документы.", href: "/courses/business-chinese" },
];

// ── Блок №3: форматы и носитель vs русскоязычный ──────────────────────────
const formats = [
  { name: "Самостоятельно «Введение»", price: "4 990 ₽", who: "если готовы учиться в своём ритме по 80 урокам" },
  { name: "Мини-группа до 5", price: "15 990 ₽", who: "баланс цены и практики: живой диалог и поддержка группы" },
  { name: "Индивидуально", price: "от 17 990 ₽", who: "максимальный темп и гибкое расписание под вашу цель" },
];

const teacherTypes = [
  {
    tone: "card-cream-soft",
    title: "Русскоязычный методист — для чего",
    body:
      "Ставит фонетику с нуля, объясняет грамматику через русскую логику и заранее знает, где русскоязычный ученик ошибётся. Незаменим на старте.",
  },
  {
    tone: "card-lime-soft",
    title: "Носитель путунхуа — для чего",
    body:
      "Даёт живую речь, естественные фразы и разговорную скорость, к которой не привыкнуть по учебнику. Подключается, когда у вас уже есть база.",
  },
];

// ── Как проходит обучение ─────────────────────────────────────────────────
const processSteps = [
  { step: "01", title: "Пробный урок и диагностика", body: "Бесплатное занятие 60 минут: проверяем уровень, обсуждаем цель и показываем платформу. Без обязательств." },
  { step: "02", title: "Выбор формата и договор", body: "Подбираем формат — самостоятельно, в мини-группе или индивидуально — согласуем расписание и подписываем договор." },
  { step: "03", title: "Живые занятия в кабинете", body: "Видеоуроки в браузере, чат с преподавателем, расписание с напоминаниями и записи каждого занятия." },
  { step: "04", title: "Практика и прогресс", body: "AI-разбор тонов и словарный тренажёр по 20–30 минут в день, чек-пойнты прогресса и доступ к материалам платформы." },
];

// ── Команда (все 4 преподавателя — это pillar) ────────────────────────────
const teamRows = [
  { role: "Старт с нуля · HSK 1–2", body: "Анастасия Пономарёва — фонетика, пиньинь и первые иероглифы; училась в Даляньском университете иностранных языков." },
  { role: "Бизнес-китайский · HSK 1–4", body: "Анастасия Ерина получила языковое образование в Китае (Wuhan University, 武昌理工学院)." },
  { role: "Носитель путунхуа", body: "Чжао Ли живёт в Китае: живая речь, аудирование и постановка произношения." },
  { role: "Автор учебных пособий · 13 лет", body: "Милена-Мария Карлова — востоковед, автор самоучителей и словарей, работает со школьниками и взрослыми." },
];

const h2Class =
  "text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl";
const leadClass = "mt-4 text-base leading-[1.65] text-[var(--muted-strong)]";

export default function OnlineChinesePage() {
  return (
    <CourseLanding
      breadcrumb={{ name: "Онлайн-курсы китайского", path: "/courses/online-chinese" }}
      pageHero={{
        variant: "violet",
        eyebrow: "Онлайн с любого устройства",
        title: "Онлайн-курсы китайского языка",
        description:
          "Лицензированная программа HSK 1–2 для детей от 7 лет, подростков, студентов и взрослых: мини-группы до 5 человек, индивидуальные занятия и самостоятельный формат. Собственная платформа с записями уроков и AI-тренажёром — учиться можно из любого города.",
      }}
      sections={
        <>
          {/* === ПОЧЕМУ ОНЛАЙН ============================================== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Почему онлайн</span>
              <h2 className={`mt-4 ${h2Class}`}>Почему онлайн-формат работает для китайского</h2>
              <p className={leadClass}>
                Главное преимущество — скорость и доступность: не нужно ехать в
                офис и искать школу рядом с домом. Занятия идут вживую с
                преподавателем, а платформа держит ритм между уроками.
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

          {/* === ВЫБЕРИТЕ КУРС (PILLAR-РОУТИНГ) ============================= */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Выберите курс</span>
              <h2 className={`mt-4 ${h2Class}`}>Какой онлайн-курс китайского вам нужен</h2>
              <p className={leadClass}>
                Программа одна — лицензированная HSK 1–2, — но цель у всех разная.
                Выберите свой маршрут. Нужен только репетитор 1 на 1?{" "}
                <Link href="/repetitor-kitayskogo" className="font-medium text-[var(--ink)] underline-offset-4 hover:underline">
                  Есть отдельный формат
                </Link>
                .
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {routes.map((r) => (
                <Reveal key={r.href}>
                  <Link href={r.href} className={`card-block h-full ${r.tone} flex flex-col transition hover:-translate-y-0.5`}>
                    <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">{r.title}</h3>
                    <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">{r.body}</p>
                    <span className="mt-4 text-sm font-medium text-[var(--ink)]">Открыть курс →</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === БЛОК №3: ФОРМАТ + НОСИТЕЛЬ vs РУССКОЯЗЫЧНЫЙ =============== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Какой формат выбрать</span>
              <h2 className={`mt-4 ${h2Class}`}>Формат и преподаватель под вашу цель</h2>
              <p className={leadClass}>
                Два решения, которые чаще всего откладывают старт: какой формат
                выбрать и нужен ли носитель. Разбираем оба честно.
              </p>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <Reveal>
                <div className="card-block card-block-lg card-ink h-full">
                  <span className="tag-pill tag-pill-ink">Форматы и цены</span>
                  <h3 className="mt-5 text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2] text-white">
                    Самостоятельно, в группе или индивидуально
                  </h3>
                  <ul className="mt-6 grid gap-4">
                    {formats.map((f) => (
                      <li key={f.name} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-base font-medium text-white">{f.name}</span>
                          <span className="text-[1.125rem] font-medium text-white">{f.price}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-[1.5] text-white/75">{f.who}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/compare/mini-group-vs-individual" className={buttonStyles({ variant: "secondary" })}>
                      Группа или индивидуально
                    </Link>
                    <Link href="/price" className={buttonStyles({ className: "bg-white/15 text-white hover:bg-white/25" })}>
                      Все цены
                    </Link>
                  </div>
                </div>
              </Reveal>
              <div className="grid gap-4">
                {teacherTypes.map((t) => (
                  <Reveal key={t.title}>
                    <article className={`card-block h-full ${t.tone}`}>
                      <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">{t.title}</h3>
                      <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">{t.body}</p>
                    </article>
                  </Reveal>
                ))}
                <p className="text-sm leading-[1.55] text-[var(--muted-strong)]">
                  При наличии права можно вернуть до 19 500 ₽ за своё обучение или
                  до 14 300 ₽ за обучение ребёнка. Фактическая сумма зависит от
                  расходов, уплаченного НДФЛ и законных лимитов.
                </p>
              </div>
            </div>
          </section>

          {/* === КАК ПРОХОДИТ ОБУЧЕНИЕ ====================================== */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-cream-soft">
              <div className="max-w-3xl">
                <span className="tag-pill">Как проходит обучение</span>
                <h2 className={`mt-4 ${h2Class}`}>Как устроено обучение на платформе</h2>
                <p className={leadClass}>
                  От пробного урока до регулярных занятий — четыре шага. Личный
                  кабинет это не просто видеозвонок, а учебная среда с записями,
                  тренажёрами и прогрессом.
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

          {/* === КОМАНДА ==================================================== */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-sky">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div>
                  <span className="tag-pill">Команда</span>
                  <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-[2.25rem]">
                    Преподаватели школы
                  </h2>
                  <p className="mt-5 text-base leading-[1.65] text-[var(--muted-strong)]">
                    Русскоязычные методисты ставят фонетику и грамматику через
                    русский язык, носитель путунхуа даёт живую речь, а автор
                    учебных пособий ведёт школьников и взрослых. Куратор подберёт
                    преподавателя под вашу цель.
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
              <h2 className={h2Class}>Эффективно ли учить китайский онлайн</h2>
              <div className="mt-6 grid gap-3 text-base leading-[1.65] text-[var(--muted-strong)]">
                <p>
                  Частый вопрос новичка — «реально ли выучить китайский
                  дистанционно». Для языка с тонами, иероглификой и упором на
                  говорение онлайн-формат работает не хуже офлайна, а в некоторых
                  вещах даже лучше. Произношение удобно отрабатывать через
                  микрофон с AI-разбором, иероглифы — в тренажёре с интервальными
                  повторениями, а пропущенное занятие легко догнать по записи.
                </p>
                <p>
                  Личный кабинет — это не «видеозвонок раз в неделю», а учебная
                  среда: живые уроки в браузере, расписание с напоминаниями,
                  записи занятий, словарный тренажёр и трек прогресса по HSK.
                  Учиться можно с телефона, планшета или ноутбука из любого города
                  и часового пояса — преподаватель подстраивается под ваше время.
                </p>
                <p>
                  Что выбрать — зависит от цели. Самостоятельный формат подходит
                  дисциплинированным, мини-группа даёт практику и поддержку
                  дешевле, индивидуальные занятия — максимальный темп под дедлайн.
                  Если не уверены в уровне, начните с{" "}
                  <Link href="/chinese/hsk-test" className="font-medium text-[var(--ink)] underline-offset-4 hover:underline">
                    бесплатного теста на уровень HSK
                  </Link>{" "}
                  и пробного занятия — преподаватель подскажет формат под вашу
                  цель и темп.
                </p>
              </div>
            </div>
          </section>
        </>
      }
      faqs={[
        {
          question: "Чем онлайн-курс отличается от офлайна?",
          answer:
            "Программа та же — лицензированная HSK 1–2. Разница в формате: занятия идут в реальном времени через видеосвязь в браузере, а лекции записываются и хранятся в личном кабинете. Не нужно ездить, можно догнать пропущенное и заниматься с любого устройства.",
        },
        {
          question: "Эффективно ли учить китайский дистанционно?",
          answer:
            "Да. Произношение отрабатывается через микрофон с AI-разбором тонов, иероглифы — в тренажёре с интервальными повторениями, говорение — на живых уроках с преподавателем. Для тонального языка онлайн-формат работает не хуже офлайна.",
        },
        {
          question: "Носитель или русскоязычный преподаватель — что выбрать?",
          answer:
            "На старте важнее русскоязычный методист: он ставит фонетику и объясняет грамматику понятным языком. Носитель путунхуа подключается позже — для живой речи, аудирования и разговорной скорости, когда уже есть база.",
        },
        {
          question: "Сколько часов в неделю нужно заниматься?",
          answer:
            "4–6 часов: 1–2 живых занятия по 60 минут плюс 20–30 минут самостоятельной работы в тренажёре каждый день. Это базовый темп, при котором программа HSK 1–2 проходится примерно за полгода.",
        },
        {
          question: "Сколько стоят онлайн-курсы?",
          answer:
            "Самостоятельное «Введение» — 4 990 ₽ за 80 уроков, мини-группа до 5 человек — 15 990 ₽. Индивидуальный модуль — от 17 990 ₽ за один месяц и 8 занятий по 60 минут. После него можно продолжить обучение, отдельно оплатив следующий модуль. Подписки, рассрочки, автоматического списания и обязательной покупки следующих модулей нет.",
        },
        {
          question: "Можно ли учиться с телефона?",
          answer:
            "Да. Личный кабинет полностью адаптирован под мобильное устройство: лекции, тесты, тренажёры и видеозаписи занятий доступны с телефона, планшета или ноутбука.",
        },
        {
          question: "Что делать, если пропустил занятие?",
          answer:
            "Все занятия записываются и сохраняются в личном кабинете. Если не смогли прийти, можно посмотреть запись в удобное время и сдать домашнее задание онлайн.",
        },
        {
          question: "Как происходит оплата и как вернуть вычет?",
          answer:
            "После пробного занятия и выбора формата вы получаете счёт и оплачиваете онлайн. Школа лицензирована департаментом Москвы и выдаёт документы для социального вычета; право и сумма возврата определяются условиями закона.",
        },
        {
          question: "С какого уровня можно начинать?",
          answer:
            "С нуля или с любого имеющегося уровня. Чтобы определить точку старта, пройдите бесплатный тест на уровень HSK на сайте — 25 вопросов с вариантами ответа и рекомендация курса.",
        },
      ]}
      schemaCourse={{
        slug: "online-chinese",
        title: "Онлайн-курсы китайского языка",
        href: "/courses/online-chinese",
        level: "HSK 1–2",
        duration: "От 80 занятий",
        format: "Онлайн: самостоятельно, мини-группа или индивидуально",
        price: "от 4 990 ₽",
        priceValue: "4990",
        description:
          "Лицензированные онлайн-курсы китайского языка для детей от 7 лет, подростков, студентов и взрослых. Программа HSK 1–2, собственная платформа с записями уроков и AI-тренажёром.",
        audience: "Дети от 7 лет, подростки, студенты и взрослые",
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
          "Документ о прохождении программы ДПО. Подготовка к сертификату HSK 2.",
        timeRequiredIso: "PT80H",
        instructorSlug: "anastasia-ponomareva",
      }}
      ctaText="60 минут с преподавателем онлайн: проверим уровень, обсудим цель и покажем платформу. Поможем выбрать формат — самостоятельно, в группе или индивидуально."
      related={[
        { title: "Взрослым с нуля", href: "/courses/chinese-for-adults" },
        { title: "Детям от 7 лет", href: "/courses/chinese-for-kids" },
        { title: "Подготовка к HSK 1–6", href: "/courses/hsk-preparation" },
        { title: "Бизнес-китайский для команд", href: "/courses/business-chinese" },
        { title: "Репетитор китайского 1 на 1", href: "/repetitor-kitayskogo" },
        { title: "Бесплатный тест на уровень HSK", href: "/chinese/hsk-test" },
      ]}
    />
  );
}
