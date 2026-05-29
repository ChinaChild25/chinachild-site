type Params = Record<string, string | number | boolean | undefined>;

/**
 * Centralised registry of analytics goal names sent to Yandex.Metrika
 * (`reachGoal`), Google Analytics (`event`), and the GTM dataLayer.
 *
 * Each name MUST also be registered as a Goal inside Yandex.Metrika UI
 * (Настройки → Цели → "JavaScript-событие" с тем же идентификатором).
 * Without that registration `reachGoal` is silently dropped from reports.
 *
 * See docs/analytics-goals.md for the operator runbook.
 */
export const Goals = {
  // — Contact & CTA —
  PHONE_CLICK: "phone_click",
  EMAIL_CLICK: "email_click",
  WHATSAPP_CLICK: "whatsapp_click",
  COURSE_CTA_CLICK: "course_cta_click",

  // — Page-level views —
  PRICING_VIEW: "pricing_view",
  FREE_TRIAL_VIEW: "free_trial_view",

  // — Engagement —
  // Шлётся с params { depth: 25|50|75|100, slug }. В Я.Метрике одна цель
  // `scroll_depth` — в отчёте сегментируем по параметрам.
  SCROLL_DEPTH: "scroll_depth",

  // — Lead form —
  LEAD_SUBMITTED: "lead_submitted",

  // — HSK self-test (/chinese/hsk-test) —
  HSK_TEST_STARTED: "hsk_test_started",
  HSK_TEST_ANSWERED: "hsk_test_answered",
  HSK_TEST_COMPLETED: "hsk_test_completed",
  HSK_TEST_LEAD: "hsk_test_lead",
  HSK_TEST_RESTARTED: "hsk_test_restarted",
  HSK_TEST_SHARED: "hsk_test_shared",

  // — Diagnostic adaptive flow (/diagnostic) —
  DIAGNOSTIC_STARTED: "diagnostic_started",
  CALIBRATION_COMPLETED: "calibration_completed",
  TEST_QUESTION_ANSWERED: "test_question_answered",
  TEST_COMPLETED: "test_completed",
  RESULT_VIEWED: "result_viewed",
  SHARE_CLICKED: "share_clicked",
  SHARE_CARD_DOWNLOADED: "share_card_downloaded",
  COURSE_CTA_CLICKED: "course_cta_clicked",
  TUTOR_CHAT_STARTED: "tutor_chat_started",
  TUTOR_MESSAGE_SENT: "tutor_message_sent",
} as const;

export type GoalName = (typeof Goals)[keyof typeof Goals];

declare global {
  interface Window {
    ym?: (counter: number, action: string, ...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params?: Params) {
  if (typeof window === "undefined") return;

  const ymId = Number(process.env.NEXT_PUBLIC_YM_ID);
  if (ymId && window.ym) {
    window.ym(ymId, "reachGoal", name, params);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params });
  }
}
