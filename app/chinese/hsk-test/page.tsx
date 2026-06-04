import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import FAQSection from "@/components/sections/FAQSection";
import LeadModal from "@/components/forms/LeadModal";
import JsonLd from "@/components/seo/JsonLd";
import { buttonStyles } from "@/components/ui/button";
import HskHeroHanzi from "@/components/hsk-test/HskHeroHanzi";
import LevelGrid from "@/components/hsk-test/LevelGrid";
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
    <main>
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graph} id="hsk-test-landing-graph" />

      {/* Block 1 — Hero */}
      <section className="page-shell-wide hsk-test-landing-hero-wrap">
        <div className="card-block card-violet hsk-test-landing-hero">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <span className="eyebrow eyebrow-on-light">Бесплатно · без регистрации</span>
              <h1 className="mt-4 text-[2rem] font-normal leading-[1.05] tracking-[-0.03em] text-[#1b1b1b] sm:text-[2.75rem] lg:text-[3.5rem]">
                Тест на уровень HSK онлайн — определите свой уровень китайского за 10 минут
              </h1>
              <p className="mt-4 max-w-[640px] text-base leading-[1.5] text-[#1b1b1b] sm:text-[17px]">
                Бесплатный онлайн-тест по методике HSK и YCT. Проверим словарный запас, грамматику, чтение и базовое понимание текста. По итогам — рекомендация курса под ваш уровень и сертификат, которым можно поделиться.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="#levels"
                  className={buttonStyles({ size: "large" })}
                >
                  Начать тест
                </Link>
                <Link
                  href="#faq"
                  className={buttonStyles({ variant: "ghost", size: "large" })}
                >
                  Как работает тест
                </Link>
              </div>
              <ul className="hsk-test-trust">
                <li className="hsk-test-trust-item">
                  <span>4.7 / 5 — оценка студентов</span>
                </li>
                <li className="hsk-test-trust-item">
                  <span>5–10 минут</span>
                </li>
                <li className="hsk-test-trust-item">
                  <span>5000+ студентов прошли тест</span>
                </li>
              </ul>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <HskHeroHanzi hanzi="你" size={260} />
            </div>
          </div>
        </div>
      </section>

      {/* Block 2 — What HSK is (SEO text) */}
      <section className="page-shell-wide hsk-test-landing-section" id="what-is-hsk">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em] text-[#1b1b1b] sm:text-[2.25rem]">
              Что такое HSK и зачем нужен тест уровня
            </h2>
          </div>
          <div className="text-[#3a3a3a] text-base leading-[1.65] sm:text-[16px]">
            <p>
              <strong>HSK</strong> (Hanyu Shuiping Kaoshi, 汉语水平考试) — официальный экзамен на знание китайского как иностранного. Его администрирует Hanban / Chinese Testing International при поддержке Министерства образования КНР. Сертификат HSK признают по всему миру: его требуют китайские университеты при поступлении, многие компании — для рабочей визы и контрактов с китайскими партнёрами.
            </p>
            <p className="mt-4">
              Классическая шкала HSK включает шесть уровней. Уровни HSK 1 (≈ A1 по CEFR) и HSK 2 (A2) — это бытовая лексика и простые фразы. HSK 3 (B1) — связные диалоги, переписка и базовое чтение. HSK 4 (B2) — рабочие темы, развёрнутые рассуждения и понимание адаптированных СМИ. HSK 5 и 6 — продвинутый и почти профессиональный уровень. Параллельно для детей и младших школьников действует серия YCT 1–4 — с теми же ступенями сложности, но мягче по подаче.
            </p>
            <h3 className="mt-8 text-[1.25rem] font-medium leading-[1.2] text-[#1b1b1b]">
              Как определить свой уровень китайского
            </h3>
            <p className="mt-3">
              Самый быстрый и честный способ — пройти онлайн-тест по типовой структуре HSK. В нашем тесте 10 или 20 вопросов на четыре навыка: <strong>лексику</strong> (узнавание иероглифов, перевод), <strong>грамматику</strong> (заполнение пропусков, выбор структуры), <strong>чтение</strong> (короткие тексты с вопросами) и <strong>понимание</strong> (сборка предложений, сопоставление пар). Сложные задания весят больше простых — это даёт точный балл, который соответствует уровню HSK 1, HSK 2, HSK 3 или HSK 4.
            </p>
            <h3 className="mt-8 text-[1.25rem] font-medium leading-[1.2] text-[#1b1b1b]">
              Сколько слов нужно знать
            </h3>
            <p className="mt-3">
              Базовый словарный запас HSK: HSK 1 — 150 слов и 174 иероглифа, HSK 2 — 300/347, HSK 3 — 600/617, HSK 4 — 1200/1064. После HSK 4 объём растёт быстрее: HSK 5 — около 2500 слов, HSK 6 — 5000+. Поэтому если вы целитесь в учёбу в Китае, работодателя или экзамен в аккредитованном центре, важно начать с честной оценки текущей точки.
            </p>
          </div>
        </div>
      </section>

      {/* Block 3 — Level cards */}
      <section className="page-shell-wide hsk-test-landing-section" id="levels">
        <div className="text-center">
          <h2 className="text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em] text-[#1b1b1b] sm:text-[2.25rem]">
            Какой у вас уровень HSK?
          </h2>
          <p className="mx-auto mt-3 max-w-[620px] text-base leading-[1.5] text-[#4b4b4b] sm:text-[17px]">
            Выберите уровень, который хотите подтвердить. Если не уверены — начните с HSK 1: тест покажет, где вы сейчас и какой следующий шаг даст рост.
          </p>
        </div>
        <div className="mt-8">
          <LevelGrid />
        </div>
      </section>

      {/* Block 7 — FAQ */}
      <section id="faq">
        <FAQSection
          title="Частые вопросы про HSK и тест уровня"
          description="Если не нашли ответа — напишите, и куратор подскажет, какой уровень подойдёт именно вам."
          items={hskTestFaq}
          schema={false}
          schemaId="hsk-test-faq"
        />
      </section>

      {/* Block 8 — Final CTA */}
      <section className="page-shell-wide hsk-test-landing-section" id="apply">
        <div className="card-block card-ink">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl">
                Не хотите ждать результата теста? Оставьте заявку — куратор подберёт курс
              </h2>
              <p className="mt-4 max-w-[560px] text-base leading-[1.55] text-white/85 sm:text-lg">
                Расскажем, какие группы открыты сейчас, посчитаем стоимость с налоговым вычетом и подберём преподавателя под цель: HSK, учёба в Китае или работа с китайскими партнёрами.
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
