import { hasOpenAIKey, streamChat } from "@/lib/diagnostic/openai-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface DiagnosePayload {
  hsk: number;
  ability: number;
  archetype: string;
  archetypeRu: string;
  archetypeZh: string;
  skills: {
    hanzi: number;
    tones: number;
    grammar: number;
    reading: number;
    speed: number;
    listening: number;
  };
  calibration: {
    experience: string;
    goal: string;
    minutesPerDay: number;
  };
  questionsAnswered: number;
  percentileVsCohort: number;
}

const SYSTEM_PROMPT = `Ты главный методист китайской онлайн-школы ChinaChild. Пишешь персональный разбор результатов диагностики для одного ученика.
Правила:
- На «вы», уважительно, по-деловому.
- Без markdown, без эмодзи, без звёздочек.
- Без шаблонных похвал («молодец», «отлично»). Без восклицательных знаков.
- 180–230 слов, плотный текст из 3–4 абзацев, разделённых пустой строкой.
- Конкретика: какие именно навыки слабее, что делать дальше, в каком темпе, на чём не зацикливаться.
- В конце — одно предложение про реалистичные сроки до следующего уровня HSK.`;

function buildUserPrompt(payload: DiagnosePayload): string {
  const expRu = expLabel(payload.calibration.experience);
  const goalRu = goalLabel(payload.calibration.goal);
  return [
    `Уровень по итогам адаптивного теста: HSK ${payload.hsk} (θ=${payload.ability.toFixed(2)}).`,
    `Стаж изучения: ${expRu}. Цель: ${goalRu}. Готов уделять: ${payload.calibration.minutesPerDay} мин/день.`,
    `Архетип: ${payload.archetypeRu} (${payload.archetypeZh}).`,
    `Профиль навыков (0–100): 字 ${payload.skills.hanzi}, 音 ${payload.skills.tones}, 语 ${payload.skills.grammar}, 读 ${payload.skills.reading}, 速 ${payload.skills.speed}, 听 ${payload.skills.listening}.`,
    `Перцентиль среди ровесников по стажу: ${payload.percentileVsCohort}.`,
    `Ответил на ${payload.questionsAnswered} вопросов.`,
    "",
    "Напиши персональный разбор. Не повторяй цифры дословно — интерпретируй их.",
  ].join("\n");
}

function expLabel(exp: string): string {
  switch (exp) {
    case "none": return "не изучал ранее";
    case "lt3m": return "меньше 3 месяцев";
    case "lt1y": return "до года";
    case "1to3y": return "от 1 до 3 лет";
    case "gt3y": return "больше 3 лет";
    default: return exp;
  }
}

function goalLabel(goal: string): string {
  switch (goal) {
    case "work": return "работа";
    case "travel": return "путешествия";
    case "live": return "жизнь в Китае";
    case "fun": return "для души";
    case "business": return "бизнес";
    default: return goal;
  }
}

function fallbackResponse(payload: DiagnosePayload): Response {
  // Используется, когда нет ключа или OpenAI недоступен.
  const text = [
    `По итогам диагностики ваш уровень определён как HSK ${payload.hsk}. Сильнее всего у вас развит навык «${strongestAxis(payload.skills)}» — это надёжная точка опоры, на которой стоит строить дальнейшее обучение.`,
    "",
    `Слабее остальных оказался навык «${weakestAxis(payload.skills)}». Это типичная картина для архетипа «${payload.archetypeRu}», и она хорошо лечится точечной работой — не нужно переучивать всё, достаточно перенести фокус на 4–6 недель.`,
    "",
    `При темпе ${payload.calibration.minutesPerDay} минут в день вы получите заметный прогресс уже через два месяца. Ставка на регулярность, а не на длину занятия, для вас даст наибольший эффект.`,
    "",
    `Реалистичный срок до HSK ${Math.min(5, payload.hsk + 1)} — 4–6 месяцев при текущем темпе.`,
  ].join("\n");
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

const AXIS_LABEL: Record<string, string> = {
  hanzi: "распознавание иероглифов",
  tones: "тоны и фонетика",
  grammar: "грамматика",
  reading: "чтение",
  speed: "скорость",
  listening: "аудирование",
};

function strongestAxis(skills: DiagnosePayload["skills"]): string {
  const entries = Object.entries(skills) as Array<[keyof typeof skills, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return AXIS_LABEL[entries[0][0] as string];
}

function weakestAxis(skills: DiagnosePayload["skills"]): string {
  const entries = Object.entries(skills) as Array<[keyof typeof skills, number]>;
  entries.sort((a, b) => a[1] - b[1]);
  return AXIS_LABEL[entries[0][0] as string];
}

export async function POST(req: Request) {
  let payload: DiagnosePayload;
  try {
    payload = (await req.json()) as DiagnosePayload;
  } catch {
    return Response.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  if (!hasOpenAIKey()) {
    return fallbackResponse(payload);
  }

  try {
    const stream = await streamChat({
      model: "reasoning",
      maxTokens: 700,
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(payload) },
      ],
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[diagnose] OpenAI failure", err);
    return fallbackResponse(payload);
  }
}
