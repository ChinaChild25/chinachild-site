import type { Metadata } from "next";
import Link from "next/link";
import CourseLanding from "@/components/sections/CourseLanding";
import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Бизнес-китайский для компаний онлайн — ChinaChild",
    description:
      "Корпоративный курс китайского: мини-группы для сотрудников, ВЭД-сценарии и переписка с поставщиками, отчётность для HR, закрывающие документы и ЭДО.",
    path: "/courses/business-chinese",
    keywords: [
      "корпоративный китайский",
      "бизнес китайский онлайн",
      "китайский для компании",
      "обучение сотрудников китайскому",
      "китайский для переговоров",
      "китайский для ВЭД",
    ],
  });
}

// ── Что получает компания ─────────────────────────────────────────────────
const whyCards = [
  {
    tone: "card-violet-soft",
    eyebrow: "Прикладная программа",
    title: "Под задачи бизнеса, а не учебник",
    body:
      "База HSK 1–2 плюс сценарии работы с Китаем: переписка с поставщиками, инвойсы и спецификации, простые созвоны с партнёрами.",
  },
  {
    tone: "card-cream",
    eyebrow: "Прозрачно для HR",
    title: "Прогресс каждого сотрудника",
    body:
      "Личный кабинет, посещаемость, тесты и видеозаписи. Руководитель видит динамику команды и каждого сотрудника в одном месте.",
  },
  {
    tone: "card-lime-soft",
    eyebrow: "Для бухгалтерии",
    title: "Закрывающие документы и ЭДО",
    body:
      "Образовательная лицензия Москвы. Договор, акт, счёт под бухгалтерию заказчика, при необходимости — через ЭДО.",
  },
  {
    tone: "card-sky",
    eyebrow: "Гибкие группы",
    title: "По уровню или подразделению",
    body:
      "Мини-группы до 5 человек формируем по уровню или по отделам. Для топ-менеджмента — индивидуальные занятия под график.",
  },
];

// ── Блок «Кому подходит» — 3 портрета клиента ─────────────────────────────
const portraits = [
  {
    tone: "card-violet-soft",
    badge: "Импортёр и селлер маркетплейса",
    pain: "Закупки в Китае идут через переводчика — теряются нюансы, растут сроки, бывают ошибки в спецификациях.",
    fix: "База HSK 1–2 плюс лексика заказа и спецификаций за несколько месяцев. Менеджер читает простые сообщения в WeChat и понимает инвойс.",
  },
  {
    tone: "card-cream-soft",
    badge: "Команда, выходящая на рынок КНР",
    pain: "Без языка сложно выстроить доверие с партнёрами и понять деловой контекст переговоров.",
    fix: "Мини-группа из 3–5 сотрудников учит язык и деловой этикет параллельно — приветствие, числа, цены, сроки, договорённости.",
  },
  {
    tone: "card-lime-soft",
    badge: "HR и руководитель",
    pain: "Нужны документы для бухгалтерии, отчёты по прогрессу и контроль посещаемости — а не «обучение где-то идёт».",
    fix: "Полный пакет закрывающих документов плюс дашборд с прогрессом каждого сотрудника и регулярные сводки по группе.",
  },
];

// ── Блок №3: ВЭД-сценарии и деловая лексика ───────────────────────────────
const scenarioPhrases = [
  { hanzi: "这个产品的价格是多少？", pinyin: "Zhège chǎnpǐn de jiàgé shì duōshao?", ru: "«Сколько стоит этот товар?»" },
  { hanzi: "能不能给我们一些折扣？", pinyin: "Néng bu néng gěi wǒmen yìxiē zhékòu?", ru: "«Можете дать нам скидку?»" },
  { hanzi: "请先发样品，确认质量。", pinyin: "Qǐng xiān fā yàngpǐn, quèrèn zhìliàng.", ru: "«Сначала пришлите образец — проверим качество.»" },
  { hanzi: "什么时候可以发货？", pinyin: "Shénme shíhou kěyǐ fāhuò?", ru: "«Когда сможете отгрузить?»" },
];

