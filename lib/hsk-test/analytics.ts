import { trackEvent } from "@/lib/analytics";
import type { HskTestLevel, HskTestMode, Verdict } from "./types";

type Params = Record<string, string | number | boolean | undefined>;

export function trackHskTest(name: string, params?: Params) {
  trackEvent(`hsk_test_${name}`, params);
}

export const HskTestGoals = {
  /** User clicked CTA on landing or a level card → entered the flow. */
  started: (level: HskTestLevel, mode: HskTestMode) =>
    trackHskTest("started", { level, mode }),

  /** Every answer. Heavy event — keeps reach quotas tight. */
  answered: (level: HskTestLevel, questionId: string, correct: boolean) =>
    trackHskTest("answered", { level, questionId, correct }),

  /** User saw result screen. */
  completed: (
    level: HskTestLevel,
    mode: HskTestMode,
    score: number,
    verdict: Verdict,
  ) => trackHskTest("completed", { level, mode, score, verdict }),

  /** Result screen → "Записаться на курс" click. The lead-magnet goal. */
  lead: (level: HskTestLevel, recommendedLevel: HskTestLevel) =>
    trackHskTest("lead", { level, recommendedLevel }),

  /** Share to a particular network. */
  shared: (level: HskTestLevel, network: string) =>
    trackHskTest("shared", { level, network }),

  /** Restart from result screen. */
  restarted: (level: HskTestLevel) => trackHskTest("restarted", { level }),
};
