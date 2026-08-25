import Image from "next/image";
import Link from "next/link";
import styles from "@/app/careers/careers.module.css";
import { careers } from "@/lib/careers";

export default function CareersTeaser() {
  return (
    <section className="section-space" aria-labelledby="careers-teaser-title">
      <div className="page-shell-wide">
        <div className={styles.teaser}>
          <div className={styles.teaserContent}>
            <div className={styles.kicker}>Команда растёт · {careers.length} вакансии</div>
            <h2 id="careers-teaser-title" className={styles.teaserTitle}>
              Сделаем китайский ближе вместе?
            </h2>
            <p className={styles.teaserText}>
              Ищем преподавателей, носителя языка, методиста и младшего юриста.
              Полностью онлайн, гибко и без лишней бюрократии.
            </p>
            <div className="mt-7">
              <Link href="/careers" className="btn-pill btn-ink">
                Работа в ChinaChild
              </Link>
            </div>
          </div>
          <div className={styles.teaserImageWrap}>
            <Image
              src="/careers/remote-desk.webp"
              alt="Удалённое рабочее место преподавателя ChinaChild"
              fill
              unoptimized
              sizes="(max-width: 960px) 90vw, 48vw"
              className={styles.teaserImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
