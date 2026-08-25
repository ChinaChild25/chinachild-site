import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CareerApplicationForm from "@/components/careers/CareerApplicationForm";
import CareerSectionNav from "@/components/careers/CareerSectionNav";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import {
  CAREER_POSTED_AT,
  careerBenefits,
  careers,
  getCareerBySlug,
} from "@/lib/careers";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site-config";
import styles from "../careers.module.css";

type CareerPageProps = {
  params: Promise<{ slug: string }>;
};

const CAREER_SEO_TITLES: Record<string, string> = {
  "chinese-teacher": "Преподаватель китайского — вакансия ChinaChild",
  "native-chinese-teacher": "Носитель китайского языка — вакансия ChinaChild",
  "chinese-methodologist": "Методист китайского языка — вакансия ChinaChild",
  "junior-lawyer": "Младший юрист — вакансия ChinaChild",
};

const CAREER_TITLE_LINES: Record<string, string[]> = {
  "chinese-teacher": ["Преподаватель", "китайского", "языка"],
  "native-chinese-teacher": ["Преподаватель —", "носитель китайского", "языка"],
  "chinese-methodologist": ["Методист программ", "китайского языка"],
  "junior-lawyer": ["Младший юрист"],
};

export function generateStaticParams() {
  return careers.map((career) => ({ slug: career.slug }));
}

export async function generateMetadata({ params }: CareerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const career = getCareerBySlug(slug);
  if (!career) {
    return buildMetadata({
      title: "Вакансия не найдена | ChinaChild",
      description: "Запрошенная вакансия ChinaChild не найдена.",
      path: `/careers/${slug}`,
    });
  }
  return buildMetadata({
    title: CAREER_SEO_TITLES[career.slug] ?? `${career.title} — вакансия ChinaChild`,
    description: `${career.summary} ${career.format}. Отклик с резюме на сайте ChinaChild.`,
    path: `/careers/${career.slug}`,
    keywords: [
      career.title.toLowerCase(),
      "работа в онлайн школе",
      "удалённая работа",
      "вакансии ChinaChild",
    ],
  });
}

export default async function CareerPage({ params }: CareerPageProps) {
  const { slug } = await params;
  const career = getCareerBySlug(slug);
  if (!career) notFound();

  const path = `/careers/${career.slug}`;
  const url = absoluteUrl(path);
  const titleLines = CAREER_TITLE_LINES[career.slug] || [career.title];
  const otherCareers = careers.filter((item) => item.slug !== career.slug);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "JobPosting",
        "@id": `${url}#job`,
        title: career.title,
        image: absoluteUrl(career.image),
        description: [
          career.lead,
          "Задачи:",
          ...career.tasks,
          "Ожидания:",
          ...career.expectations,
          "Условия:",
          ...careerBenefits.map((benefit) => `${benefit.title}: ${benefit.body}`),
        ].join("\n"),
        identifier: {
          "@type": "PropertyValue",
          name: SITE_NAME,
          value: career.slug,
        },
        datePosted: CAREER_POSTED_AT,
        employmentType: career.employmentType,
        hiringOrganization: {
          "@id": `${SITE_URL}/#organization`,
          "@type": "Organization",
          name: SITE_NAME,
          sameAs: SITE_URL,
          logo: absoluteUrl("/brand/logo.svg"),
        },
        jobLocationType: "TELECOMMUTE",
        applicantLocationRequirements: career.eligibleCountries.map((country) => ({
          "@type": "Country",
          name: country,
        })),
        directApply: true,
        industry: "Онлайн-образование",
        occupationalCategory: career.direction,
        url,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Работа в ChinaChild", item: absoluteUrl("/careers") },
          { "@type": "ListItem", position: 3, name: career.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className={styles.page}>
      <JsonLd id={`career-${career.slug}-schema`} data={schema} />
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Работа в ChinaChild", path: "/careers" },
          { name: career.title, path },
        ]}
      />

      <article>
        <section className="page-shell-wide">
          <div className={styles.detailHero}>
            <div className={styles.detailIntro}>
              <div className={styles.kicker}>{career.direction}</div>
              <h1 className={styles.detailTitle} aria-label={career.title}>
                {titleLines.map((line) => <span key={line}>{line}</span>)}
              </h1>
              <p className={styles.detailLead}>{career.lead}</p>
              <div className={styles.detailMeta}>
                <span>Полностью удалённо</span>
                <span>{career.experience}</span>
                <span>{career.workload.split("·")[0]?.trim()}</span>
              </div>
              <div className={styles.heroActions}>
                <Link href="#apply" className={`${styles.heroPrimary} ${styles.detailHeroPrimary}`}>
                  Откликнуться
                </Link>
                <Link href="/careers#vacancies" className={`${styles.heroSecondary} ${styles.detailHeroSecondary}`}>
                  Все вакансии
                </Link>
              </div>
            </div>
            <div className={styles.detailImageWrap}>
              <Image
                src={career.image}
                alt={career.imageAlt}
                fill
                priority
                unoptimized
                sizes="(max-width: 960px) 96vw, 42vw"
                className={styles.detailImage}
              />
            </div>
          </div>
        </section>

        <section className="page-shell-wide">
          <div className={styles.detailGrid}>
            <CareerSectionNav />
            <div className={styles.detailContent}>
              <section id="tasks" className={styles.detailSection}>
                <h2>Какие задачи вас ждут</h2>
                <ul>
                  {career.tasks.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
              <section id="expectations" className={styles.detailSection}>
                <h2>Мы ждём, что вы</h2>
                <ul>
                  {career.expectations.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
              <section id="advantages" className={styles.detailSection}>
                <h2>Будет плюсом</h2>
                <ul>
                  {career.advantages.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
              <section id="conditions" className={styles.detailSection}>
                <h2>Что предлагаем</h2>
                <ul>
                  <li>{career.format}</li>
                  <li>{career.workload}</li>
                  {careerBenefits.map((benefit) => (
                    <li key={benefit.title}>{benefit.title}. {benefit.body}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </section>

        <section id="apply" className="page-shell-wide py-12 md:py-20" data-floating-cta-suppress="true">
          <div className={styles.applyContent}>
            <h2 className={styles.applyTitle}>Откликнуться на вакансию</h2>
            <CareerApplicationForm careerSlug={career.slug} />
          </div>
        </section>

        <section className={styles.section}>
          <div className="page-shell-wide">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Другие открытые роли</h2>
            </div>
            <div className={styles.vacancyList}>
              {otherCareers.map((item) => (
                <Link key={item.slug} href={`/careers/${item.slug}`} className={styles.vacancyRow}>
                  <div className={styles.vacancyDirection}>{item.direction}</div>
                  <h3 className={styles.vacancyTitle}>{item.title}</h3>
                  <span className={styles.vacancyArrow} aria-hidden>↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