const glossary = [
  { ru: "заказ", hanzi: "订单", pinyin: "dìngdān" },
  { ru: "поставщик", hanzi: "供应商", pinyin: "gōngyìngshāng" },
  { ru: "цена", hanzi: "价格", pinyin: "jiàgé" },
  { ru: "отгрузка", hanzi: "发货", pinyin: "fāhuò" },
  { ru: "договор", hanzi: "合同", pinyin: "hétong" },
  { ru: "образец", hanzi: "样品", pinyin: "yàngpǐn" },
  { ru: "скидка", hanzi: "折扣", pinyin: "zhékòu" },
  { ru: "качество", hanzi: "质量", pinyin: "zhìliàng" },
  { ru: "оплата", hanzi: "付款", pinyin: "fùkuǎn" },
  { ru: "срок", hanzi: "期限", pinyin: "qīxiàn" },
  { ru: "количество", hanzi: "数量", pinyin: "shùliàng" },
  { ru: "рекламация", hanzi: "投诉", pinyin: "tóusù" },
];

// ── Программа курса ───────────────────────────────────────────────────────
const modules = [
  { tone: "card-violet-soft", title: "Базовый блок HSK 1–2", body: "Фонетика, тоны, грамматика и около 300 слов бытового и делового китайского — фундамент, без которого не работают остальные модули." },
  { tone: "card-cream-soft", title: "Деловая переписка", body: "WeChat и email с поставщиком: как разместить заказ, уточнить условия, оформить претензию. Стандартные фразы и вежливые формулировки." },
  { tone: "card-lime-soft", title: "Переговоры и созвоны", body: "Приветствие, числа, цены, сроки и подтверждение договорённостей. Простой созвон с партнёром на базовом уровне." },
  { tone: "card-sky-soft", title: "Отраслевой модуль", body: "Лексика под специфику компании — e-commerce, импорт, логистика. Отраслевые материалы добавляем сверх базовой программы под ваши задачи." },
];

// ── Этапы сотрудничества ──────────────────────────────────────────────────
const processSteps = [
  { step: "01", title: "Заявка и аудит потребности", body: "Заявки обрабатываем ежедневно с 09:00 до 21:00 МСК, обычно отвечаем в течение 1–2 часов. Затем уточняем задачи команды и готовим предложение." },
  { step: "02", title: "Тест уровня и состав групп", body: "Сотрудники проходят тест на уровень. Формируем мини-группы по уровню или подразделению, согласуем расписание." },
  { step: "03", title: "Пробное занятие для команды", body: "Демонстрационный урок: команда знакомится с преподавателем и платформой, вы оцениваете формат до старта." },
  { step: "04", title: "Договор, старт и отчёты HR", body: "Подписываем договор, открываем доступ в кабинет, запускаем занятия. HR получает регулярные отчёты и доступ в дашборд." },
];

// ── Варианты оплаты ───────────────────────────────────────────────────────
const paymentModels = [
  { tone: "card-violet-soft", title: "За счёт компании", body: "Оплата по договору с закрывающими документами. Расходы на обучение — на бизнес." },
  { tone: "card-cream-soft", title: "Софинансирование", body: "Часть оплачивает компания, часть — сотрудник. Гибкое распределение по политике HR." },
  { tone: "card-lime-soft", title: "Сотрудник платит сам", body: "При наличии права сотрудник может оформить социальный вычет и вернуть до 19 500 ₽ за своё обучение; сумма зависит от расходов, уплаченного НДФЛ и законных лимитов." },
];

const closingDocs = [
  "Договор на оказание образовательных услуг",
  "Акт выполненных работ и счёт (ЭДО при необходимости)",
  "Документ о прохождении программы ДПО для сотрудника",
  "Еженедельный отчёт: посещаемость, тесты, прогресс по словарю",
  "Доступ HR в дашборд с прогрессом в реальном времени",
];

// ── Команда ───────────────────────────────────────────────────────────────
const teamRows = [
  { role: "Преподаватель бизнес-китайского", body: "Анастасия Ерина специализируется на бизнес-китайском и HSK 1–4, языковое образование получила в Китае (Wuhan University, 武昌理工学院)." },
  { role: "Носитель путунхуа", body: "Чжао Ли даёт живую речь и культурный контекст переговоров — то, к чему не привыкнуть по учебнику." },
  { role: "Куратор и отчётность", body: "Куратор ведёт группу, собирает посещаемость и тесты и готовит сводки для HR в личном кабинете." },
];

