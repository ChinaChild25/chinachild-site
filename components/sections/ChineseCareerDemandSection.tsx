import Image from "next/image";
import styles from "./ChineseCareerDemandSection.module.css";

const careerAreas = [
  "Закупки",
  "ВЭД",
  "Продажи",
  "Клиентский сервис",
  "Перевод",
  "Инженерия",
  "Медицина",
  "Право",
] as const;

const SOURCE_URL = "https://www.kommersant.ru/doc/6688712";

export default function ChineseCareerDemandSection() {
  return (
    <section className={`section-space ${styles.section}`} aria-labelledby="career-demand-title">
      <div className="page-shell-wide">
        <div className="section-head-center mx-auto max-w-3xl">
          <h2 id="career-demand-title" className="section-title">
            Китайский становится карьерным преимуществом
          </h2>
        </div>

        <div className="mt-10 sm:mt-14">
          <article className={styles.card}>
          <div className={styles.media} aria-hidden="true">
            <Image
              src="/home-redesign/spros-na-specialistov-s-kitayskim-yazykom.webp"
              alt=""
              fill
              sizes="(min-width: 1180px) 1120px, calc(100vw - 36px)"
              className={styles.photo}
            />
          </div>
          <div className={styles.scrim} aria-hidden="true" />

          <div className={styles.contentColumn}>
            <div className={`${styles.panel} ${styles.statPanel}`}>
              <strong className={styles.stat}>
                <span className={styles.statPrefix}>на</span>
                <span>63%</span>
              </strong>
              <p className={styles.statDescription}>
                вырос спрос на специалистов со знанием китайского
              </p>
            </div>

            <div className={`${styles.panel} ${styles.areasPanel}`}>
              <p className={styles.areasTitle}>
                Где особенно нужны специалисты со знанием китайского языка
              </p>
              <ul className={styles.tags} aria-label="Востребованные направления">
                {careerAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.source}
            aria-label="Исследование SuperJob на сайте Коммерсантъ, откроется в новой вкладке"
          >
            Исследование SuperJob
          </a>
          </article>
        </div>
      </div>
    </section>
  );
}
