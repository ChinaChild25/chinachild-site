import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import styles from "./HomeRedesignDraftSections.module.css";

const assetPath = "/home-redesign/";
const HSK_1_2 = <span className={styles.nowrap}>HSK 1–2</span>;
const HSK_1_6 = <span className={styles.nowrap}>HSK 1–6</span>;
const HSK_2 = <span className={styles.nowrap}>HSK 2</span>;
const CASHBACK_RANGE = <span className={styles.nowrap}>5–10%</span>;

type TextLine = {
  key: string;
  content: ReactNode;
};

type AssetLayer = {
  file: string;
  className: string;
  alt: string;
  sizes?: string;
};

type AudienceCard = {
  key: string;
  href: string;
  title: ReactNode;
  subtitle: string;
  lines: TextLine[];
  tone: string;
  className: string;
  images: readonly AssetLayer[];
};

type WhyCard = {
  key: string;
  title: ReactNode;
  text: ReactNode;
  tone: string;
  className: string;
  images: readonly AssetLayer[];
};

const audienceCards: readonly AudienceCard[] = [
  {
    key: "school",
    href: "/courses/chinese-for-kids",
    title: "Школьникам",
    subtitle: "Подросткам и старшеклассникам",
    lines: [
      { key: "phrases", content: "База для первых диалогов" },
      { key: "hsk", content: <>Подготовка к {HSK_1_2}</> },
      { key: "characters", content: "Иероглифы без страха" },
    ],
    tone: styles.toneSand,
    className: styles.audienceSchool,
    images: [
      {
        file: "kitayskiy-dlya-shkolnikov-podrostok-s-noutbukom.webp",
        className: styles.audienceSchoolStudent,
        alt: "Курс китайского языка для школьников и подростков онлайн",
        sizes: "(min-width: 900px) 32vw, 92vw",
      },
    ],
  },
  {
    key: "adults",
    href: "/courses/chinese-for-adults",
    title: "Взрослым",
    subtitle: "Без подготовки",
    lines: [
      { key: "speaking", content: "Разговоры в быту" },
      { key: "reading", content: "Тексты без словаря" },
      { key: "hsk", content: <>{HSK_2} за 6 месяцев</> },
    ],
    tone: styles.toneRose,
    className: styles.audienceAdults,
    images: [
      {
        file: "kitayskiy-dlya-vzroslyh-studentka-s-noutbukom.webp",
        className: styles.audienceAdultStudent,
        alt: "Китайский язык онлайн для взрослых с нуля",
        sizes: "(min-width: 1180px) 26vw, (min-width: 900px) 46vw, 84vw",
      },
    ],
  },
  {
    key: "hsk",
    href: "/courses/hsk-preparation",
    title: "Подготовка к HSK",
    subtitle: "Все уровни от 1 до 6",
    lines: [
      { key: "structure", content: "План подготовки по уровню" },
      { key: "china-universities", content: "Фокус на вузах Китая" },
      { key: "certificate", content: <>Сертификат {HSK_1_6}</> },
    ],
    tone: styles.toneBlue,
    className: styles.audienceHsk,
    images: [
      {
        file: "podgotovka-hsk-papki-dokumenty.webp",
        className: styles.audienceHskFolders,
        alt: "Подготовка к экзамену HSK 1-6 и документы",
        sizes: "(min-width: 900px) 18vw, 70vw",
      },
    ],
  },
  {
    key: "business",
    href: "/courses/business-chinese",
    title: "Группы для бизнеса",
    subtitle: "Командам и сотрудникам",
    lines: [
      { key: "documents", content: "Документы для оплаты" },
      { key: "progress", content: "Прогресс по сотрудникам" },
      { key: "speaking", content: "Разговорная практика" },
    ],
    tone: styles.toneLime,
    className: styles.audienceBusiness,
    images: [
      {
        file: "korporativnyy-kitajskiy-gruppa-sotrudnikov.webp",
        className: styles.audienceBusinessGroup,
        alt: "Корпоративное обучение китайскому языку для сотрудников",
        sizes: "(min-width: 900px) 24vw, 72vw",
      },
      {
        file: "korporativnyy-kitajskiy-papka-dokumenty.webp",
        className: styles.audienceBusinessFolder,
        alt: "Документы для корпоративного курса китайского языка",
        sizes: "(min-width: 900px) 40vw, 86vw",
      },
      {
        file: "progress-komandy-78-procent.svg",
        className: styles.audienceBusinessProgress,
        alt: "Прогресс команды на корпоративном курсе китайского языка 78 процентов",
        sizes: "(min-width: 900px) 18vw, 64vw",
      },
    ],
  },
] as const;

