import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LeadForm from "@/components/forms/LeadForm";
import FAQSection from "@/components/sections/FAQSection";
import { buildMetadata } from "@/lib/metadata";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  LICENSE_DETAILS,
} from "@/lib/site-config";
import type { FaqItem } from "@/lib/site-data";

export const metadata: Metadata = buildMetadata({
  title: "Бесплатный пробный урок китайского языка — ChinaChild",
  description:
    "Бесплатный пробный урок китайского: преподаватель оценит уровень, подберёт курс и составит план. Запись на удобное время без обязательств.",
  path: "/free-trial",
  keywords: [
    "пробный урок китайского",
    "бесплатное занятие китайский",
    "первый урок китайского онлайн",
    "пробное занятие HSK",
  ],
});

const trialSteps = [
  {
    title: "Диагностика цели",
    body:
      "Преподаватель уточняет, зачем вам китайский: HSK, работа, переезд, путешествия, школа или разговорная практика. От цели зависит темп и набор материалов.",
    tone: "card-cream-soft" as const,
  },
  {
    title: "Проверка уровня",
    body:
      "Если вы уже учили китайский, смотрим произношение, пиньинь, тоны, чтение и базовую грамматику. Если стартуете с нуля, объясняем маршрут HSK 1–2.",
    tone: "card-sky-soft" as const,
  },
  {
    title: "Мини-урок",
    body:
      "Вы пробуете живой фрагмент занятия: как преподаватель объясняет, как исправляет ошибки и как работает платформа ChinaChild.",
    tone: "card-lime-soft" as const,
  },
  {
    title: "План на 4 недели",
    body:
      "В конце встречи вы получаете понятный первый план: сколько занятий в неделю, какой формат выбрать и когда реалистично выйти на следующий уровень.",
    tone: "card-peach-soft" as const,
  },
];

const trialFaqs: FaqItem[] = [
  {
    question: "Пробный урок действительно бесплатный?",
    answer:
      "Да. Пробный урок и консультация стоят 0 ₽. После встречи вы сами решаете, продолжать обучение или нет.",
  },
  {
    question: "Сколько длится пробный урок китайского?",
    answer:
      "Обычно 45–60 минут. Этого достаточно, чтобы оценить уровень, разобрать цель и показать формат занятий.",
  },
  {
    question: "Можно прийти с нуля?",
    answer:
      "Да. Если вы никогда не учили китайский, преподаватель покажет стартовый маршрут: пиньинь, 4 тона, первые фразы и базу HSK 1.",
  },
  {
    question: "Кто проводит пробное занятие?",
    answer:
      "Занятие проводит преподаватель или методист ChinaChild. Для произношения и разговорной практики можем подобрать носителя путунхуа.",
  },
  {
    question: "Нужно ли сразу оплачивать курс?",
    answer:
      "Нет. После пробного урока менеджер пришлёт варианты расписания и оплаты, а решение остаётся за вами.",
  },
];

