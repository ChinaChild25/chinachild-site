"use client";

/**
 * Точки аналитики для /diagnostic.
 *
 * В рантайме:
 *   - всегда console.log (debug-friendly)
 *   - если есть window.ym (Yandex.Metrika) и пользователь дал consent —
 *     отправляем reachGoal с параметрами
 *   - если есть window.gtag (Google Analytics) — отправляем event
 */

export type DiagnosticEvent =
  | { name: "diagnostic_started" }
  | { name: "calibration_completed"; params: { experience: string; goal: string; minutesPerDay: number } }
  | { name: "test_question_answered"; params: { id: string; type: string; correct: boolean; ms: number } }
  | { name: "test_completed"; params: { ability: number; hsk: number; archetype: string; questions: number } }
  | { name: "result_viewed" }
  | { name: "share_clicked"; params: { channel: string } }
  | { name: "share_card_downloaded"; params: { format: "story" | "square" } }
  | { name: "course_cta_clicked" }
  | { name: "tutor_chat_started" }
  | { name: "tutor_message_sent"; params: { length: number } };

// Глобальный тип `window.ym` объявлен в components/analytics/YandexMetrika.tsx
// (id: number). Здесь не дублируем — берём из глобальной области как есть.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: DiagnosticEvent) {
  if (typeof window === "undefined") return;

  // eslint-disable-next-line no-console
  console.log(`[diagnostic] ${event.name}`, "params" in event ? event.params : "");

  try {
    const ymId = Number(process.env.NEXT_PUBLIC_YM_ID);
    if (window.ym && ymId) {
      const params = "params" in event ? event.params : {};
      window.ym(ymId, "reachGoal", event.name, params);
    }
  } catch {
    // ignore
  }

  try {
    if (window.gtag) {
      const params = "params" in event ? event.params : {};
      window.gtag("event", event.name, params);
    }
  } catch {
    // ignore
  }
}
