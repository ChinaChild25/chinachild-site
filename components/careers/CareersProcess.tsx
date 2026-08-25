"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import HanddrawnNumber from "@/components/careers/HanddrawnNumber";
import styles from "@/app/careers/careers.module.css";

const processSteps = [
  {
    title: "Отклик",
    body: "Расскажите о себе, приложите резюме и, если есть, дипломы или сертификаты.",
    image: "/careers/application-form-on-laptop.avif",
    alt: "Кандидат заполняет форму отклика на вакансию ChinaChild",
  },
  {
    title: "Знакомство",
    body: "Созвонимся и спокойно обсудим опыт, ожидания, нагрузку и формат сотрудничества.",
    image: "/careers/online-job-interview.avif",
    alt: "Онлайн-собеседование с кандидатом в ChinaChild",
  },
  {
    title: "Решение",
    body: "Если подходим друг другу, согласуем условия и начнём без длинной цепочки согласований.",
    image: "/careers/job-offer-chinachild.avif",
    alt: "Предложение о сотрудничестве с ChinaChild",
  },
] as const;

function useProcessStack(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const slides = Array.from(
      root.querySelectorAll<HTMLElement>("." + styles.processSlide),
    );
    if (slides.length < 2) return;

    const desktop = window.matchMedia("(min-width: 860px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shrinkPerLayer = 0.07;
    const rootStyles = getComputedStyle(root);
    const stackTop =
      parseFloat(rootStyles.getPropertyValue("--process-stack-top")) || 84;
    const stackStep =
      parseFloat(rootStyles.getPropertyValue("--process-stack-step")) || 18;

    let frame = 0;
    const clear = () => {
      slides.forEach((slide) => {
        slide.style.transform = "";
        slide.style.filter = "";
      });
    };

    const update = () => {
      frame = 0;
      if (!desktop.matches || reduce.matches) return clear();

      const pinned = slides.map((slide, index) => {
        const targetTop = stackTop + index * stackStep;
        const rect = slide.getBoundingClientRect();
        return Math.min(
          1,
          Math.max(0, (targetTop + rect.height - rect.top) / rect.height),
        );
      });

      slides.forEach((slide, index) => {
        let covered = 0;
        for (let next = index + 1; next < slides.length; next += 1) {
          covered += pinned[next];
        }
        slide.style.transform = covered
          ? "scale(" + (1 - covered * shrinkPerLayer) + ")"
          : "";
        slide.style.filter = covered
          ? "brightness(" + (1 - covered * 0.04) + ")"
          : "";
      });
    };

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) cancelAnimationFrame(frame);
      clear();
    };
  }, [rootRef]);
}

export default function CareersProcess() {
  const rootRef = useRef<HTMLDivElement>(null);
  useProcessStack(rootRef);

  return (
    <div
      className={styles.processSlider}
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-label="Этапы найма в ChinaChild"
    >
      {processSteps.map((step, index) => (
        <article
          key={step.title}
          className={styles.processSlide}
          style={{ "--process-index": index } as CSSProperties}
        >
          <div className={styles.processSlideText}>
            <HanddrawnNumber
              value={"0" + (index + 1)}
              className={styles.processSlideNumber}
            />
            <h3 className={styles.processSlideTitle}>{step.title}</h3>
            <p className={styles.processSlideBody}>{step.body}</p>
          </div>
          <div className={styles.processSlideMedia}>
            <Image
              src={step.image}
              alt={step.alt}
              fill
              unoptimized
              sizes="(min-width: 860px) 52vw, 82vw"
              className={styles.processSlideImage}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
