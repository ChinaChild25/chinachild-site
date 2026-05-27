import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import ReviewsSection from "@/components/sections/ReviewsSection";
import FAQSection from "@/components/sections/FAQSection";
import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { createPageGraph } from "@/lib/schema";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Репетитор по китайскому языку онлайн — индивидуально с нуля | ChinaChild",
  description:
    "Репетитор китайского онлайн: индивидуально с нуля до HSK 6, преподаватели ЮФУ и ДГТУ, носители путунхуа. Лицензия Москвы, налоговый вычет 13%.",
  path: "/repetitor-kitayskogo",
  keywords: [
    "репетитор китайского",
    "репетитор китайского онлайн",
    "репетитор по китайскому языку",
    "репетитор китайского с нуля",
    "репетитор HSK",
    "индивидуальные занятия китайским",
    "учитель китайского онлайн",
    "репетитор китайского Москва",
  ],
});

const faqs = [
  {
    question: "Сколько стоит репетитор по китайскому в ChinaChild?",
    answer:
      "Индивидуальное занятие 60 минут — 2 200 ₽ для школьников и 2 500 ₽ для взрослых. При оплате за 8 занятий — скидка 10%. Точные цены и пакеты — на странице «Цены»; стоимость закрепляется в договоре до начала курса.",
  },
  {
    question: "Чем репетитор отличается от мини-группы?",
    answer:
      "Репетитор работает 1 на 1: темп и расписание подстраиваются под вас, на каждой реплике есть индивидуальная обратная связь, можно глубже останавливаться на сложных темах. Мини-группа дешевле и даёт диалог с одногруппниками, но темп общий.",
  },
  {
    question: "С какого уровня можно заниматься?",
    answer:
      "С нуля. Большинство учеников приходят, не зная пиньиня и тонов. Преподаватель ставит фонетику, объясняет структуру иероглифа и подбирает программу так, чтобы за 3 месяца вы вышли на простые бытовые диалоги (HSK 1).",
  },
  {
    question: "Кто будет вести занятия?",
    answer:
      "Русскоязычные методисты — выпускники Даляньского, Южного и Донского технического университетов, с педагогическим стажем 5–10 лет и опытом подготовки к HSK. На продвинутых уровнях добавляется носитель путунхуа из Китая для разговорной практики.",
  },
  {
    question: "Можно ли заниматься, если живу не в Москве?",
    answer:
      "Да. Уроки идут полностью онлайн через личный кабинет — никакой установки Zoom не требуется. Школа работает с учениками из всех городов России и стран СНГ; часовые пояса подстраиваются под расписание преподавателя.",
  },
  {
    question: "Можно ли получить налоговый вычет?",
    answer:
      "Да. Школа работает по образовательной лицензии Департамента образования и науки города Москвы. После курса выдаём документ, который прикладывают к заявлению на налоговый вычет 13% — до 19 500 ₽ в год.",
  },
  {
    question: "Сколько уроков нужно, чтобы заговорить?",
    answer:
      "На простые бытовые темы — 36–48 индивидуальных уроков (3–4 месяца по два раза в неделю) при условии 30 минут самостоятельной работы в день в тренажёре. До разговорного уровня HSK 2 — 72–96 уроков (6 месяцев).",
  },
];

const breadcrumbs = [
  { name: "Главная", path: "/" },
  { name: "Репетитор китайского", path: "/repetitor-kitayskogo" },
];

const pageSchema = createPageGraph({
  url: "/repetitor-kitayskogo",
  name: "Репетитор по китайскому языку онлайн — ChinaChild",
  description:
    "Индивидуальные занятия китайским с репетитором онлайн: с нуля до HSK 6, лицензия Москвы, налоговый вычет 13%.",
  breadcrumbs,
  faqs,
  speakable: true,
});

