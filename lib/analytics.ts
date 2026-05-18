type Params = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params?: Params) {
  if (typeof window === "undefined") return;

  const ymId = Number(process.env.NEXT_PUBLIC_YM_ID);
  if (ymId && window.ym) {
    window.ym(ymId, "reachGoal", name, params);
  }

  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
}
