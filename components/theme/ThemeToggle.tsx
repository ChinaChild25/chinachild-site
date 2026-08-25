"use client";

import { useEffect, useState } from "react";
import { applyTheme, readStoredTheme, storeTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored =
      readStoredTheme() ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(stored);
    applyTheme(stored);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    storeTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      aria-pressed={theme === "dark"}
      title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
    >
      <svg className="theme-toggle-sun" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="4.6" />
        <path d="M12 1.6v3M12 19.4v3M1.6 12h3M19.4 12h3M4.65 4.65l2.12 2.12M17.23 17.23l2.12 2.12M19.35 4.65l-2.12 2.12M6.77 17.23l-2.12 2.12" />
      </svg>
      <svg className="theme-toggle-night" viewBox="0 0 28 24" aria-hidden>
        <path d="M15.7 5.15a7.4 7.4 0 1 0 5.12 11.88 6.65 6.65 0 0 1-5.12-11.88Z" />
        <path d="m20.8 2 .55 1.45L22.8 4l-1.45.55L20.8 6l-.55-1.45L18.8 4l1.45-.55Z" />
        <path d="m25.1 8.1.4 1.05 1.05.4-1.05.4-.4 1.05-.4-1.05-1.05-.4 1.05-.4Z" />
        <path d="m23.1 17.2.45 1.2 1.2.45-1.2.45-.45 1.2-.45-1.2-1.2-.45 1.2-.45Z" />
      </svg>
      <span className="theme-toggle-thumb" aria-hidden />
    </button>
  );
}