const whyBlocks = [
  {
    eyebrow: "1 на 1",
    title: "Темп и расписание — ваши",
    body:
      "Никаких компромиссов с группой: если устали — повторили тему, если быстро схватываете — пошли вперёд. Расписание подстраивается под рабочую неделю, командировки и часовой пояс, занятия переносятся без штрафа в установленные сроки.",
  },
  {
    eyebrow: "Программа под цель",
    title: "Поездка, HSK, поступление или работа",
    body:
      "Перед стартом методист уточняет цель и собирает индивидуальный план: для туриста — фразы и иероглифы для метро, для соискателя в КНР — переписка и собеседование, для абитуриента — структура экзамена HSK.",
  },
  {
    eyebrow: "Фонетика с первого урока",
    title: "Тоны, пиньинь и порядок черт",
    body:
      "70% русскоязычных учеников бросают китайский на тонах. Репетитор ставит произношение через микрофон с AI-разбором: тренажёр показывает, на каком слоге сбивается тон, и предлагает упражнение под конкретную ошибку.",
  },
  {
    eyebrow: "Прозрачный прогресс",
    title: "Видно, что вы уже умеете",
    body:
      "Каждые 4 урока — короткий чек-пойнт: какие слова закреплены, какая грамматика проходит свободно, что нужно повторить. Вы не учите «куда-то в темноту» — на каждом этапе понятно, что уже сделано и сколько ещё до HSK 1, 2, 3.",
  },
];

const audience = [
  {
    badge: "Школьникам 12+",
    body:
      "Подростки, которые учат китайский для поступления, олимпиад или второго иностранного. Скидка 10% при оплате за 2 месяца, родителям отчёт о прогрессе раз в 4 урока. Программа адаптирована под школьную нагрузку.",
  },
  {
    badge: "Взрослым с нуля",
    body:
      "Если вы никогда не учили иероглифический язык — нормально. Репетитор начинает с пиньиня, постепенно вводит знаки и сравнивает грамматику с русской логикой, чтобы система выстроилась с первой недели, а не «когда-нибудь».",
  },
  {
    badge: "Готовящимся к HSK",
    body:
      "От HSK 1 до HSK 6: репетитор разбирает структуру экзамена, тренирует аудирование в реальном темпе и собирает портфолио модельных ответов. К сдаче вы приходите без эффекта «знал — забыл от стресса».",
  },
  {
    badge: "Работающим с Китаем",
    body:
      "Закупки, фабрики, маркетплейсы. Репетитор подбирает лексику переговоров и переписки с поставщиками, разбирает реальные кейсы (WeChat, Alibaba, документы) — китайский становится рабочим инструментом за 4–6 месяцев.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Заявка и звонок",
    body:
      "Вы оставляете заявку — куратор перезванивает в течение рабочего дня. Уточняем цель, текущий уровень и удобное время для пробного занятия. Никаких автосписаний или подписок.",
  },
  {
    step: "02",
    title: "Бесплатный пробный урок",
    body:
      "60 минут с методистом онлайн. Преподаватель проверяет фонетику и базу, показывает личный кабинет, тренажёр и формат уроков. Вы решаете, продолжать ли — без давления.",
  },
  {
    step: "03",
    title: "Подбор репетитора и плана",
    body:
      "Куратор подбирает преподавателя под цель, темп и личностный тип. Согласуем расписание, частоту (1–3 раза в неделю) и подписываем договор. После оплаты вы получаете доступ ко всем материалам платформы.",
  },
  {
    step: "04",
    title: "Регулярные занятия и прогресс",
    body:
      "Уроки идут по плану: говорим, читаем, разбираем грамматику и иероглифы. Между уроками — короткая домашка и тренажёр. Каждые 4 занятия — чек-пойнт прогресса и корректировка плана при необходимости.",
  },
];