const h2Class =
  "text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl";
const leadClass = "mt-4 text-base leading-[1.65] text-[var(--muted-strong)]";

export default function BusinessChinesePage() {
  return (
    <CourseLanding
      breadcrumb={{ name: "Бизнес-китайский", path: "/courses/business-chinese" }}
      pageHero={{
        variant: "violet",
        eyebrow: "Корпоративные группы",
        title: "Бизнес-китайский для команд и сотрудников",
        description:
          "Лицензированная программа HSK 1–2 с прикладным ВЭД-акцентом: мини-группы до 5 человек, переписка с поставщиками и переговоры, отчётность для HR, закрывающие документы и ЭДО.",
      }}
      sections={
        <>
          {/* === ЧТО ПОЛУЧАЕТ КОМПАНИЯ ====================================== */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Что получает компания</span>
              <h2 className={`mt-4 ${h2Class}`}>Корпоративный китайский под задачи бизнеса</h2>
              <p className={leadClass}>
                Та же лицензированная программа HSK 1–2, что и для розничных
                учеников, но адаптированная под нужды команды: прикладные
                сценарии, отчётность для HR и полный пакет документов для
                бухгалтерии.
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

          {/* === 3 ПОРТРЕТА КЛИЕНТА ========================================= */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Кому нужен</span>
              <h2 className={`mt-4 ${h2Class}`}>Кому нужен корпоративный китайский</h2>
              <p className={leadClass}>
                Три типичные ситуации, в которых язык перестаёт быть «приятным
                бонусом» и становится рабочим инструментом — с конкретной болью и
                решением для каждой.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {portraits.map((p) => (
                <Reveal key={p.badge}>
                  <article className={`card-block h-full ${p.tone}`}>
                    <div className="tag-pill">{p.badge}</div>
                    <p className="mt-4 text-sm leading-[1.6] text-[var(--muted-strong)]">
                      <span className="font-medium text-[var(--ink)]">Боль: </span>{p.pain}
                    </p>
                    <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                      <span className="font-medium text-[var(--ink)]">Решение: </span>{p.fix}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === БЛОК №3: ВЭД-СЦЕНАРИИ И ЛЕКСИКА ============================ */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Деловой китайский на практике</span>
              <h2 className={`mt-4 ${h2Class}`}>Как звучит деловой китайский в работе с поставщиком</h2>
              <p className={leadClass}>
                «Бизнес-китайский» легко заявить, но сложно показать. Вот реальные
                фразы и лексика, которые добавляем сверх базовой программы под
                задачи компании — переписку и переговоры с фабрикой.
              </p>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal>
                <div className="card-block card-block-lg card-cream-soft h-full">
                  <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">Сценарные фразы</h3>
                  <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                    {scenarioPhrases.map((p) => (
                      <li key={p.hanzi} className="card-block bg-[var(--background-2)]">
                        <div className="text-[1.25rem] leading-[1.3] text-[var(--ink)]">{p.hanzi}</div>
                        <div className="mt-2 text-sm text-[var(--ink)]/55">{p.pinyin}</div>
                        <p className="mt-2 text-sm leading-[1.55] text-[var(--muted-strong)]">{p.ru}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal>
                <div className="card-block card-block-lg card-violet-soft h-full">
                  <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">Мини-глоссарий ВЭД</h3>
                  <ul className="mt-4 grid gap-2.5">
                    {glossary.map((g) => (
                      <li key={g.hanzi} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-[var(--muted-strong)]">{g.ru}</span>
                        <span className="text-right text-[var(--ink)]">
                          {g.hanzi} <span className="text-[var(--ink)]/55">{g.pinyin}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
            <Reveal>
              <div className="mt-5 card-block card-block-lg card-sky-soft">
                <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">Почему партнёр говорит «maybe» вместо «нет»</h3>
                <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                  В деловой культуре Китая прямой отказ — редкость: важно сохранить
                  лицо (面子) и отношения (关系). «Подумаем», «возможно», уклончивый
                  ответ часто означают «нет». На занятиях разбираем такие сигналы и
                  вежливые формулировки, чтобы вы понимали подтекст переговоров, а
                  не только слова. Это часть методики, а не отдельный «курс этикета».
                </p>
              </div>
            </Reveal>
          </section>

          {/* === ПРОГРАММА КУРСА ============================================ */}
          <section className="page-shell-wide section-space">
            <div className="max-w-3xl">
              <span className="tag-pill">Программа</span>
              <h2 className={`mt-4 ${h2Class}`}>Из чего состоит корпоративный курс</h2>
              <p className={leadClass}>
                Четыре модуля от фонетики до отраслевой лексики. Базовый блок —
                общий, прикладные модули собираем под задачи и отрасль компании.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {modules.map((m) => (
                <Reveal key={m.title}>
                  <article className={`card-block h-full ${m.tone}`}>
                    <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">{m.title}</h3>
                    <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">{m.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* === ЭТАПЫ СОТРУДНИЧЕСТВА ======================================= */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-cream-soft">
              <div className="max-w-3xl">
                <span className="tag-pill">Как запустить</span>
                <h2 className={`mt-4 ${h2Class}`}>Как запустить корпоративный курс</h2>
                <p className={leadClass}>
                  От заявки до первого занятия обычно 3–5 рабочих дней — ровно
                  столько, чтобы протестировать уровень сотрудников и собрать
                  группы.
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

          {/* === СТОИМОСТЬ И ОПЛАТА ========================================= */}
          <section className="page-shell-wide section-space">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <Reveal>
                <div className="card-block card-block-lg card-ink h-full">
                  <span className="tag-pill tag-pill-ink">Стоимость</span>
                  <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-[2.25rem]">
                    Расчёт под вашу команду
                  </h2>
                  <p className="mt-5 text-base leading-7 text-white/85">
                    Стоимость зависит от числа сотрудников, формата групп и
                    отраслевых модулей. Оставьте заявку — после уточнения задачи
                    пришлём коммерческое предложение с прозрачной разбивкой и
                    закрывающими документами.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/about" className={buttonStyles({ variant: "secondary" })}>
                      Лицензия и о школе
                    </Link>
                    <Link href="/methodology" className={buttonStyles({ className: "bg-white/15 text-white hover:bg-white/25" })}>
                      Методика обучения
                    </Link>
                  </div>
                </div>
              </Reveal>
              <div className="grid gap-4">
                {paymentModels.map((c) => (
                  <Reveal key={c.title}>
                    <article className={`card-block ${c.tone}`}>
                      <h3 className="text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">{c.title}</h3>
                      <p className="mt-2 text-sm leading-[1.6] text-[var(--muted-strong)]">{c.body}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal>
              <div className="mt-5 card-block card-block-lg card-lime-soft">
                <h3 className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2] text-[var(--ink)]">
                  Документы для бухгалтерии и HR
                </h3>
                <ul className="mt-5 grid gap-2.5 md:grid-cols-2">
                  {closingDocs.map((d) => (
                    <li key={d} className="flex gap-2 text-sm leading-[1.55] text-[var(--muted-strong)]">
                      <span aria-hidden className="text-[var(--ink)]">—</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </section>

          {/* === КОМАНДА ==================================================== */}
          <section className="page-shell-wide section-space">
            <div className="card-block card-block-lg card-sky">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div>
                  <span className="tag-pill">Команда</span>
                  <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-[2.25rem]">
                    Кто будет учить команду
                  </h2>
                  <p className="mt-5 text-base leading-[1.65] text-[var(--muted-strong)]">
                    Корпоративные группы ведёт преподаватель со специализацией на
                    бизнес-китайском, носитель путунхуа подключается для живой
                    речи, а куратор отвечает за отчётность для HR.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/team" className={buttonStyles({})}>Все преподаватели</Link>
                    <Link href="/about" className={buttonStyles({ variant: "secondary" })}>О школе и лицензия</Link>
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
        </>
      }
      faqs={[
        {
          question: "Сколько сотрудников должно быть в группе?",
          answer:
            "От 3 до 5 человек в одной мини-группе. Если сотрудников больше — формируем несколько групп по уровню или по подразделениям. Для топ-менеджмента возможны индивидуальные занятия.",
        },
        {
          question: "Можно ли адаптировать программу под отрасль?",
          answer:
            "Да. После базового блока HSK 1–2 добавляем отраслевые модули: e-commerce, импорт, логистика, B2B-переговоры. Лексику и кейсы подбираем под специфику компании.",
        },
        {
          question: "Какие документы получит бухгалтерия?",
          answer:
            "Договор на образовательные услуги, акт выполненных работ и счёт, при необходимости — через ЭДО. Каждый сотрудник получает документ о прохождении программы ДПО, который можно использовать для налогового вычета 13%.",
        },
        {
          question: "Как измеряется прогресс сотрудников?",
          answer:
            "В личном кабинете: посещаемость, результаты тестов и динамика по словарному запасу. HR получает регулярные сводки по группе и доступ в дашборд, по запросу — отчёты по каждому сотруднику.",
        },
        {
          question: "В каком формате проходят занятия?",
          answer:
            "Полностью онлайн — в браузере, без установки Zoom. Сотрудники из разных городов и часовых поясов учатся в одной группе; все занятия записываются, можно догнать пропущенное.",
        },
        {
          question: "Можно ли заниматься в разных часовых поясах?",
          answer:
            "Да. Группы формируем с учётом графика и часовых поясов сотрудников, расписание согласуем под рабочие смены. Записи уроков остаются в кабинете для тех, кто не смог прийти.",
        },
        {
          question: "Сколько стоит корпоративное обучение?",
          answer:
            "Стоимость рассчитывается под размер команды, формат групп и набор отраслевых модулей. Заявки обрабатываем ежедневно с 09:00 до 21:00 МСК и обычно отвечаем в течение 1–2 часов; предложение готовим после уточнения задачи.",
        },
        {
          question: "За сколько сотрудник выйдет на рабочий минимум?",
          answer:
            "Базовый рабочий минимум — переписка с поставщиком и простые созвоны — реален в горизонте около полугода регулярных занятий (уровень HSK 1–2). Более сложные переговоры требуют HSK 3–4 и большего срока; точный план зависит от стартового уровня сотрудников.",
        },
      ]}
      schemaCourse={{
        slug: "business-chinese",
        title: "Бизнес-китайский для команд",
        href: "/courses/business-chinese",
        level: "HSK 1–2 (corporate)",
        duration: "От 6 месяцев",
        format: "Корпоративная мини-группа",
        price: "по запросу",
        description:
          "Корпоративное обучение китайскому для команд: лицензированная программа HSK 1–2 с ВЭД-акцентом, отчётность для HR и закрывающие документы.",
        audience: "Команды компаний",
        outcome: "Разговорный уровень и работа с китайскими партнёрами",
        teaches: [
          "Деловая переписка с китайскими партнёрами",
          "Простые переговоры и созвоны",
          "Работа с заказами, ценами и сроками",
          "Отраслевая лексика (e-commerce, импорт, логистика)",
          "Деловой этикет и культурный контекст КНР",
        ],
        prerequisites: "Не требуется. Группа стартует с нуля.",
        credentialAwarded:
          "Документ о прохождении программы ДПО для сотрудника + подготовка к HSK 2.",
        timeRequiredIso: "PT80H",
        instructorSlug: "anastasia-erina",
      }}
      ctaHeading="Получите коммерческое предложение для команды"
      ctaText="Оставьте заявку — ежедневно с 09:00 до 21:00 МСК обычно отвечаем в течение 1–2 часов. Обсудим задачи, протестируем уровень сотрудников и подготовим расчёт с закрывающими документами."
      related={[
        { title: "Корпоративное обучение", href: "/corporate" },
        { title: "Курс китайского для взрослых", href: "/courses/chinese-for-adults" },
        { title: "Подготовка к HSK 1–6", href: "/courses/hsk-preparation" },
        { title: "Методика школы", href: "/methodology" },
        { title: "О школе и лицензия", href: "/about" },
        { title: "Преподаватели", href: "/team" },
      ]}
    />
  );
}
