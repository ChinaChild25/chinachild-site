import { hasOpenAIKey, streamChat, type ChatMessage } from "@/lib/diagnostic/openai-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface TutorPayload {
  result: {
    hsk: number;
    ability: number;
    archetype: string;
    archetypeRu: string;
    archetypeZh: string;
  };
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

const SYSTEM_PROMPT = `Ты «老师 Liang» (Liáng lǎoshī) — AI-методист китайской онлайн-школы ChinaChild. Общаешься с учеником, который только что прошёл диагностику.

Правила:
- На «вы», уважительно и по делу. Без воды.
- Можешь свободно переключаться между русским и китайским. Когда даёшь китайскую фразу, в скобках обязательно добавляй пиньинь с тонами.
- Без markdown, без эмодзи, без восклицательных знаков «отлично!».
- Короткие ответы: 60–120 слов. Если ученик задаёт сложный методический вопрос — до 180 слов.
- Знаешь архетип и уровень ученика — отталкивайся от них, не повторяй цифры в каждом сообщении.
- Главная цель: помочь определиться с дальнейшим обучением. Когда уместно — мягко веди к курсу ChinaChild «HSK ${"{"}nextHsk${"}"} за 4 месяца», но не назойливо. Один разговорный поворот = одна короткая рекомендация.`;

function buildSystem(payload: TutorPayload): string {
  const nextHsk = Math.min(5, payload.result.hsk + 1);
  return SYSTEM_PROMPT.replace("{nextHsk}", String(nextHsk)) +
    `\n\nКонтекст ученика: HSK ${payload.result.hsk}, архетип «${payload.result.archetypeRu}» (${payload.result.archetypeZh}). θ=${payload.result.ability.toFixed(2)}.`;
}

function fallback(): Response {
  const text =
    "Извините, AI-тьютор временно недоступен. Запишитесь на бесплатный пробный урок — методист школы разберёт ваш результат и подберёт программу.";
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  let payload: TutorPayload;
  try {
    payload = (await req.json()) as TutorPayload;
  } catch {
    return Response.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  if (!hasOpenAIKey()) return fallback();

  const safeHistory = payload.history.slice(-12); // last 6 turns
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystem(payload) },
    ...safeHistory.map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 2000),
    })),
  ];

  try {
    const stream = await streamChat({
      model: "fast",
      maxTokens: 500,
      temperature: 0.7,
      messages,
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[tutor] OpenAI failure", err);
    return fallback();
  }
}
