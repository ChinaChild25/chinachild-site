import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import styles from "./HomeProcessResults.module.css";

const assetPath = "/home-redesign/";

const resultCards = [
  {
    key: "level",
    title: "Достигайте разговорного уровня",
    subtitle: "Уверенная речь на повседневные темы.",
    value: "6 мес.",
    text: "За полгода регулярных занятий вы выходите на HSK 2",
    tone: styles.resultBlue,
    revealClassName: styles.resultLeadReveal,
    cardClassName: styles.resultLead,
    imageClassName: styles.resultPeople,
    image: "dialog-men-and-girl-on-blue.webp",
    imageAlt: "Ученики ChinaChild достигают разговорного уровня китайского языка",
    sizes: "(min-width: 1180px) 460px, (min-width: 768px) 760px, 390px",
    info:
      "Срок 6 месяцев рассчитан для учебного ритма 3 занятия в неделю и регулярной практики между уроками. Точный темп зависит от стартового уровня и выполнения домашних заданий.",
  },
  {
    key: "groups",
    title: "Проходите занятия в мини-группах",
    subtitle: "Живой диалог и поддержка одногруппников.",
    value: "До 5",
    text: "Каждому хватает времени на речь и обратную связь",
    tone: styles.resultPhoto,
    revealClassName: "",
    cardClassName: "",
    imageClassName: styles.resultGroups,
    image: "mini-groups.webp",
    imageAlt: "Занятия китайским языком в мини-группе до пяти человек",
    sizes: "(min-width: 1180px) 430px, (min-width: 768px) 46vw, 390px",
    info: null,
  },
  {
    key: "cashback",
    title: "Оформляйте вычет за обучение",
    subtitle: "Поможем оформить документы для вычета.",
    value: "13%",
    text: "При наличии права — до 19 500 ₽ за себя или 14 300 ₽ за ребёнка",
    tone: styles.resultWarm,
    revealClassName: "",
    cardClassName: "",
    imageClassName: styles.resultRuble,
    image: "ruble-3d.webp",
    imageAlt: "Налоговый вычет 13 процентов за обучение китайскому языку",
    sizes: "(min-width: 1180px) 230px, (min-width: 768px) 240px, 230px",
    info: null,
  },
] as const;

export default function ResultsSection() {
  return (
    <section
      id="rezultaty"
      className={`section-space ${styles.resultsSection}`}
      aria-labelledby="results-section-title"
    >
      <div className={styles.resultsShell}>
        <div className={`${styles.sectionHeader} section-head-center mx-auto max-w-3xl`}>
          <h2 id="results-section-title" className="section-title">
            Что вы получаете в ChinaChild
          </h2>
          <p className="section-description">
            Конкретные результаты программы: разговорный уровень за полгода,
            мини-группы и налоговый вычет 13%.
          </p>
        </div>
        <div className={styles.resultsGrid}>
          {resultCards.map((card) => (
            <Reveal key={card.key} className={card.revealClassName}>
              <article className={`${styles.resultCard} ${card.tone} ${card.cardClassName ?? ""}`}>
                <div className={styles.resultCopy}>
                  <h3>{card.title}</h3>
                  <p>{card.subtitle}</p>
                </div>
                <span className={`${styles.resultImage} ${card.imageClassName}`}>
                  <Image
                    src={`${assetPath}${card.image}`}
                    alt={card.imageAlt}
                    fill
                    sizes={card.sizes}
                    className={styles.artImage}
                  />
                </span>
                <div className={styles.resultGlass}>
                  {card.info ? (
                    <span className={styles.resultInfoWrap}>
                      <button
                        type="button"
                        className={styles.resultInfo}
                        aria-label="Подробнее о сроке обучения"
                        aria-describedby={`${card.key}-info`}
                      >
                        i
                      </button>
                      <span id={`${card.key}-info`} role="tooltip" className={styles.resultTooltip}>
                        {card.info}
                      </span>
                    </span>
                  ) : null}
                  <div className={styles.resultValue}>{card.value}</div>
                  <p className={styles.resultText}>{card.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