export default function RepetitorPage() {
  return (
    <main>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={pageSchema} id="repetitor-page-schema" />

      <PageHero
        eyebrow="Индивидуально 1 на 1"
        title="Репетитор по китайскому языку онлайн"
        description="Индивидуальные занятия китайским с преподавателями ЮФУ, ДГТУ и носителями путунхуа. С нуля до HSK 6, лицензия Москвы, налоговый вычет 13% и собственная платформа без Zoom."
        primaryCta={{ label: "Записаться на бесплатный урок", modal: true }}
        secondaryCta={{ label: "Все курсы", href: "/courses" }}
        variant="violet"
      />

      {/* === WHY ============================================================ */}
      <section className="page-shell-wide section-space">
        <div className="max-w-3xl">
          <span className="tag-pill">Чем репетитор полезнее</span>
          <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl">
            Что вы получаете от формата «1 на 1»
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-[var(--muted-strong)]">
            Репетитор — это не «дороже мини-группы», это «быстрее под вашу
            конкретную цель». На индивидуальных занятиях каждая минута урока
            работает только на вас: ваши слабые места, ваш темп, ваш словарь.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {whyBlocks.map((block, i) => (
            <Reveal key={block.title}>
              <article
                className={`card-block h-full ${
                  ["card-violet-soft", "card-cream", "card-lime-soft", "card-sky"][i]
                }`}
              >
                <div className="text-sm font-medium text-[var(--ink)]/55">
                  {block.eyebrow}
                </div>
                <h3 className="mt-4 text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">
                  {block.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                  {block.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* === FOR WHOM ====================================================== */}
      <section className="page-shell-wide section-space">
        <div className="max-w-3xl">
          <span className="tag-pill">Кому подходит</span>
          <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl">
            Кого учат наши репетиторы
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-[var(--muted-strong)]">
            ChinaChild работает с четырьмя группами учеников. Преподаватель
            подбирается под возраст, цель и темп — никаких универсальных
            «школьных программ для всех сразу».
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {audience.map((a, i) => (
            <Reveal key={a.badge}>
              <article
                className={`card-block h-full ${
                  ["card-violet-soft", "card-cream-soft", "card-lime-soft", "card-sky-soft"][i]
                }`}
              >
                <div className="tag-pill">{a.badge}</div>
                <p className="mt-4 text-sm leading-[1.6] text-[var(--muted-strong)]">
                  {a.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* === PROCESS ======================================================= */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream-soft">
          <div className="max-w-3xl">
            <span className="tag-pill">Как начать</span>
            <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl">
              Четыре шага до первого урока
            </h2>
            <p className="mt-4 text-base leading-[1.65] text-[var(--muted-strong)]">
              Никакого «созвонимся как-нибудь». От заявки до первого занятия
              обычно проходит 2–3 рабочих дня — ровно столько, чтобы согласовать
              время и подобрать репетитора под цель.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <Reveal key={step.step}>
                <article className="card-block h-full bg-[var(--background-2)]">
                  <div className="text-2xl font-medium tracking-[-0.01em] text-[var(--ink)]">
                    {step.step}
                  </div>
                  <h3 className="mt-3 text-[1.125rem] font-medium leading-[1.25] text-[var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                    {step.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === FORMAT vs GROUP =============================================== */}
      <section className="page-shell-wide section-space">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <Reveal>
            <div className="card-block card-block-lg card-ink h-full">
              <span className="tag-pill tag-pill-ink">Репетитор vs группа</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-[2.25rem]">
                Когда выбрать репетитора, а когда — мини-группу
              </h2>
              <p className="mt-5 text-base leading-7 text-white/85">
                У нас нет «правильного» формата на все случаи. Репетитор —
                быстрее под конкретную цель и дороже за урок; мини-группа —
                дешевле, медленнее и даёт живой диалог с одногруппниками.
                Что важно именно вам — обсудим на пробном занятии.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/compare/mini-group-vs-individual"
                  className={buttonStyles({ variant: "secondary" })}
                >
                  Подробное сравнение
                </Link>
                <Link
                  href="/courses/online-chinese"
                  className={buttonStyles({
                    className: "bg-white/15 text-white hover:bg-white/25",
                  })}
                >
                  Курс с нуля
                </Link>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-4">
            <Reveal>
              <article className="card-block card-violet-soft">
                <div className="tag-pill">Репетитор подойдёт, если…</div>
                <ul className="mt-4 grid gap-2 text-sm leading-[1.6] text-[var(--muted-strong)]">
                  <li>— нужна конкретная цель к дате (HSK, поступление, поездка);</li>
                  <li>— темп выше или ниже среднего;</li>
                  <li>— расписание плавающее, без жёстких слотов;</li>
                  <li>— есть стеснение говорить в группе.</li>
                </ul>
              </article>
            </Reveal>
            <Reveal>
              <article className="card-block card-cream-soft">
                <div className="tag-pill">Группа лучше, если…</div>
                <ul className="mt-4 grid gap-2 text-sm leading-[1.6] text-[var(--muted-strong)]">
                  <li>— бюджет на курс ограничен;</li>
                  <li>— цель — разговорный, не экзамен;</li>
                  <li>— важна мотивация «не отстать» от одногруппников;</li>
                  <li>— расписание стабильное и совпадает с группой.</li>
                </ul>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* === TEAM TEASER =================================================== */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-sky">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="tag-pill">Команда</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-[2.25rem]">
                Кто будет вашим репетитором
              </h2>
              <p className="mt-5 text-base leading-[1.65] text-[var(--muted-strong)]">
                В команде ChinaChild — методисты, выпускники Даляньского,
                Южного федерального и Донского технического университетов с
                опытом 5–10 лет, а также носители путунхуа из Китая с
                сертификатом HSK 6. Куратор подбирает преподавателя под цель и
                характер ученика — если не сложится, поменяем без вопросов.
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
                <li className="card-block bg-[var(--background-2)]">
                  <div className="text-sm font-medium text-[var(--ink)]/55">
                    Русскоязычный методист
                  </div>
                  <p className="mt-2 text-sm leading-[1.55] text-[var(--muted-strong)]">
                    Ставит фонетику, объясняет грамматику через русский язык и
                    заранее знает, где русскоязычный ученик ошибётся.
                  </p>
                </li>
                <li className="card-block bg-[var(--background-2)]">
                  <div className="text-sm font-medium text-[var(--ink)]/55">
                    Носитель путунхуа
                  </div>
                  <p className="mt-2 text-sm leading-[1.55] text-[var(--muted-strong)]">
                    Даёт живую речь, культурный контекст и разговорную скорость,
                    к которой не привыкаешь по учебнику.
                  </p>
                </li>
                <li className="card-block bg-[var(--background-2)]">
                  <div className="text-sm font-medium text-[var(--ink)]/55">
                    AI-помощник в кабинете
                  </div>
                  <p className="mt-2 text-sm leading-[1.55] text-[var(--muted-strong)]">
                    Не заменяет преподавателя — держит ритм между уроками:
                    напоминает слабые слова, слушает произношение и поднимает
                    нужные задания в тренажёре.
                  </p>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* === REVIEWS (reused) ============================================== */}
      <ReviewsSection />

      {/* === FAQ ============================================================ */}
      <FAQSection
        items={faqs}
        title="Частые вопросы о репетиторе"
        description="Если не нашли свой вопрос — напишите, ответим в течение рабочего дня."
        schemaId="repetitor-faq"
      />

      {/* === CTA ============================================================ */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="tag-pill tag-pill-ink">Остались вопросы?</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
                Запишитесь на бесплатный пробный урок
              </h2>
              <p className="mt-4 text-base leading-7 text-white/85">
                60 минут с репетитором онлайн: проверим уровень, обсудим цели и
                покажем личный кабинет. Никаких автосписаний и подписок —
                продолжать или нет, решаете вы.
              </p>
            </div>
            <div className="grid gap-3 text-white">
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="text-[1.5rem] font-medium tracking-[-0.01em] leading-[1.2]"
              >
                {CONTACT_PHONE}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-base text-white/80"
              >
                {CONTACT_EMAIL}
              </a>
              <div className="mt-4 flex flex-wrap gap-3">
                <LeadModal
                  triggerClassName={buttonStyles({
                    variant: "secondary",
                    size: "large",
                  })}
                  source="repetitor-cta"
                >
                  Записаться
                </LeadModal>
                <Link
                  href="/price"
                  className={buttonStyles({
                    size: "large",
                    className: "bg-white/15 text-white hover:bg-white/25",
                  })}
                >
                  Цены и пакеты
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
