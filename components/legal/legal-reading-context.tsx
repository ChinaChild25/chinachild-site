"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type LegalTextSize = "sm" | "md" | "lg";

export const legalTextScale: Record<LegalTextSize, number> = {
  sm: 0.92,
  md: 1,
  lg: 1.12,
};

interface LegalReadingSettings {
  wide: boolean;
  setWide: (value: boolean) => void;
  tocVisible: boolean;
  setTocVisible: (value: boolean) => void;
  textSize: LegalTextSize;
  setTextSize: (value: LegalTextSize) => void;
}

const LegalReadingSettingsContext = createContext<LegalReadingSettings | null>(null);

function usePersistedState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let nextValue = defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) nextValue = JSON.parse(raw) as T;
    } catch {
      // localStorage unavailable or malformed value — keep the default
    }
    setValue(nextValue);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore unavailable storage
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}

export function LegalReadingSettingsProvider({ children }: { children: ReactNode }) {
  const [wide, setWide] = usePersistedState("cc-legal-wide", false);
  const [tocVisible, setTocVisible] = usePersistedState("cc-legal-toc-visible", true);
  const [textSize, setTextSize] = usePersistedState<LegalTextSize>("cc-legal-text-size", "md");

  return (
    <LegalReadingSettingsContext.Provider value={{ wide, setWide, tocVisible, setTocVisible, textSize, setTextSize }}>
      {children}
    </LegalReadingSettingsContext.Provider>
  );
}

export function useLegalReadingSettings() {
  const context = useContext(LegalReadingSettingsContext);
  if (!context) throw new Error("useLegalReadingSettings must be used within LegalReadingSettingsProvider");
  return context;
}
