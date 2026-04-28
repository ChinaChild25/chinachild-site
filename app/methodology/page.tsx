import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Методика обучения китайскому языку в ChinaChild",
    description:
      "Методика школы ChinaChild: лицензированная программа HSK 1–2, поэтапное освоение фонетики, лексики, грамматики, аудирования, чтения и говорения. Личный кабинет с записями уроков.",
    path: "/methodology",
    keywords: [
      "методика обучения китайскому",
      "программа китайского языка",
      "методика HSK",
      "как учат китайский в школе",
    ],
  });
}

const stages = [
  {
    title: "Фонетика и пиньинь",
    body:
      "Первые две недели посвящены постановке тонов и системе пиньинь. Без правильного произношения дальнейшее обучение теряет эффективность, поэтому фонетика — фундамент всей программы.",
    card: "card-violet-soft",
  },
  {
    title: "Базовая лексика и иероглифика",
    body:
      "150 слов и 174 иероглифа уровня HSK 1. Иероглифы изучаются в контексте слов и фраз, а не списком — это даёт устойчивое запоминание формы, звучания и значения одновременно.",
    card: "card-cream",
  },
  {
    title: "Грамматика в действии",
    body:
      "Порядок слов, частицы, отрицание, вопросительные конструкции, счётные слова, времена. Грамматика подаётся через диалоги и упражнения, а не списком правил.",
    card: "card-lime-soft",
  },
  {
    title: "Аудирование и чтение",
    body:
      "Адаптированные тексты, диалоги, аудиозаписи носителей. К концу курса HSK 2 ученик понимает медленную речь и читает простые тексты с поддержкой пиньиня.",
    card: "card-sky",
  },
  {
    title: "Говорение и живая практика",
    body:
      "70% занятия — разговорная практика. В мини-группе до 5 человек у каждого ученика хватает времени на речь, разбор ошибок и обратную связь от преподавателя.",
    card: "card-peach-soft",
  },
  {
    title: "Регулярная домашняя работа",
    body:
      "Домашние задания связаны с темой урока и встроены в обсуждение на следующем занятии. Это удерживает темп и переводит лексику в активную речь.",
    card: "card-cream-soft",
  },
];

export default function MethodologyPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Методика", path: "/methodology" },
        ]}
      />
      <PageHero
        eyebrow="Методика обучения"
        title="Как мы учим китайскому языку в ChinaChild"
        description="Программа выстроена по международной системе уровней HSK 1–2 и сочетает фонетику, лексику, грамматику, аудирование, чтение и говорение в единой логике. Материал подаётся последовательно — от пиньиня и базовых конструкций до простых диалогов и аутентичных текстов."
        primaryCta={{ label: "Записаться на пробное", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "О школе", href: "/about" }}
      />

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stages.map((s, idx) => (
            <article key={s.title} className={`card-block h-full ${s.card}`}>
              <div className="text-sm font-semibold text-[#1b1b1b]/55">0{idx + 1}</div>
              <h2 className="mt-4 text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                {s.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#4b4b4b]">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="card-block card-block-lg card-cream-soft">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#1b1b1b] sm:text-4xl">
            Принципы методики
          </h2>
          <div className="mt-6 grid gap-3 text-base leading-7 text-[#4b4b4b]">
            <p>
              Программа реализуется полностью в онлайн-формате с использованием интерактивных
              заданий, практических упражнений и регулярной языковой практики. Особый акцент
              сделан на прикладные навыки и реальное использование языка, а не на формальное
              заучивание.
            </p>
            <p>
              Курс подходит взрослым без предварительной подготовки и подросткам с 12 лет. По
              итогам обучения слушатели выходят на уровень HSK 2 и получают прочную основу для
              дальнейшего развития — в обучении, работе или международной среде.
            </p>
            <p>
              После завершения базовой программы можно продолжить обучение на нашей платформе
              — вплоть до HSK 6, со сложными заданиями, интенсивной практикой и сопровождением
              кураторов и ревьюеров.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses/hsk-preparation" className={buttonStyles({})}>
              Подготовка к HSK
            </Link>
            <Link href="/results" className={buttonStyles({ variant: "secondary" })}>
              Результаты учеников
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
