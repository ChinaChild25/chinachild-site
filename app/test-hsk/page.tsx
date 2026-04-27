import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import { ChartUp, GlobeCharacter, HskCoin, PercentMedal } from "@/components/decor/Decor";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL, SITE_URL } from "@/lib/site-config";
import { createFaqSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Тест на уровень китайского HSK 1–4 онлайн | ChinaChild",
    description:
      "Бесплатный онлайн-тест на уровень китайского языка по системе HSK. 25 вопросов с вариантами ответа — определим ваш уровень за 10 минут и подберём подходящий курс.",
    path: "/test-hsk",
    keywords: [
      "тест на уровень китайского",
      "тест HSK онлайн",
      "узнать уровень китайского",
      "проверить уровень HSK",
      "HSK 1 тест",
      "HSK 2 тест",
      "HSK 3 тест",
      "HSK 4 тест",
    ],
  });
}

const testFaqs = [
  {
    question: "Сколько длится тест на уровень HSK?",
    answer:
      "Тест состоит из 25 вопросов с вариантами ответа. На прохождение нужно 10–15 минут. Если у вас нет даже примерного представления об уровне, рекомендуем начать с уровня HSK 1 и постепенно повышать сложность.",
  },
  {
    question: "Что я узнаю после теста?",
    answer:
      "По результату теста вы поймёте, какой курс ChinaChild подходит вашему уровню — HSK 1, HSK 2, HSK 3 или HSK 4. Вместе с результатом мы дадим рекомендации по программе и формату занятий.",
  },
  {
    question: "Тест на уровень бесплатный?",
    answer:
      "Да, тестирование полностью бесплатное. Никаких предоплат, регистрационных взносов и обязательных покупок — это инструмент диагностики уровня перед записью на курс.",
  },
  {
    question: "Чем тест отличается от настоящего экзамена HSK?",
    answer:
      "Это диагностический тест школы ChinaChild. Он построен по логике официального экзамена, но не заменяет международный сертификат. Сдать настоящий экзамен HSK можно в Институтах Конфуция при российских вузах.",
  },
];

const testLinks = [
  { level: "HSK 1", href: `${SITE_URL}/test-hsk-1`, card: "card-violet-soft" },
  { level: "HSK 2", href: `${SITE_URL}/test-hsk-2`, card: "card-cream" },
  { level: "HSK 3", href: `${SITE_URL}/test-hsk-3`, card: "card-lime-soft" },
  { level: "HSK 4", href: `${SITE_URL}/test-hsk-4`, card: "card-sky" },
];

export default function HskTestLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Тест HSK", path: "/test-hsk" },
        ]}
      />
      <JsonLd data={createFaqSchema(testFaqs)} id="test-hsk-faq" />

      <PageHero
        variant="lime"
        eyebrow="Бесплатно · 10 минут"
        title="Тест на уровень китайского языка HSK"
        description="25 вопросов с вариантами ответа. По результату узнаете свой уровень — HSK 1, 2, 3 или 4 — и получите рекомендацию по подходящему курсу ChinaChild."
        primaryCta={{ label: "Начать тест", href: `${SITE_URL}/test-hsk-1`, external: true }}
        secondaryCta={{ label: "Курсы HSK", href: "/hsk" }}
      />

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {testLinks.map((t) => (
            <Link
              key={t.level}
              href={t.href}
              target="_blank"
              rel="noreferrer"
              className={`card-block group relative flex h-full flex-col overflow-hidden transition hover:-translate-y-1 ${t.card}`}
            >
              <span className="tag-pill">{t.level}</span>
              <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                Тест на уровень {t.level}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">
                25 вопросов с вариантами ответа. Узнаете, готовы ли вы к программе уровня {t.level}.
              </p>
              <div className="mt-auto pt-6 text-sm font-semibold text-[#1b1b1b] underline-offset-4 group-hover:underline">
                Пройти тест →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="card-block card-cream-soft relative overflow-hidden">
            <HskCoin className="absolute -right-4 -bottom-4 h-32 w-32 opacity-90" />
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">25 вопросов</h3>
            <p className="mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">
              На каждый вопрос предлагается несколько вариантов ответа, но только один из них правильный.
            </p>
          </article>
          <article className="card-block card-violet-soft relative overflow-hidden">
            <ChartUp className="absolute -right-4 -bottom-4 h-32 w-36 opacity-95" />
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">Чёткий результат</h3>
            <p className="mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">
              По итогу теста вы получаете рекомендацию: с какого курса ChinaChild начать обучение.
            </p>
          </article>
          <article className="card-block card-sky relative overflow-hidden">
            <GlobeCharacter className="absolute -right-4 -bottom-4 h-32 w-32 opacity-95" />
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">Без регистрации</h3>
            <p className="mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">
              Запускайте тест прямо сейчас — без e-mail, телефона и обязательных полей. Никаких предоплат.
            </p>
          </article>
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="card-block card-block-lg card-violet relative overflow-hidden">
          <PercentMedal value="13%" className="pointer-events-none absolute -right-8 -bottom-8 h-48 w-40 opacity-95" />
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                Прошли тест? Запишитесь на пробный урок
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
                Преподаватель оценит ваш уровень в живой беседе, поможет поставить цель и
                подобрать курс ChinaChild под ваш темп. Лицензия Москвы — налоговый вычет 13%
                до 15 600 ₽ в год.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={REGISTER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ size: "large", variant: "secondary" })}
                >
                  Записаться на пробное
                </Link>
                <Link href="/kursy" className={buttonStyles({ size: "large", className: "bg-white/15 text-white hover:bg-white/25" })}>
                  Смотреть курсы
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
