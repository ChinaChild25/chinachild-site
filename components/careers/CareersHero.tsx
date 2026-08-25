"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/careers/careers.module.css";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const interpolate = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export default function CareersHero({ careerCount }: { careerCount: number }) {
  const [videoReady, setVideoReady] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(max-width: 767px), (prefers-reduced-motion: reduce)",
    );
    let animationFrame = 0;

    const resetMotion = () => {
      const card = cardRef.current;
      const content = contentRef.current;
      if (!card || !content) return;
      card.style.removeProperty("width");
      card.style.removeProperty("height");
      card.style.removeProperty("border-radius");
      card.style.removeProperty("transform");
      card.style.removeProperty("--hero-image-scale");
      card.style.removeProperty("--hero-shade-opacity");
      content.style.removeProperty("opacity");
      content.style.removeProperty("transform");
      content.style.removeProperty("pointer-events");
    };

    const updateMotion = () => {
      animationFrame = 0;
      const section = sectionRef.current;
      const stage = stageRef.current;
      const card = cardRef.current;
      const content = contentRef.current;
      if (!section || !stage || !card || !content) return;
      if (reducedMotion.matches) {
        resetMotion();
        return;
      }

      const sectionTop = section.getBoundingClientRect().top;
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp((96 - sectionTop) / travel);
      const eased = progress * progress * (3 - 2 * progress);
      const startWidth = stage.clientWidth;
      const startHeight = stage.clientHeight;
      const targetSize = Math.min(startWidth * 0.48, startHeight * 0.78);
      const radius = interpolate(40, targetSize / 2, eased);
      const contentProgress = clamp(progress / 0.68);

      card.style.width = `${interpolate(startWidth, targetSize, eased)}px`;
      card.style.height = `${interpolate(startHeight, targetSize, eased)}px`;
      card.style.borderRadius = `${radius}px`;
      card.style.transform = `translate3d(0, ${interpolate(0, -18, eased)}px, 0)`;
      card.style.setProperty("--hero-image-scale", String(interpolate(1, 1.12, eased)));
      card.style.setProperty("--hero-shade-opacity", String(interpolate(1, 0.42, eased)));
      content.style.opacity = String(1 - contentProgress);
      content.style.transform = `translate3d(0, ${interpolate(0, -28, contentProgress)}px, 0)`;
      content.style.pointerEvents = progress > 0.68 ? "none" : "";
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateMotion);
    };

    updateMotion();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resetMotion();
    };
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.hero} ${styles.heroMotion}`}>
      <div ref={stageRef} className={`page-shell-wide ${styles.heroStickyShell}`}>
        <div ref={cardRef} className={styles.heroCard}>
          <Image
            src="/careers/chinachild-online-teacher-hero-poster.webp"
            alt="Онлайн-преподаватель ChinaChild проводит занятие по видеосвязи"
            fill
            priority
            unoptimized
            sizes="(max-width: 1600px) 96vw, 1600px"
            className={`${styles.heroImage} ${styles.heroPoster} ${
              videoReady ? styles.heroPosterHidden : ""
            }`}
          />
          <video
            aria-hidden="true"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            className={`${styles.heroImage} ${styles.heroVideo} ${
              videoReady ? styles.heroVideoReady : ""
            }`}
            onCanPlay={() => setVideoReady(true)}
          >
            <source
              src="/careers/chinachild-online-teacher-hero.webm"
              type="video/webm"
            />
            <source
              src="/careers/chinachild-online-teacher-hero.mp4"
              type="video/mp4"
            />
          </video>
          <div className={styles.heroShade} />
          <div ref={contentRef} className={styles.heroContent}>
            <div>
              <div className={styles.kicker} style={{ color: "rgba(255,255,255,.68)" }}>
                Работа в ChinaChild
              </div>
              <h1 className={styles.heroTitle}>Делать китайский ближе. Вместе.</h1>
              <p className={styles.heroLead}>
                Небольшая онлайн-команда, в которой можно влиять на обучение,
                видеть результат своей работы и не тратить силы на лишнюю бюрократию.
              </p>
              <div className={styles.heroMeta}>
                <span>{careerCount} открытые вакансии</span>
                <span>Полностью онлайн</span>
                <span>Гибкая занятость</span>
              </div>
              <div className={styles.heroActions}>
                <Link href="#vacancies" className={styles.heroPrimary}>Смотреть вакансии</Link>
                <Link href="#how-we-work" className={styles.heroSecondary}>Как мы работаем</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
