import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Методика ChinaChild: платформа, AI-тренажёр и носители китайского",
    description:
      "Как устроено обучение китайскому в ChinaChild: собственная платформа без Zoom, WebRTC-уроки, HD-записи, AI-анализ тонов, тренажёр и связка методиста, носителя путунхуа и AI-ассистента.",
    path: "/methodology",
    keywords: [
      "методика обучения китайскому",
      "онлайн школа китайского платформа",
      "AI тренажёр китайского",
      "китайский с носителем онлайн",
      "подготовка HSK методика",
      "произношение китайского тоны",
    ],
  });
}

const platformFeatures = [
  {
    title: "Видеоуроки внутри кабинета",
    body:
      "Звонок открывается в браузере по WebRTC. Ученик не ставит Zoom, не ищет ссылку в мессенджере и не теряет урок из-за обновления приложения.",
  },
  {
    title: "Мессенджер с куратором и преподавателем",
    body:
      "Вопрос по домашке, фото иероглифа, голосовое с тонами, перенос занятия - всё остаётся в одном учебном чате, а не расползается по разным каналам.",
  },
  {
    title: "Расписание и Google Calendar",
    body:
      "Занятия видны в личном кабинете, синхронизируются с календарём и напоминают о себе заранее. Это снижает пропуски, особенно у школьников.",
  },
  {
    title: "HD-записи каждого урока",
    body:
      "После занятия запись попадает в кабинет. Можно пересмотреть объяснение грамматики, свою ошибку в тоне или диалог с носителем перед экзаменом.",
  },
];

const aiSignals = [
  "какие тоны студент стабильно путает: например 2-й и 3-й в быстрых фразах",
  "какие слова узнал в тесте, но не смог произнести в диалоге",
  "где ломается ритм фразы: слишком длинная пауза, русская интонация, потеря ударения",
  "какие иероглифы похожи визуально и смешиваются при письме",
];

const trainerModes = [
  {
    title: "Тоны через микрофон",
    body:
      "Студент произносит слог или фразу, тренажёр показывает, где тон пошёл вверх, провалился или стал русским ударением.",
  },
  {
    title: "Иероглифы от руки",
    body:
      "Платформа проверяет не только финальную форму, но и порядок черт. Это важно: неправильная моторика потом мешает скорости письма.",
  },
  {
    title: "AI-собеседник",
    body:
      "Ресторан, дорога, знакомство, покупка билета: ученик говорит вслух, получает ответ и видит, какие фразы стоит повторить завтра.",
  },
];

const teachers = [
  {
    role: "Русскоязычный методист",
    name: "Анастасия Пономарёва",
    detail:
      "Выпускница Даляньского университета иностранных языков. Ставит фонетику, объясняет грамматику через русский язык и заранее знает, где русскоязычный ученик ошибётся.",
    href: "/team/anastasia-ponomareva",
    card: "card-cream",
  },
  {
    role: "Носитель путунхуа",
    name: "Чжао Ли",
    detail:
      "Преподаватель-носитель, сертификат HSK 6, Хэбэй. Даёт живую речь, культурный контекст, естественные реакции и разговорную скорость.",
    href: "/team/zhao-li",
    card: "card-sky",
  },
  {
    role: "AI-ассистент",
    name: "Работает 24/7",
    detail:
      "Не заменяет преподавателя, а держит ритм между уроками: напоминает слабые слова, слушает произношение и поднимает нужные задания.",
    href: "/blog/ai-trainer-chinese-pronunciation",
    card: "card-lime-soft",
  },
];

const practiceScenarios = [
  "диалог в паре: заказать лапшу, уточнить цену, попросить без острого",
  "спонтанный вопрос преподавателя без подготовки по учебнику",
  "роль с носителем: такси, ресепшен, знакомство, короткий small talk",
  "мини-презентация на 60 секунд: семья, работа, город, планы",
];

const repetitionSteps = [
  {
    day: "7 дней",
    title: "Первое возвращение",
    body:
      "Слово ещё свежее, но уже начинает выпадать. AI добавляет его в микс тренажёра и проверяет узнавание на слух.",
  },
  {
    day: "30 дней",
    title: "Переход в актив",
    body:
      "Платформа просит не выбрать перевод, а произнести фразу или написать иероглиф. Преподаватель видит, где слово осталось пассивным.",
  },
  {
    day: "90 дней",
    title: "Закрепление перед уровнем",
    body:
      "Старые слова возвращаются в диалог и пробный HSK. Так студент не приходит к экзамену с дырой в материале первого месяца.",
  },
];

const methodologyHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": `${absoluteUrl("/methodology")}#how-to`,
  name: "Как работает методика ChinaChild",
  description:
    "Пошаговая система обучения китайскому: диагностика, платформа, урок, AI-анализ, тренажёр, практика с носителем и спиральное повторение.",
  totalTime: "P6M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Определяем цель и стартовый уровень",
      text: "На пробном занятии фиксируем цель: HSK, разговорный китайский, поступление, работа или школьная поддержка.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Даём доступ к личному кабинету",
      text: "Ученик получает видеозвонки, чат, расписание, записи уроков и тренажёр в одном интерфейсе.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Проводим урок с 70% практики",
      text: "Мини-группа до 5 человек даёт каждому время говорить, ошибаться и получать обратную связь.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "AI анализирует запись и транскрипт",
      text: "Система находит слабые тоны, слова и ритм фраз, затем корректирует домашние задания.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Закрепляем между уроками",
      text: "30 минут в день в тренажёре закрывают провал между занятиями: тоны, иероглифы, диалоги и повторение.",
    },
  ],
  url: absoluteUrl("/methodology"),
  provider: { "@id": `${SITE_URL}/#organization` },
};

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <span className="tag-pill">{eyebrow}</span> : null}
      <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-[1.65] text-[#4b4b4b]">{description}</p>
      ) : null}
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Методика", path: "/methodology" },
        ]}
      />
      <JsonLd data={methodologyHowTo} id="methodology-how-to" />

      <PageHero
        eyebrow="Методика ChinaChild"
        title="Китайский учат не в Zoom, а в системе"
        description="У нас своя платформа, AI-анализ уроков, тренажёр между занятиями, русскоязычный методист и носитель путунхуа. Поэтому курс не разваливается на «урок прошёл — дальше как-нибудь сам»: каждый день у ученика есть понятный следующий шаг."
        primaryCta={{ label: "Записаться на пробное", modal: true, defaultCourse: "hsk-preparation" }}
        secondaryCta={{ label: "Результаты учеников", href: "/results" }}
        illustration="/heroes/methodology.webp"
        illustrationAlt="Иероглиф 学 и методика обучения китайскому языку в ChinaChild"
        illustrationWidth={1289}
        illustrationHeight={1221}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="card-block card-block-lg card-ink h-full">
              <span className="tag-pill tag-pill-ink">Собственная платформа</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
                Один логин вместо пяти ссылок
              </h2>
              <p className="mt-5 text-base leading-7 text-white/85">
                Ученик не получает ссылку на Zoom и отдельный чат «где-то в Telegram».
                Занятие, расписание, сообщения, домашка, записи и тренажёр живут в одном
                личном кабинете. Это звучит технически, но в обучении даёт простую вещь:
                меньше трения - больше регулярности.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {platformFeatures.map((feature) => (
              <Reveal key={feature.title}>
                <article className="card-block card-cream h-full">
                  <h3 className="text-[1.25rem] font-medium leading-[1.2] text-[#262626]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.6] text-[#4b4b4b]">{feature.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-violet-soft">
          <SectionTitle
            eyebrow="AI-персонализация"
            title="AI смотрит не на средний уровень группы, а на вашу конкретную ошибку"
            description="Каждый урок записывается и транскрибируется. После занятия платформа разбирает речь студента: не «плохо с произношением», а конкретно - какие тоны, слова и фразы надо вернуть завтра."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {aiSignals.map((signal, index) => (
              <Reveal key={signal}>
                <div className="rounded-[16px] bg-white/65 p-5">
                  <div className="text-sm font-semibold text-[#6b6b6b]">0{index + 1}</div>
                  <p className="mt-3 text-base leading-[1.6] text-[#262626]">{signal}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 max-w-4xl text-base leading-[1.65] text-[#4b4b4b]">
            На основе этого домашнее задание меняется. Если студент три раза сказал
            <span className="font-semibold text-[#262626]"> qù</span> как русский «чу»,
            завтра тренажёр даст именно этот звук в разных словах, а куратор увидит подсказку:
            начать следующий урок с короткой фонетической разминки.
          </p>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <SectionTitle
          eyebrow="Между уроками"
          title="30 минут в день закрывают главный провал онлайн-обучения"
          description="Большинство учеников тормозит не на уроке, а между уроками: два дня ничего не делал, забыл слова, пришёл снова начинать с нуля. Поэтому тренажёр встроен в платформу и даёт короткую ежедневную работу."
        />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {trainerModes.map((mode) => (
            <Reveal key={mode.title}>
              <article className="card-block card-lime-soft h-full">
                <h3 className="text-[1.25rem] font-medium leading-[1.2] text-[#262626]">
                  {mode.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.6] text-[#4b4b4b]">{mode.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <SectionTitle
          eyebrow="Три уровня преподавания"
          title="Методист объясняет, носитель оживляет, AI держит ритм"
          description="Китайский сложно выучить одним типом преподавания. Русскоязычному ученику нужен человек, который объяснит логику через русский язык, носитель для живой речи и инструмент, который не устаёт повторять одно и то же между уроками."
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Reveal key={teacher.name}>
              <article className={`card-block h-full ${teacher.card}`}>
                <div className="tag-pill">{teacher.role}</div>
                <h3 className="mt-5 text-[1.35rem] font-medium leading-[1.2] text-[#262626]">
                  {teacher.name}
                </h3>
                <p className="mt-4 text-sm leading-[1.65] text-[#4b4b4b]">{teacher.detail}</p>
                <Link
                  href={teacher.href}
                  className="mt-6 inline-flex text-sm font-semibold text-[#262626] underline-offset-4 hover:underline"
                >
                  Подробнее
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="card-block card-block-lg card-sky h-full">
              <span className="tag-pill">70% практика</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
                Мини-группа до 5 человек - это методическое решение, а не формат «подешевле»
              </h2>
              <p className="mt-5 text-base leading-[1.65] text-[#4b4b4b]">
                На китайском нельзя «насмотреться» и заговорить. Нужно произносить,
                ошибаться, слышать исправление и снова произносить. В группе на 30-50 человек
                ученик слушает вебинар. В мини-группе каждый получает время говорить.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-4">
            {practiceScenarios.map((scenario) => (
              <Reveal key={scenario}>
                <div className="card-block card-cream">
                  <p className="text-base leading-[1.6] text-[#262626]">{scenario}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-cream-soft">
          <SectionTitle
            eyebrow="Спиральное повторение"
            title="Слово возвращается через 7, 30 и 90 дней"
            description="Мы не считаем слово выученным после одного теста. Новая лексика возвращается в тренажёр, диалоги и уроки по расписанию. AI отслеживает забывание автоматически, а преподаватель видит статистику перед занятием."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {repetitionSteps.map((step) => (
              <Reveal key={step.day}>
                <article className="rounded-[18px] bg-white/70 p-6">
                  <div className="text-sm font-semibold text-[#6b6b6b]">{step.day}</div>
                  <h3 className="mt-4 text-[1.2rem] font-medium leading-[1.2] text-[#262626]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.6] text-[#4b4b4b]">{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-ink">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <span className="tag-pill tag-pill-ink">Пробный урок</span>
              <h2 className="mt-5 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
                Посмотрите методику вживую, а не в описании
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/85">
                На пробном занятии мы покажем личный кабинет, проверим произношение,
                определим стартовый уровень и объясним, какой маршрут быстрее приведёт к
                вашей цели: разговор, HSK, учёба в Китае или работа.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <LeadModal
                triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
                source="methodology-cta"
                defaultCourse="hsk-preparation"
              >
                Записаться на пробное
              </LeadModal>
              <Link
                href="/results"
                className={buttonStyles({
                  size: "large",
                  className: "bg-white/15 text-white hover:bg-white/25",
                })}
              >
                Результаты учеников
              </Link>
              <Link
                href="/blog/online-platform-video-calls-chat"
                className={buttonStyles({
                  size: "large",
                  className: "bg-white/15 text-white hover:bg-white/25",
                })}
              >
                О платформе
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
