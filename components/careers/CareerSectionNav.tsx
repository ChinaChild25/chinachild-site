"use client";

import { useEffect, useState } from "react";
import styles from "@/app/careers/careers.module.css";

const sections = [
  { id: "tasks", label: "Задачи" },
  { id: "expectations", label: "Ожидания" },
  { id: "advantages", label: "Будет плюсом" },
  { id: "conditions", label: "Условия" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function CareerSectionNav() {
  const [activeId, setActiveId] = useState<SectionId>("tasks");

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;
      const activationLine = Math.min(180, window.innerHeight * 0.28);
      let nextActiveId: SectionId = "tasks";

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= activationLine) {
          nextActiveId = section.id;
        }
      }

      setActiveId((currentId) => currentId === nextActiveId ? currentId : nextActiveId);
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <nav className={styles.detailNav} aria-label="Содержание вакансии">
      {sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={isActive ? styles.detailNavLinkActive : undefined}
            aria-current={isActive ? "location" : undefined}
          >
            {section.label}
          </a>
        );
      })}
    </nav>
  );
}
