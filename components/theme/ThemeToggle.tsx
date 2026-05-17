"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { applyTheme, readStoredTheme, storeTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored =
      readStoredTheme() ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(stored);
    applyTheme(stored);
    setMounted(true);
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
      <span className="theme-toggle-thumb" aria-hidden>
        {mounted && theme === "dark" ? (
          <Moon className="theme-toggle-icon" strokeWidth={1.75} />
        ) : (
          <Sun className="theme-toggle-icon" strokeWidth={1.75} />
        )}
      </span>
    </button>
  );
}
