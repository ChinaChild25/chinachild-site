"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { initConsentMode, updateConsent } from "./gtag";
import { syncAnalyticsConsent } from "./analytics";
import { ANALYTICS_CONSENT_VERSION } from "./value";

// Keep existing granular v2 choices. Optional scripts require analytics=true.
const STORAGE_KEY = "cookie-consent-v2";
const VERSION = ANALYTICS_CONSENT_VERSION;

function readConsent(raw: string | null): ConsentState | null {
  try {
    const value = raw ? JSON.parse(raw) : null;
    if (!value || value.version !== VERSION || typeof value.analytics !== "boolean" ||
      typeof value.marketing !== "boolean" || typeof value.timestamp !== "string" ||
      !Number.isFinite(Date.parse(value.timestamp))) return null;
    return { necessary: true, analytics: value.analytics, marketing: value.marketing,
      timestamp: value.timestamp, version: VERSION };
  } catch { return null; }
}

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
  //
  // Consent Mode v2 default ('denied' for ad/analytics storage) must land in
  // the dataLayer BEFORE the gtag.js script processes any queued events. We
  // emit it synchronously here, before reading the saved decision, so a
  // returning user with full consent still has the default → update sequence
  // gtag expects, and a first-time user starts in denied state by default.
  useEffect(() => {
    initConsentMode();
    setHydrated(true);
    try {
      const parsed = readConsent(localStorage.getItem(STORAGE_KEY));
      if (parsed) {
          syncAnalyticsConsent(parsed.analytics === true, VERSION, parsed.timestamp);
          setConsent({ ...parsed, analytics: parsed.analytics === true, marketing: parsed.marketing === true });
          updateConsent({ analytics: parsed.analytics === true, marketing: parsed.marketing === true });
          return;
      }
      syncAnalyticsConsent(false);
      setIsBannerOpen(true);
    } catch {
      syncAnalyticsConsent(false);
      setIsBannerOpen(true);
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const next = readConsent(event.key === null ? null : event.newValue);
      syncAnalyticsConsent(next?.analytics === true, next?.version, next?.timestamp);
      setConsent(next);
      setIsBannerOpen(!next);
      updateConsent({ analytics: next?.analytics === true, marketing: next?.marketing === true });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = useCallback((analytics: boolean, marketing: boolean) => {
    const state: ConsentState = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
      version: VERSION,
    };
    syncAnalyticsConsent(analytics, VERSION, state.timestamp);
    setConsent(state);
    setIsBannerOpen(false);
    updateConsent({ analytics, marketing });
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