const whyCards: readonly WhyCard[] = [
  {
    key: "license",
    title: <>Лицензированная программа {HSK_1_2}</>,
    text: <>Обучаем по официальной программе {HSK_1_2} с гарантией качества.</>,
    tone: styles.toneGray,
    className: styles.whyLicense,
    images: [
      {
        file: "litsenzirovannaya-programma-hsk-1-2.webp",
        className: styles.whyLicenseImage,
        alt: "Лицензированная программа китайского языка HSK 1-2",
        sizes: "(min-width: 900px) 30vw, 86vw",
      },
    ],
  },
  {
    key: "speaking",
    title: "Разговорный уровень за 6 месяцев",
    text: "Программа построена на практике, говорим с первого занятия и видим результат через полгода",
    tone: styles.toneGray,
    className: styles.whySpeaking,
    images: [
      {
        file: "progress-hsk-razgovornyy-uroven.svg",
        className: styles.whySpeakingProgress,
        alt: "Прогресс HSK до разговорного уровня за 6 месяцев",
        sizes: "(min-width: 900px) 24vw, 86vw",
      },
    ],
  },
  {
    key: "groups",
    title: "Мини‑группы до 5 человек",
    text: "Много внимания каждому и максимум практики на занятии",
    tone: styles.tonePaleLime,
    className: styles.whyGroups,
    images: [
      {
        file: "mini-gruppy-do-5-chelovek-3d.webp",
        className: styles.whyGroupsFive,
        alt: "Мини-группы по китайскому языку до 5 человек",
        sizes: "(min-width: 900px) 22vw, 72vw",
      },
      {
        file: "mini-gruppa-studentka-1.webp",
        className: styles.whyGroupsStudentOne,
        alt: "Студентка мини-группы китайского языка",
      },
      {
        file: "mini-gruppa-studentka-2.webp",
        className: styles.whyGroupsStudentTwo,
        alt: "Участница мини-группы китайского языка онлайн",
      },
      {
        file: "mini-gruppa-student-3.webp",
        className: styles.whyGroupsStudentThree,
        alt: "Студент мини-группы китайского языка",
      },
      {
        file: "mini-gruppa-studentka-4.webp",
        className: styles.whyGroupsStudentFour,
        alt: "Ученица мини-группы китайского языка",
      },
    ],
  },
  {
    key: "teachers",
    title: "Преподаватели ЮФУ и ДГТУ",
    text: "Опытные преподаватели ведущих вузов с любовью к языку и обучению",
    tone: styles.tonePaleBlue,
    className: styles.whyTeachers,
    images: [
      {
        file: "prepodavatel-yufu-dgtu-1.webp",
        className: styles.whyTeachersOne,
        alt: "Преподаватель китайского языка ЮФУ и ДГТУ",
      },
      {
        file: "prepodavatel-yufu-dgtu-2.webp",
        className: styles.whyTeachersTwo,
        alt: "Опытный преподаватель китайского языка онлайн",
      },
      {
        file: "prepodavatel-yufu-dgtu-3.webp",
        className: styles.whyTeachersThree,
        alt: "Преподаватель онлайн-школы китайского языка ChinaChild",
      },
    ],
  },
  {
    key: "cabinet",
    title: "Личный кабинет с записями уроков",
    text: "Доступ к записям, материалам и прогрессу в удобном личном кабинете",
    tone: styles.toneGray,
    className: styles.whyCabinet,
    images: [
      {
        file: "lichnyy-kabinet-chinachild-zapisi-urokov.webp",
        className: styles.whyCabinetImage,
        alt: "Личный кабинет ChinaChild с записями уроков китайского языка",
        sizes: "(min-width: 1180px) 26vw, (min-width: 900px) 30vw, 86vw",
      },
    ],
  },
  {
    key: "cashback",
    title: <>Дополнительный кэшбэк {CASHBACK_RANGE}</>,
    text: "Возвращаем часть стоимости на карту — инвестируйте в знания и экономьте",
    tone: styles.toneBrightBlue,
    className: styles.whyCashback,
    images: [
      {
        file: "keshbek-za-obuchenie-kitayskomu-5-10.webp",
        className: styles.whyCashbackImage,
        alt: "Кэшбэк 5-10 процентов за обучение китайскому языку",
        sizes: "(min-width: 900px) 30vw, 86vw",
      },
    ],
  },
] as const;

function AssetLayers({ images }: { images: readonly AssetLayer[] }) {
  return images.map((image) => (
    <span key={image.file} className={`${styles.cardImage} ${image.className}`}>
      <Image
        src={`${assetPath}${image.file}`}
        alt={image.alt}
        fill
        sizes={image.sizes ?? "(min-width: 900px) 12vw, 34vw"}
        className={styles.assetImage}
      />
    </span>
  ));
}

export function AudienceRedesignDraftSection() {
  return (
    <section id="dlya-kogo" className={`section-space ${styles.section}`}>
      <div className="page-shell-wide">
        <div className="section-head-center mx-auto max-w-3xl">
          <h2 className="section-title">Кому подходит ChinaChild</h2>
          <p className="section-description">
            Подростки от 12 лет, старшеклассники, взрослые с нуля и команды компаний —
            программа подбирается под темп и цель.
          </p>
        </div>
        <div data-redesign-grid="audience" className={`mt-10 sm:mt-14 ${styles.audienceGrid}`}>
          {audienceCards.map((card) => (
            <Reveal key={card.key} className={card.className}>
              <Link
                href={card.href}
                className={`${styles.card} ${styles.audienceCard} ${card.tone}`}
              >
                <div className={styles.copy}>
                  <h3>{card.title}</h3>
                  <p className={styles.subtitle}>{card.subtitle}</p>
                  <ul>
                    {card.lines.map((line) => (
                      <li key={line.key}>{line.content}</li>
                    ))}
                  </ul>
                  <span className={styles.more}>Подробнее →</span>
                </div>
                <AssetLayers images={card.images} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyRedesignDraftSection() {
  return (
    <section id="preimushchestva" className={`section-space ${styles.section}`}>
      <div className="page-shell-wide">
        <div className="section-head-center mx-auto max-w-3xl">
          <h2 className="section-title">Почему ChinaChild</h2>
          <p className="section-description">
            Лицензия Москвы, мини-группы до 5 человек, преподаватели ведущих вузов и
            личный кабинет с записями уроков.
          </p>
        </div>
        <div data-redesign-grid="why" className={`mt-10 sm:mt-14 ${styles.whyGrid}`}>
          {whyCards.map((card) => (
            <Reveal key={card.key} className={card.className}>
              <article className={`${styles.card} ${styles.whyCard} ${card.tone}`}>
                <div className={styles.copy}>
                  <h3>{card.title}</h3>
                  <p className={styles.subtitle}>{card.text}</p>
                </div>
                <AssetLayers images={card.images} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
