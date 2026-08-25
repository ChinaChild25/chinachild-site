"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import HanddrawnNumber from "@/components/careers/HanddrawnNumber";
import styles from "@/app/careers/careers.module.css";

const storySteps = [
  {
    title: "Здесь замечают человека, а не только расписание",
    body:
      "Мы строим обучение вокруг живого диалога. Преподаватель видит прогресс ученика, влияет на программу и не остаётся один на один со сложным случаем.",
    image: "/careers/online-teacher-video-call.webp",
    alt: "Преподаватель проводит онлайн-занятие по видеосвязи",
    shape: styles.shapeArch,
    canvas: styles.storyCanvasArch,
  },
  {
    title: "Технологии освобождают время для преподавания",
    body:
      "Личный кабинет, материалы и фиксация прогресса собраны в одном месте. Меньше ручной рутины — больше внимания к уроку и обратной связи.",
    image: "/careers/chinachild-online-platform-workspace.webp",
    alt: "Личный кабинет онлайн-школы ChinaChild открыт на рабочем ноутбуке",
    shape: styles.shapeRound,
    canvas: styles.storyCanvasRound,
  },
  {
    title: "Методика развивается вместе с практикой",
    body:
      "Наблюдения преподавателей не теряются в чатах. Мы обсуждаем трудные места, пересобираем задания и превращаем реальный опыт в более сильную программу.",
    image: "/careers/story-methodology.webp",
    alt: "Методист работает над учебной программой",
    shape: styles.shapeTilt,
    canvas: styles.storyCanvasTilt,
  },
  {
    title: "Работа встраивается в жизнь, а не наоборот",
    body:
      "Команда полностью онлайн. Нагрузку и расписание согласуем заранее, не требуем быть на связи круглосуточно и не создаём занятость ради занятости.",
    image: "/careers/flexible-home.webp",
    alt: "Специалист работает из дома в удобном режиме",
    shape: styles.shapeSoft,
    canvas: styles.storyCanvasSoft,
  },
] as const;

export default function CareersStory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    let frame = 0;
    const updateActiveStep = () => {
      frame = 0;
      const viewportAnchor = window.innerHeight * 0.5;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      stepRefs.current.forEach((node, index) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportAnchor);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex((current) => current === closestIndex ? current : closestIndex);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveStep);
    };
    updateActiveStep();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={styles.storySection} aria-labelledby="careers-story-title">
      <div className="page-shell-wide">
        <div className={styles.storyIntro}>
          <div className={styles.kicker}>Как устроена работа</div>
          <h2 id="careers-story-title" className={styles.displayTitle}>
            Среда, в которой удобно делать хорошее образование
          </h2>
        </div>

        <div className={styles.storyGrid}>
          <div className={styles.storySteps}>
            {storySteps.map((step, index) => (
              <article
                key={step.title}
                ref={(node) => {
                  stepRefs.current[index] = node;
                }}
                data-story-index={index}
                className={`${styles.storyStep} ${
                  activeIndex === index ? styles.storyStepActive : ""
                }`}
              >
                <HanddrawnNumber value={`0${index + 1}`} className={styles.handdrawnNumber} />
                <h3 className={styles.storyTitle}>{step.title}</h3>
                <p className={styles.storyBody}>{step.body}</p>
                <div className={styles.storyMobileImage}>
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    unoptimized
                    sizes="(max-width: 960px) 92vw, 1px"
                    className={styles.storyImage}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className={styles.storyStage} aria-hidden="true">
            <div className={`${styles.storyCanvas} ${storySteps[activeIndex].canvas}`}>
              <span className={styles.storyOrb} />
              <span className={styles.storyRing} />
              {storySteps.map((step, index) => (
                <div
                  key={step.image}
                  className={`${styles.storyFrame} ${step.shape} ${
                    activeIndex === index ? styles.storyFrameActive : ""
                  }`}
                >
                  <Image
                    src={step.image}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 961px) 52vw, 1px"
                    className={styles.storyImage}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
