"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// v2: switched from hard-blocking analytics scripts to Consent Mode v2 +
// Yandex.Metrika cookieless-then-upgrade. The contract changed enough that
// existing v1 decisions must be re-collected (granular analytics/marketing
// flags are now load-bearing). v1 entries in localStorage are ignored.
const STORAGE_KEY = "cookie-consent-v2";
const VERSION = "v2";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
};

type ConsentContextValue = {
  consent: ConsentState | null;
  hasDecided: boolean;
  acceptAll: () => void;
  acceptNecessaryOnly: () => void;
  updatePreferences: (prefs: { analytics: boolean; marketing: boolean }) => void;
  reopenBanner: () => void;
  isBannerOpen: boolean;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  // Hydrate from localStorage on mount. Until hydration is complete we expose
  // consent=null and isBannerOpen=false so the server-rendered HTML matches
  // what the client paints on the first frame.
  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsentState;
        if (parsed && parsed.version === VERSION) {
          setConsent(parsed);
          return;
        }
      }
      setIsBannerOpen(true);
    } catch {
      setIsBannerOpen(true);
    }
  }, []);

  const save = useCallback((analytics: boolean, marketing: boolean) => {
    const state: ConsentState = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
      version: VERSION,
    };
    setConsent(state);
    setIsBannerOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage may be unavailable (private mode quirks, disabled storage)
    }
  }, []);

  const acceptAll = useCallback(() => save(true, true), [save]);
  const acceptNecessaryOnly = useCallback(() => save(false, false), [save]);
  const updatePreferences = useCallback(
    (prefs: { analytics: boolean; marketing: boolean }) =>
      save(prefs.analytics, prefs.marketing),
    [save],
  );
  const reopenBanner = useCallback(() => setIsBannerOpen(true), []);

  const value: ConsentContextValue = {
    consent: hydrated ? consent : null,
    hasDecided: hydrated && consent !== null,
    acceptAll,
    acceptNecessaryOnly,
    updatePreferences,
    reopenBanner,
    isBannerOpen: hydrated && isBannerOpen,
  };

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
