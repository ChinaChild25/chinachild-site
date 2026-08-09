"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TutorAvatar from "@/components/diagnostic/TutorAvatar";
import { useDiagnostic } from "@/lib/diagnostic/state";
import { ARCHETYPES } from "@/lib/diagnostic/archetypes";
import { track } from "@/lib/diagnostic/analytics";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export default function TutorPage() {
  const router = useRouter();
  const { state, hydrated } = useDiagnostic();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.result) {
      router.replace("/diagnostic");
      return;
    }
    if (initialisedRef.current) return;
    initialisedRef.current = true;
    track({ name: "tutor_chat_started" });
    const archetype = ARCHETYPES[state.result.archetype];
    setMessages([
      {
        role: "assistant",
        content:
          `你好！Я Liang (Liáng lǎoshī), методист ChinaChild. Видел ваш результат: HSK ${state.result.hsk}, архетип «${archetype.ru}». О чём поговорим — про программу, конкретные слабые места или просто по-китайски?`,
      },
    ]);
  }, [hydrated, state.result, router]);

  // авто-скролл вниз при новом сообщении
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  // авто-resize textarea
  useEffect(() => {
    if (!taRef.current) return;
    const el = taRef.current;
    el.style.height = "auto";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [input]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !state.result || !state.calibration) return;
    track({ name: "tutor_message_sent", params: { length: text.length } });

    const newMessages: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    // создаём пустой ассистент-слот для стриминга
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const archetype = ARCHETYPES[state.result.archetype];
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: {
            hsk: state.result.hsk,
            ability: state.result.ability,
            archetype: archetype.id,
            archetypeRu: archetype.ru,
            archetypeZh: archetype.zh,
          },
          history: newMessages,
        }),
      });
      if (!res.ok || !res.body) throw new Error("bad response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = prev.slice();
          const last = next[next.length - 1];
          if (last && last.role === "assistant") {
            next[next.length - 1] = { ...last, content: last.content + chunk };
          }
          return next;
        });
      }
    } catch (err) {
      console.error("[tutor] stream failed", err);
      setMessages((prev) => {
        const next = prev.slice();
        if (next[next.length - 1]?.role === "assistant" && next[next.length - 1].content === "") {
          next[next.length - 1] = {
            role: "assistant",
            content:
              "Связь временно недоступна. Можете записаться на бесплатный пробный — методист разберёт ваш результат лично.",
          };
        }
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  if (!hydrated || !state.result) {
    return <main className="d-shell-narrow"><div className="d-small">Загружаю чат…</div></main>;
  }

  const nextHsk = state.result.nextHsk;

  return (
    <main className="d-shell-narrow">
      <div className="d-chat-frame">
        <header className="d-chat-header">
          <TutorAvatar />
          <div>
            <div style={{ fontWeight: 500 }}>Liang lǎoshī</div>
            <div className="d-small">AI-методист ChinaChild</div>
          </div>
          <Link
            href="/free-trial"
            className="d-chat-banner"
            onClick={() => track({ name: "course_cta_clicked" })}
          >
            Курс HSK {nextHsk} · от 15 990 ₽
          </Link>
        </header>

        <div className="d-chat-list" ref={listRef}>
          {messages.map((m, i) => (
            <div
              key={i}
              className="d-chat-msg"
              data-role={m.role}
              data-streaming={sending && i === messages.length - 1 && m.role === "assistant" ? true : undefined}
            >
              {m.content || (sending && m.role === "assistant" ? " " : "")}
            </div>
          ))}
        </div>

        <div className="d-chat-composer">
          <textarea
            ref={taRef}
            className="d-chat-input"
            placeholder="Спросите про программу, тоны или что угодно по китайскому"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
          />
          <button
            type="button"
            className="d-chat-send"
            onClick={send}
            disabled={sending || input.trim().length === 0}
            aria-label="Отправить"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <Link href="/diagnostic/result" className="d-btn-ghost">← Назад к результату</Link>
      </div>
    </main>
  );
}
