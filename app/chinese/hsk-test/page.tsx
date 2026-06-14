import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import FAQSection from "@/components/sections/FAQSection";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import LevelGrid from "@/components/hsk-test/LevelGrid";
import TestArt from "@/components/hsk-test/TestArt";
import HeroPeople from "@/components/hsk-test/HeroPeople";
import ResultPreview from "@/components/hsk-test/ResultPreview";
import StepCards from "@/components/hsk-test/StepCards";
import { hskTestFaq } from "@/lib/hsk-test/faq";
import { buildMetadata } from "@/lib/metadata";
import {
  createBreadcrumbNode,
  createFaqNode,
  type JsonLd as JsonLdType,
} from "@/lib/schema";
import { absoluteUrl, SITE_URL } from "@/lib/site-config";

const PAGE_PATH = "/chinese/hsk-test";

export const metadata: Metadata = buildMetadata({
  title: "Тест на уровень HSK онлайн бесплатно — Яндекс Практикум ChinaChild",
  description:
    "Пройдите бесплатный тест HSK онлайн за 10 минут. Определим ваш уровень китайского от HSK 1 до HSK 4 по словарному запасу, грамматике и чтению.",
  path: PAGE_PATH,
  keywords: [
    "тест на уровень HSK",
    "HSK тест онлайн",
    "проверить уровень китайского",
    "определить уровень HSK",
    "HSK 1 тест",
    "HSK 2 тест",
    "HSK 3 тест",
    "HSK 4 тест",
    "экзамен HSK онлайн",
    "тест по китайскому",
  ],
});

const breadcrumbs = [
  { name: "Главная", path: "/" },
  { name: "Китайский", path: "/courses" },
  { name: "Тест на уровень HSK", path: PAGE_PATH },
];

/** «Что даст тест» — 4 интерактивные карточки (Praktikum). `long` — текст,
 *  который раскрывается по клику. */
const STEPS: { key: string; art: string; title: string; long: string }[] = [
  {
    key: "ask",
    art: "shape-masks",
    title: "Зададим вопросы по 4 навыкам",
    long: "Это не случайный набор: задания собраны по официальной шкале HSK 1–4 — лексика, грамматика, чтение и понимание на слух — и идут от простого к сложному, чтобы точно поймать ваш уровень.",
  },
  {
    key: "score",
    art: "shape-spinner",
    title: "Посчитаем ответы с весом по сложности",
    long: "Каждый ответ считается с весом по сложности: чтение и грамматика весят больше простых сопоставлений. Поэтому итоговый балл отражает реальный уровень, а не везение в угадывании.",
  },
  {
    key: "level",
    art: "shape-folder",
    title: "Покажем уровень HSK и разбор",
    long: "Вы увидите свой уровень от HSK 1 до HSK 4, проценты по четырём навыкам и где именно проседаете — лексика, грамматика, чтение или аудирование.",
  },
  {
    key: "course",
    art: "shape-toggle",
    title: "Подберём курс под ваш уровень",
    long: "По итогам подскажем программу под ваш уровень и следующий шаг. Начать учиться можно сразу — бесплатно, без регистрации и долгого ожидания.",
  },
];

