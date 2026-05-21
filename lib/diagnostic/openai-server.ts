import "server-only";

/**
 * Минимальный helper для OpenAI Chat Completions API.
 * Без SDK — прямой fetch, чтобы не добавлять npm-зависимости.
 *
 * Возвращает ReadableStream<Uint8Array> с чистым текстом (delta.content),
 * который мы пересылаем клиенту через `text/plain; charset=utf-8`.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type OpenAIModel = "reasoning" | "fast";

const REASONING_MODEL =
  process.env.OPENAI_MODEL_REASONING || "gpt-4o";
const FAST_MODEL =
  process.env.OPENAI_MODEL_FAST || "gpt-4o-mini";

function resolveModel(model: OpenAIModel): string {
  return model === "reasoning" ? REASONING_MODEL : FAST_MODEL;
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

interface SSEFrame {
  choices?: Array<{
    delta?: { content?: string | null };
    finish_reason?: string | null;
  }>;
}

export async function streamChat(opts: {
  model: OpenAIModel;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: resolveModel(opts.model),
      messages: opts.messages,
      stream: true,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens ?? 700,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    throw new Error(`OpenAI ${upstream.status}: ${text.slice(0, 400)}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  // Качаем всё через start(), чтобы буфер пережил между чанками.
  // Прошлая версия с pull() пересоздавала buffer на каждом pull
  // и теряла «хвост» — это резало стрим AI-разбора посередине.
  return new ReadableStream<Uint8Array>({
    start(controller) {
      (async () => {
        let buffer = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload) as SSEFrame;
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch {
                // парсинг провалился — кусок JSON приехал «битым»,
                // вернём остаток в буфер и подождём следующего чанка
                buffer = line + (buffer ? "\n" + buffer : "");
                break;
              }
            }
          }
          // Финальный flush — если в buffer осталась полная SSE-строка
          if (buffer.trim().startsWith("data:")) {
            const payload = buffer.trim().slice(5).trim();
            if (payload && payload !== "[DONE]") {
              try {
                const json = JSON.parse(payload) as SSEFrame;
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch {
                /* ignore tail */
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      })();
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/** Non-streaming JSON completion — для оценки произношения. */
export async function completeJson<T>(opts: {
  model: OpenAIModel;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: resolveModel(opts.model),
      messages: opts.messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 200,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = json.choices[0]?.message?.content;
  if (!content) throw new Error("Empty completion");
  return JSON.parse(content) as T;
}
