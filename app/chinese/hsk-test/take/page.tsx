"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import QuizRunner from "@/components/hsk-test/QuizRunner";
import { useHskTest } from "@/lib/hsk-test/state";

export default function HskTestTakePage() {
  const router = useRouter();
  const { state, hydrated } = useHskTest();

  const ready =
    Boolean(state.level) && Boolean(state.mode) && state.questions.length > 0;

  // Hydration guard — wait for localStorage rehydrate before redirecting.
  // A direct visit to /take has no started test, so bounce to the landing.
  useEffect(() => {
    if (hydrated && !ready) {
      router.replace("/chinese/hsk-test");
    }
  }, [hydrated, ready, router]);

  if (!ready) {
    return (
      <div className="hsk-quiz hsk-quiz-loading">
        <p className="hsk-quiz-body">Готовим тест…</p>
      </div>
    );
  }

  return <QuizRunner />;
}