export default function HskTestLandingPage() {
  const url = absoluteUrl(PAGE_PATH);

  const graph: JsonLdType = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "Тест на уровень HSK онлайн",
        description:
          "Бесплатный онлайн-тест на уровень HSK от 1 до 4: лексика, грамматика, чтение.",
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
        ...createFaqNode(hskTestFaq),
        "@id": `${url}#faq`,
      },
      {
        "@type": "Quiz",
        "@id": `${url}#quiz`,
        name: "Тест на уровень HSK 1–4",
        description:
          "Интерактивный тест на знание китайского языка: 10 или 20 вопросов с заданиями на лексику, грамматику, чтение и понимание текста. Бесплатно, без регистрации.",
        url,
        inLanguage: "ru-RU",
        learningResourceType: "Quiz",
        educationalLevel: "HSK 1 (CEFR A1) — HSK 4 (CEFR B2)",
        about: ["HSK", "Chinese language", "Mandarin"],
        provider: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: true,
        typicalAgeRange: "12-",
      },
    ],
  };

  return (
    <main className="hsk-promo-page">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graph} id="hsk-test-landing-graph" />

      {/* Block 1 — Hero (full-bleed black, Praktikum promo) */}
      <section className="hsk-promo-hero-bleed">
        <div className="hsk-promo-hero">
          <HeroPeople />
          <h1 className="hsk-promo-hero-title">
            Узнайте свой уровень китайского
          </h1>
          <p className="hsk-promo-hero-sub">
            с помощью бесплатного теста по официальной методике HSK 1–4
          </p>
          <div className="hsk-promo-hero-cta">
            <Link
              href="#levels"
              className={buttonStyles({ size: "large" })}
              data-floating-cta-suppress="true"
            >
              Начать тест
            </Link>
          </div>
          <p className="hsk-promo-hero-note">
            ≈ 10 минут · бесплатно · без регистрации
          </p>
        </div>
      </section>

      {/* Block 2 — «Что даст тест» cards (Praktikum — cards-first, no heading) */}
      <section className="page-shell-wide hsk-steps-section" id="how">
        <StepCards steps={STEPS} />
      </section>

      {/* Block 4 — Methodology (gradient card, Praktikum «Авторы теста») */}
      <section className="page-shell-wide hsk-promo-methodology">
        <div className="card-block card-block-lg hsk-promo-gradient">
          <div className="hsk-promo-gradient-body">
            <TestArt name="rings" alt="" className="hsk-promo-rings" />
            <h2 className="hsk-promo-gradient-title">
              Вопросы составлены по структуре экзамена HSK
            </h2>
            <p className="hsk-promo-gradient-text">
              Задания собраны по официальной шкале HSK 1–4: лексика, грамматика,
              чтение и аудирование. Преподаватели ChinaChild подобрали их так,
              чтобы итоговый балл отражал реальный уровень, а не везение в
              угадывании.
            </p>
          </div>
        </div>
      </section>

      {/* Block 5 — Result section: one cohesive dark band, heading + big mockup */}
      <section className="page-shell-wide hsk-result-block">
        <div className="hsk-result-section">
          <h2 className="hsk-result-title">
            Вот так выглядит
            <br />
            <span>ваш результат</span>
          </h2>
          <div className="hsk-result-mockup">
            <ResultPreview />
          </div>
        </div>
      </section>

      {/* Block 6 — FAQ (Praktikum «Отвечаем на вопросы») */}
      <section id="faq">
        <FAQSection
          title="Частые вопросы про HSK и тест уровня"
          description="Если не нашли ответа — напишите, и куратор подскажет, какой уровень подойдёт именно вам."
          items={hskTestFaq}
          schema={false}
          schemaId="hsk-test-faq"
        />
      </section>

      {/* Block 7 — Level cards (your entry point; Praktikum has none) */}
      <section
        className="page-shell-wide hsk-test-landing-section"
        id="levels"
        data-floating-cta-suppress="true"
      >
        <div className="text-center">
          <h2 className="text-[1.875rem] font-normal leading-[1.1] tracking-[-0.02em] text-[#1b1b1b] sm:text-[2.75rem]">
            Какой у вас уровень HSK?
          </h2>
          <p className="mx-auto mt-3 max-w-[620px] text-base leading-[1.5] text-[#4b4b4b] sm:text-[17px]">
            Выберите уровень, который хотите подтвердить. Если не уверены — начните
            с HSK 1: тест покажет, где вы сейчас и какой следующий шаг даст рост.
          </p>
        </div>
        <div className="mt-8">
          <LevelGrid />
        </div>
      </section>

      {/* Block 7 — What HSK is (SEO text) */}
      <section
        className="page-shell-wide hsk-test-landing-section"
        id="what-is-hsk"
      >
        <div className="mx-auto max-w-[760px]">
          <h2 className="text-center text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em] text-[#1b1b1b] sm:text-[2rem]">
            Что такое HSK и зачем нужен тест уровня
          </h2>
          <div className="mt-6 text-[#3a3a3a] text-base leading-[1.7] sm:text-[17px]">
            <p>
              <strong>HSK</strong> (Hanyu Shuiping Kaoshi, 汉语水平考试) —
              официальный экзамен на знание китайского как иностранного. Его
              администрирует Hanban / Chinese Testing International при поддержке
              Министерства образования КНР. Сертификат HSK признают по всему миру:
              его требуют китайские университеты при поступлении, многие компании —
              для рабочей визы и контрактов с китайскими партнёрами.
            </p>
            <p className="mt-4">
              Классическая шкала HSK включает шесть уровней. Уровни HSK 1 (≈ A1 по
              CEFR) и HSK 2 (A2) — это бытовая лексика и простые фразы. HSK 3 (B1) —
              связные диалоги, переписка и базовое чтение. HSK 4 (B2) — рабочие
              темы, развёрнутые рассуждения и понимание адаптированных СМИ. HSK 5 и
              6 — продвинутый и почти профессиональный уровень. Параллельно для
              детей и младших школьников действует серия YCT 1–4 — с теми же
              ступенями сложности, но мягче по подаче.
            </p>
            <h3 className="mt-8 text-[1.25rem] font-medium leading-[1.2] text-[#1b1b1b]">
              Как определить свой уровень китайского
            </h3>
            <p className="mt-3">
              Самый быстрый и честный способ — пройти онлайн-тест по типовой
              структуре HSK. В нашем тесте 10 или 20 вопросов на четыре навыка:{" "}
              <strong>лексику</strong> (узнавание иероглифов, перевод),{" "}
              <strong>грамматику</strong> (заполнение пропусков, выбор структуры),{" "}
              <strong>чтение</strong> (короткие тексты с вопросами) и{" "}
              <strong>понимание</strong> (сборка предложений, сопоставление пар).
              Сложные задания весят больше простых — это даёт точный балл, который
              соответствует уровню HSK 1, HSK 2, HSK 3 или HSK 4.
            </p>
            <h3 className="mt-8 text-[1.25rem] font-medium leading-[1.2] text-[#1b1b1b]">
              Сколько слов нужно знать
            </h3>
            <p className="mt-3">
              Базовый словарный запас HSK: HSK 1 — 150 слов и 174 иероглифа, HSK 2
              — 300/347, HSK 3 — 600/617, HSK 4 — 1200/1064. После HSK 4 объём
              растёт быстрее: HSK 5 — около 2500 слов, HSK 6 — 5000+. Поэтому если
              вы целитесь в учёбу в Китае, работодателя или экзамен в
              аккредитованном центре, важно начать с честной оценки текущей точки.
            </p>
          </div>
        </div>
      </section>

      {/* Block 9 — Final CTA */}
      <section className="page-shell-wide hsk-test-landing-section" id="apply">
        <div className="card-block card-ink">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl">
                Не хотите ждать результата теста? Оставьте заявку — куратор
                подберёт курс
              </h2>
              <p className="mt-4 max-w-[560px] text-base leading-[1.55] text-white/85 sm:text-lg">
                Расскажем, какие группы открыты сейчас, посчитаем стоимость с
                налоговым вычетом и подберём преподавателя под цель: HSK, учёба в
                Китае или работа с китайскими партнёрами.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <LeadModal
                triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
                source="hsk-test-landing"
                defaultCourse="hsk-preparation"
                suppressFloatingCta
              >
                Оставить заявку
              </LeadModal>
              <Link
                href="/courses/hsk-preparation"
                className={buttonStyles({
                  size: "large",
                  className: "bg-white/15 text-white hover:bg-white/25",
                })}
              >
                Все курсы HSK
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
