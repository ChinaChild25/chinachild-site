"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Maximize2, Minimize2, Settings2 } from "lucide-react";
import { applyTheme, readStoredTheme, storeTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useLegalReadingSettings, type LegalTextSize } from "@/components/legal/legal-reading-context";

// Same frosted-lens tokens as the floating CTA / header dropdown — already theme-aware.
const glassFilterStyle: CSSProperties = {
  WebkitBackdropFilter: "var(--floating-cta-glass-filter)",
  backdropFilter: "var(--floating-cta-glass-filter)",
};

/** Mirrors ThemeToggle.tsx's own local-reflection-of-shared-state pattern (no global theme context exists here). */
function useSiteTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = readStoredTheme() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeState(stored);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    storeTheme(next);
    applyTheme(next);
  }

  return { theme, setTheme };
}

/** Generic boolean switch — driven entirely by the `checked` prop, unlike `.theme-toggle`
 *  (which is wired directly to the page's `data-theme` attribute and isn't reusable here). */
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-[52px] shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: checked ? "var(--ink)" : "var(--muted)", opacity: checked ? 1 : 0.35 }}
    >
      <span aria-hidden className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-[left]" style={{ left: checked ? "27px" : "3px" }} />
    </button>
  );
}

function SettingsRow({ label, description, control }: { label: string; description: string; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">{label}</p>
        <p className="text-xs text-[var(--muted)]">{description}</p>
      </div>
      {control}
    </div>
  );
}

const TEXT_SIZE_OPTIONS: { value: LegalTextSize; fontSize: number }[] = [
  { value: "sm", fontSize: 13 },
  { value: "md", fontSize: 16 },
  { value: "lg", fontSize: 19 },
];

function TextSizeControl({ value, onChange }: { value: LegalTextSize; onChange: (value: LegalTextSize) => void }) {
  return (
    <div className="flex items-center gap-1">
      {TEXT_SIZE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          aria-label={`Размер текста: ${option.value === "sm" ? "мелкий" : option.value === "md" ? "обычный" : "крупный"}`}
          // Font size set inline: the site's global `button { font: inherit }` reset lives
          // outside any @layer, so it beats Tailwind's layered text-size utilities regardless
          // of specificity — every button rendered the same size no matter which class won.
          style={{ fontSize: option.fontSize }}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl font-medium transition-colors",
            value === option.value ? "bg-[var(--ink)] text-white" : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--ink)]"
          )}
        >
          А
        </button>
      ))}
    </div>
  );
}

function SettingsPanel() {
  const { wide, setWide, tocVisible, setTocVisible, textSize, setTextSize } = useLegalReadingSettings();
  const { theme, setTheme } = useSiteTheme();
  const isDark = theme === "dark";

  return (
    <>
      <SettingsRow
        label="Широкий формат"
        description={wide ? "Включён" : "Выключен"}
        control={<ToggleSwitch checked={wide} onChange={setWide} label="Широкий формат" />}
      />
      <SettingsRow
        label="Навигация по текущей статье"
        description={tocVisible ? "Включена" : "Выключена"}
        control={<ToggleSwitch checked={tocVisible} onChange={setTocVisible} label="Навигация по текущей статье" />}
      />
      <SettingsRow
        label="Тёмная тема"
        description={isDark ? "Включена" : "Выключена"}
        control={<ToggleSwitch checked={isDark} onChange={(checked) => setTheme(checked ? "dark" : "light")} label="Тёмная тема" />}
      />
      <div className="pt-2">
        <p className="text-sm font-medium text-[var(--ink)]">Размер текста</p>
        <div className="mt-2">
          <TextSizeControl value={textSize} onChange={setTextSize} />
        </div>
      </div>
    </>
  );
}

/**
 * Always-visible top-bar controls: the quick reading-mode toggle (widens the column and
 * hides the sidebar, or reverses both at once) and a hand-rolled settings popover (no
 * Radix dependency in this repo — click-toggle + outside-click + Escape, same idiom as
 * the header's own dropdown menus in components/layout/Header.tsx).
 */
export function LegalReadingToolbarActions() {
  const { wide, setWide, setTocVisible } = useLegalReadingSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setSettingsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSettingsOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  function toggleReadingMode() {
    const next = !wide;
    setWide(next);
    setTocVisible(!next);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-pressed={wide}
        title="Режим чтения"
        aria-label="Режим чтения"
        onClick={toggleReadingMode}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--ink)]"
      >
        {wide ? <Minimize2 className="size-4" strokeWidth={2} /> : <Maximize2 className="size-4" strokeWidth={2} />}
      </button>

      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          aria-label="Настройки чтения"
          onClick={() => setSettingsOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--ink)]"
        >
          <Settings2 className="size-4" strokeWidth={2} />
        </button>

        {settingsOpen ? (
          <div
            role="dialog"
            aria-label="Настройки чтения"
            className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-[var(--floating-cta-glass-border)] bg-[var(--floating-cta-glass-bg)] p-4 shadow-[var(--floating-cta-glass-shadow)]"
            style={glassFilterStyle}
          >
            <SettingsPanel />
          </div>
        ) : null}
      </div>
    </div>
  );
}