export default function FreeTrialPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Пробный урок", path: "/free-trial" },
        ]}
      />

      {/* ===== HERO: intro on the left, light-gray form card on the right ===== */}
      <section className="page-shell-wide section-space">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="max-w-xl">
            <span className="tag-pill">Бесплатное занятие</span>
            <h1 className="mt-6 text-[2.25rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3rem]">
              Бесплатный пробный урок китайского
            </h1>
            <p className="mt-5 text-base leading-[1.55] text-[#4b4b4b]">
              За 60 минут с преподавателем-методистом вы поймёте текущий уровень,
              увидите формат занятий и получите первый план обучения. Встреча
              подходит тем, кто стартует с нуля, возвращается после перерыва или
              хочет готовиться к HSK без хаотичного набора материалов.
            </p>
            <ul className="mt-4 grid gap-2 text-base leading-[1.55] text-[#4b4b4b]">
              <li>— узнаете свой уровень по шкале HSK 1–6;</li>
              <li>— получите рекомендации по программе и темпу;</li>
              <li>— обсудите цели — туризм, работа, поступление в вуз КНР;</li>
              <li>— попробуете живое занятие в формате нашей школы.</li>
            </ul>

            <div className="mt-10 grid gap-3 text-sm">
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]"
              >
                {CONTACT_PHONE}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-base text-[#6b6b6b] hover:text-[#262626]"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-4 text-xs leading-[1.55] text-[#9a9a9a]">
                Без обязательств: после пробного занятия вы решаете, продолжать или нет.
                Никаких автосписаний и подписок.
              </p>
              <p className="text-xs leading-[1.55] text-[#9a9a9a]">
                Школа работает по лицензии № {LICENSE_DETAILS.registrationNumber}. После
                оплаты курса при соблюдении условий закона можно оформить социальный
                налоговый вычет; фактический возврат зависит от расходов и уплаченного НДФЛ.
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="card-block card-block-lg lead-form-wrap lead-form-wrap--gray">
              <header className="mb-6">
                <p className="text-[1.15rem] font-medium leading-[1.25] text-[#1b1b1b]">
                  Запишитесь на пробный урок
                </p>
                <p className="mt-1 text-sm leading-[1.45] text-[#4b4b4b]">
                  Заявки обрабатываем ежедневно с 09:00 до 21:00 по московскому
                  времени. Обычно отвечаем в течение 1–2 часов в этот период;
                  на ночные заявки — с начала следующего рабочего периода.
                </p>
              </header>
              <LeadForm source="free-trial-page" />
            </div>
          </aside>
        </div>
      </section>

      {/* ===== 4 STEPS ============================================== */}
      <section className="page-shell-wide section-space">
        <div className="max-w-2xl">
          <span className="tag-pill">Как пройдёт встреча</span>
          <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2rem]">
            Четыре шага за один пробный урок
          </h2>
          <p className="mt-3 text-base leading-[1.55] text-[#4b4b4b]">
            Никакой обязательной программы и продажи курса — встреча задумана как полезная
            короткая консультация, после которой понятно, что делать дальше.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trialSteps.map((step, index) => (
            <article key={step.title} className={`card-block h-full ${step.tone}`}>
              <span className="text-[2rem] font-medium leading-none tracking-[-0.02em] text-[#262626]/30">
                0{index + 1}
              </span>
              <h3 className="mt-5 text-[1.15rem] font-medium leading-[1.25] tracking-[-0.01em] text-[#262626]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.6] text-[#4b4b4b]">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ===== TAKEAWAY CARD ========================================== */}
      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet-soft">
          <h2 className="text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-[#262626] sm:text-[2rem]">
            Чем заканчивается пробный урок
          </h2>
          <div className="mt-6 grid gap-4 text-base leading-[1.65] text-[#4b4b4b] md:grid-cols-2">
            <p>
              Вы уходите не с общими словами, а с конкретным маршрутом: какой курс выбрать,
              сколько времени закладывать в неделю, какие слабые места закрыть первыми и
              как отслеживать прогресс. Для новичков это обычно связка пиньинь, тоны,
              первые 50 слов и базовые конструкции HSK 1.
            </p>
            <p>
              Если цель — экзамен, преподаватель покажет ближайшую ступень HSK и объяснит,
              какие задания надо тренировать: аудирование, чтение, письмо или устную часть.
              Если цель рабочая, сразу обсудим лексику под переговоры, переписку и созвоны.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses" className="btn-pill btn-ink">
              Посмотреть курсы
            </Link>
            <Link href="/chinese/hsk-test" className="btn-pill btn-white">
              Пройти тест HSK
            </Link>
          </div>
        </div>
      </section>

      <FAQSection
        id="free-trial-faq"
        title="Вопросы о пробном уроке"
        description="Короткие ответы перед записью."
        items={trialFaqs}
        schemaId="free-trial-faq-schema"
      />
    </main>
  );
}
