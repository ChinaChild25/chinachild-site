export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "cc-theme";

/** Matches --background in globals.css — used for meta theme-color / iOS chrome. */
export const THEME_SURFACE_COLORS: Record<Theme, string> = {
  light: "#f8f7f2",
  dark: "#121212",
};

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", THEME_SURFACE_COLORS[theme]);
  }
}

export function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore quota / private mode */
  }
}
