import type { Metadata } from "next";
import Link from "next/link";
import CareersHero from "@/components/careers/CareersHero";
import CareersProcess from "@/components/careers/CareersProcess";
import CareersStory from "@/components/careers/CareersStory";
import HanddrawnNumber from "@/components/careers/HanddrawnNumber";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { careerBenefits, careers } from "@/lib/careers";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site-config";
import styles from "./careers.module.css";

export const metadata: Metadata = buildMetadata({
  title: "Работа в ChinaChild — вакансии онлайн-школы китайского",
  description:
    "Работа в ChinaChild: вакансии преподавателя китайского, носителя языка, методиста и младшего юриста. Полностью онлайн, гибкий график и минимум бюрократии.",
  path: "/careers",
  keywords: [
    "работа преподавателем китайского онлайн",
    "вакансии преподаватель китайского",
    "методист китайского вакансия",
    "работа в онлайн школе",
  ],
});

export default function CareersPage() {
  return (
    <main className={styles.page}>
      <JsonLd
        id="careers-list-schema"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Вакансии ChinaChild",
          numberOfItems: careers.length,
          itemListElement: careers.map((career, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: career.title,
            url: absoluteUrl(`/careers/${career.slug}`),
          })),
        }}
      />
      <JsonLd
        id="careers-video-schema"
        data={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: "Работа преподавателем китайского языка в ChinaChild",
          description:
            "Онлайн-работа в ChinaChild: преподавание китайского языка, гибкая занятость и удалённый формат.",
          thumbnailUrl: [
            absoluteUrl("/careers/chinachild-online-teacher-hero-poster.webp"),
          ],
          uploadDate: "2026-08-25",
          duration: "PT22S",
          contentUrl: absoluteUrl("/careers/chinachild-online-teacher-hero.mp4"),
          inLanguage: "ru-RU",
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Работа в ChinaChild", path: "/careers" },
        ]}
      />

      <CareersHero careerCount={careers.length} />

      <CareersStory />

      <section id="how-we-work" className={styles.section}>
        <div className="page-shell-wide">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Работать спокойно. Расти быстро.</h2>
            <p className={styles.sectionDescription}>
              Условия фиксируем до старта, обратную связь даём напрямую, а результат
              ценим выше присутствия в бесконечных созвонах.
            </p>
          </div>
          <div className={styles.benefitsGrid}>
            {careerBenefits.map((benefit, index) => (
              <article key={benefit.title} className={styles.benefitCard}>
                <HanddrawnNumber value={`0${index + 1}`} className={styles.handdrawnNumber} />
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitBody}>{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="vacancies" className={styles.section}>
        <div className="page-shell-wide">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Открытые роли</h2>
            <p className={styles.sectionDescription}>
              Сейчас усиливаем преподавание, методику и правовое сопровождение.
            </p>
          </div>
          <div className={styles.vacancyList}>
            {careers.map((career) => (
              <Link
                key={career.slug}
                href={`/careers/${career.slug}`}
                className={styles.vacancyRow}
              >
                <div className={styles.vacancyDirection}>{career.direction}</div>
                <div>
                  <h3 className={styles.vacancyTitle}>{career.title}</h3>
                  <p className={styles.vacancyMeta}>
                    Удалённо · {career.workload.split("·")[0]?.trim()}
                  </p>
                </div>
                <span className={styles.vacancyArrow} aria-hidden>↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="page-shell-wide">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Без квеста из семи собеседований</h2>
            <p className={styles.sectionDescription}>
              Короткий, человеческий процесс без CRM-лабиринта и ожидания ради ожидания.
            </p>
          </div>
          <CareersProcess />
        </div>
      </section>
    </main>
  );
}
