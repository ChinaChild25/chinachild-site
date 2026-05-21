import { completeJson, hasOpenAIKey } from "@/lib/diagnostic/openai-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface SpeechPayload {
  expectedHanzi: string;
  expectedPinyin: string;
  transcript: string;
}

interface SpeechEval {
  /** 0..1 — насколько близко произношение к эталону. */
  score: number;
  /** "native" | "understandable" | "needs-work" */
  verdict: "native" | "understandable" | "needs-work";
  /** Короткая ремарка. */
  note: string;
}

const SYSTEM_PROMPT = `Ты фонетист-китаист. Оцениваешь, насколько произношение ученика соответствует эталонной фразе.

Тебе дают:
- эталон: иероглифы + пиньинь
- то, что Web Speech распознал из произнесённого

Учти:
- транскрипт может быть на упрощённом китайском (без тонов) или сильно искажён;
- если транскрипт почти совпадает по слогам — это «понятно»;
- если совпадает почти полностью — «как у носителя»;
- если совпадает плохо или это другой язык — «нужна работа».

Верни строго JSON:
{
  "score": число 0..1 с одним знаком после запятой,
  "verdict": "native" | "understandable" | "needs-work",
  "note": одно предложение на русском, без эмодзи, без markdown
}`;

function localFallback(payload: SpeechPayload): SpeechEval {
  // Простой fallback: считаем долю совпадающих иероглифов
  const transcript = payload.transcript.trim();
  if (!transcript) {
    return { score: 0, verdict: "needs-work", note: "Не удалось распознать произношение." };
  }
  const expected = payload.expectedHanzi.replace(/\s+/g, "");
  let matches = 0;
  for (const ch of expected) {
    if (transcript.includes(ch)) matches += 1;
  }
  const score = expected.length === 0 ? 0 : matches / expected.length;
  if (score >= 0.85) return { score: 1, verdict: "native", note: "Чисто и понятно." };
  if (score >= 0.5) return { score: 0.6, verdict: "understandable", note: "Понятно, но есть акцент." };
  return { score: 0.2, verdict: "needs-work", note: "Нужна работа над тонами и слогами." };
}

export async function POST(req: Request) {
  let payload: SpeechPayload;
  try {
    payload = (await req.json()) as SpeechPayload;
  } catch {
    return Response.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  if (!hasOpenAIKey()) {
    return Response.json({ ok: true, eval: localFallback(payload) });
  }

  try {
    const result = await completeJson<SpeechEval>({
      model: "reasoning",
      maxTokens: 200,
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            expectedHanzi: payload.expectedHanzi,
            expectedPinyin: payload.expectedPinyin,
            transcript: payload.transcript.slice(0, 300),
          }),
        },
      ],
    });
    return Response.json({ ok: true, eval: result });
  } catch (err) {
    console.error("[speech-eval] OpenAI failure", err);
    return Response.json({ ok: true, eval: localFallback(payload) });
  }
}
