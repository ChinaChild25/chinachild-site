import type {
  HskAnswer,
  HskTestLevel,
  HskTestMode,
  HskTestQuestion,
  HskTestResult,
  HskTestSkill,
  Verdict,
} from "./types";

const SKILLS: HskTestSkill[] = ["vocabulary", "grammar", "reading", "listening"];

export function isAnswerCorrect(
  question: HskTestQuestion,
  answer: unknown,
): { correct: boolean; partial?: number } {
  switch (question.type) {
    case "match_translation":
    case "pinyin":
    case "fill_blank":
    case "reading":
    case "grammar_choice":
    case "audio_choice":
      return { correct: typeof answer === "number" && answer === question.correct };

    case "tone_id":
      return { correct: typeof answer === "number" && answer === question.correct };

    case "sentence_order": {
      if (!Array.isArray(answer)) return { correct: false };
      if (answer.length !== question.correctOrder.length) return { correct: false };
      const match = answer.every(
        (val, i) => typeof val === "number" && val === question.correctOrder[i],
      );
      return { correct: match };
    }

    case "pair_matching": {
      // Answer is array of indexes — answer[i] is the index of `right`
      // chosen for `left[i]`. In our DB right[] is canonical order, so
      // the correct answer is `[0, 1, 2, ...]`.
      if (!Array.isArray(answer)) return { correct: false };
      const len = question.left.length;
      let hits = 0;
      for (let i = 0; i < len; i++) {
        if (answer[i] === i) hits++;
      }
      const correct = hits === len;
      return correct
        ? { correct: true, partial: 1 }
        : { correct: false, partial: hits / len };
    }
  }
}

export function scoreAnswer(
  question: HskTestQuestion,
  answer: unknown,
): HskAnswer {
  const result = isAnswerCorrect(question, answer);
  return {
    questionId: question.id,
    correct: result.correct,
    partial: result.partial,
    skill: question.skill,
    difficulty: question.difficulty,
    raw: answer,
  };
}

export function computeResult(
  level: HskTestLevel,
  mode: HskTestMode,
  questions: HskTestQuestion[],
  answers: HskAnswer[],
): HskTestResult {
  const totalCount = questions.length;
  let correctCount = 0;
  let weightedSum = 0;
  let weightedTotal = 0;

  const skillSum: Record<HskTestSkill, number> = {
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    listening: 0,
  };
  const skillWeight: Record<HskTestSkill, number> = {
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    listening: 0,
  };

  for (const q of questions) {
    const ans = answers.find((a) => a.questionId === q.id);
    const credit = ans ? (ans.correct ? 1 : ans.partial ?? 0) : 0;

    if (credit >= 1) correctCount++;
    weightedSum += credit * q.difficulty;
    weightedTotal += q.difficulty;

    skillSum[q.skill] += credit * q.difficulty;
    skillWeight[q.skill] += q.difficulty;
  }

  const score = weightedTotal > 0 ? weightedSum / weightedTotal : 0;

  const skills: Record<HskTestSkill, number> = {
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    listening: 0,
  };
  for (const s of SKILLS) {
    skills[s] = skillWeight[s] > 0 ? skillSum[s] / skillWeight[s] : 0;
  }

  const { verdict, recommendedLevel } = decide(level, score);

  return {
    level,
    mode,
    correctCount,
    totalCount,
    score,
    skills,
    verdict,
    recommendedLevel,
    date: new Date().toISOString(),
  };
}

function clampLevel(value: number): HskTestLevel {
  if (value <= 1) return 1;
  if (value >= 4) return 4;
  return value as HskTestLevel;
}

/**
 * Verdict thresholds. Tuned so that:
 * - You can't "confirm" HSK N by getting 3/10. Confirmation requires 70%+.
 * - Borderline (50–70%) keeps you at the chosen level — you have the base
 *   but it's shaky, the recommendation is the same level to solidify.
 * - Below 50% drops you a level. Below ~25% drops you two levels.
 */
export function decide(
  level: HskTestLevel,
  score: number,
): { verdict: Verdict; recommendedLevel: HskTestLevel } {
  if (score >= 0.85) {
    return {
      verdict: "exceeds",
      recommendedLevel: clampLevel(level + 1),
    };
  }
  if (score >= 0.7) {
    return { verdict: "confirmed", recommendedLevel: level };
  }
  if (score >= 0.5) {
    return { verdict: "borderline", recommendedLevel: level };
  }
  // Below 50% — clearly not at this level. Drop proportionally:
  // very low scores drop two levels so we don't push HSK 3 onto someone
  // who got 2/10 on HSK 4 (they likely belong at HSK 1–2).
  const drop = score < 0.25 ? 2 : 1;
  return {
    verdict: "below",
    recommendedLevel: clampLevel(level - drop),
  };
}

export function verdictCopy(
  level: HskTestLevel,
  verdict: Verdict,
  recommendedLevel: HskTestLevel,
): { title: string; description: string } {
  switch (verdict) {
    case "exceeds":
      return {
        title: `Вы уверенно прошли HSK ${level} — можно браться за HSK ${recommendedLevel}`,
        description: `Базы HSK ${level} достаточно, и часть заданий следующего уровня вам тоже даётся. Логично переходить к HSK ${recommendedLevel}.`,
      };
    case "confirmed":
      return {
        title: `Уровень HSK ${level} подтверждён`,
        description: `Вы уверенно владеете лексикой и грамматикой HSK ${level}. Можно готовиться к экзамену или начинать программу следующего уровня.`,
      };
    case "borderline":
      return {
        title: `Уровень HSK ${level} ещё не подтверждён`,
        description: `База у вас есть, но пока шатко: часть заданий решена, часть — нет. Останьтесь на HSK ${level} и пройдите программу до конца, чтобы окончательно закрепить грамматику и лексику.`,
      };
    case "below": {
      const big = level - recommendedLevel >= 2;
      if (big) {
        return {
          title: `Уровень HSK ${level} пока далеко`,
          description: `Тест показал, что заданий HSK ${level} вы пока почти не узнаёте. Рекомендуем начать с HSK ${recommendedLevel} — это закроет провалы в базовой лексике и грамматике, а через несколько месяцев вы спокойно пройдёте этот тест.`,
        };
      }
      return {
        title: `Ваш уровень ближе к HSK ${recommendedLevel}`,
        description: `Тест показал, что для HSK ${level} нужно подтянуть базу. Рекомендуем курс HSK ${recommendedLevel} — через 2–3 месяца регулярных занятий вы будете готовы к HSK ${level}.`,
      };
    }
  }
}

export const SKILL_LABELS: Record<HskTestSkill, string> = {
  vocabulary: "Лексика",
  grammar: "Грамматика",
  reading: "Чтение",
  listening: "Понимание на слух",
};
