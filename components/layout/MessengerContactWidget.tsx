"use client";

import { getLeadAttribution } from "@/lib/attribution/browser";
import { getCachedYandexClientId } from "@/lib/analytics/yandex-client-id";

import { Mail, MessageCircleMore, Phone, Send } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConsent } from "@/lib/consent/context";
import { LEGAL_DOCUMENT_PATHS } from "@/lib/legal/document-paths";
import { WEBSITE_CONTACT_TEMPLATE, type WebsiteMessengerChannel } from "@/lib/leads/messenger-links";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

const CHANNELS: Array<{ id: WebsiteMessengerChannel; label: string; logo: string }> = [
  { id: "whatsapp", label: "WhatsApp", logo: "/brand/messengers/whatsapp.svg" },
  { id: "max", label: "MAX", logo: "/brand/messengers/max.svg?v=2" },
  { id: "telegram", label: "Telegram", logo: "/brand/messengers/telegram.svg?v=2" },
];

type ChatMessage = {
  id: string;
  clientNonce: string | null;
  direction: "incoming" | "outgoing" | "internal";
  text: string;
  sourceTimestamp: string;
  deliveryStatus: "pending" | "sent" | "delivered" | "read" | "failed";
};

type LocalChatMessage = ChatMessage & { retryText?: string };

function mergeMessages(current: LocalChatMessage[], incoming: ChatMessage[]): LocalChatMessage[] {
  const byKey = new Map<string, LocalChatMessage>();
  for (const message of current) byKey.set(message.clientNonce || message.id, message);
  for (const message of incoming) byKey.set(message.clientNonce || message.id, message);
  return [...byKey.values()].sort((left, right) => {
    const byTime = Date.parse(left.sourceTimestamp) - Date.parse(right.sourceTimestamp);
    return byTime || left.id.localeCompare(right.id);
  });
}

export default function MessengerContactWidget() {
  const pathname = usePathname();
  const { isBannerOpen } = useConsent();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState<WebsiteMessengerChannel | null>(null);
  const [error, setError] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const attributionSent = useRef(false);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    setTimeLabel(new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
  }, []);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (open && shellRef.current && !shellRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || sessionReady) return;
    let cancelled = false;
    void fetch("/api/website-chat/session", { method: "POST" })
      .then(async (response) => {
        const payload = await response.json() as { ok?: boolean; messages?: ChatMessage[]; error?: string };
        if (!response.ok || !payload.ok) throw new Error(payload.error || "Чат временно недоступен");
        if (cancelled) return;
        setMessages((current) => mergeMessages(current, payload.messages ?? []));
        const last = payload.messages?.at(-1);
        if (last) lastMessageIdRef.current = last.id;
        setSessionReady(true);
      })
      .catch((cause) => !cancelled && setError(cause instanceof Error ? cause.message : "Чат временно недоступен"));
    return () => { cancelled = true; };
  }, [open, sessionReady]);

  useEffect(() => {
    if (!open || !sessionReady) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let delay = 2000;
    const poll = async () => {
      if (cancelled) return;
      if (document.visibilityState !== "visible") {
        timer = setTimeout(poll, 5000);
        return;
      }
      try {
        const after = lastMessageIdRef.current ? `?after=${encodeURIComponent(lastMessageIdRef.current)}` : "";
        const response = await fetch(`/api/website-chat/messages${after}`, { cache: "no-store" });
        const payload = await response.json() as { ok?: boolean; messages?: ChatMessage[] };
        if (!response.ok || !payload.ok) throw new Error("poll failed");
        const next = payload.messages ?? [];
        if (next.length) {
          setMessages((current) => mergeMessages(current, next));
          lastMessageIdRef.current = next.at(-1)?.id ?? lastMessageIdRef.current;
        }
        delay = 2000;
      } catch {
        delay = Math.min(delay * 2, 15000);
      }
      if (!cancelled) timer = setTimeout(poll, delay);
    };
    timer = setTimeout(poll, delay);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [open, sessionReady]);

  if (pathname === "/chinese/hsk-test/take" || pathname === "/careers" || pathname.startsWith("/careers/") || LEGAL_DOCUMENT_PATHS.has(pathname)) return null;

  const start = async (channel: WebsiteMessengerChannel) => {
    setLoading(channel);
    setError("");
    try {
      const response = await fetch("/api/messenger-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, sourcePage: pathname, message: draft.trim() || undefined, ...getLeadAttribution(), yandex_client_id: getCachedYandexClientId() }),
      });
      const result = await response.json() as { ok?: boolean; url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Не удалось открыть мессенджер");
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось открыть мессенджер");
      setLoading(null);
    }
  };

  const sendMessage = async (retry?: LocalChatMessage) => {
    const text = (retry?.retryText ?? retry?.text ?? draft).trim();
    if (!text || sending) return;
    const clientNonce = retry?.clientNonce || crypto.randomUUID();
    const optimisticId = retry?.id || `tmp-${clientNonce}`;
    const optimistic: LocalChatMessage = {
      id: optimisticId,
      clientNonce,
      direction: "incoming",
      text,
      sourceTimestamp: retry?.sourceTimestamp ?? new Date().toISOString(),
      deliveryStatus: "pending",
      retryText: text,
    };
    setSending(true);
    setError("");
    if (!retry) {
      setDraft("");
      setMessages((current) => mergeMessages(current, [optimistic]));
    } else {
      setMessages((current) => current.map((message) => message.id === optimisticId ? optimistic : message));
    }
    try {
      const response = await fetch("/api/website-chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientNonce, text, sourcePage: pathname, ...(!attributionSent.current ? { ...getLeadAttribution(), yandex_client_id: getCachedYandexClientId() } : {}) }),
      });
      const payload = await response.json() as { ok?: boolean; message?: ChatMessage; error?: string };
      if (!response.ok || !payload.ok || !payload.message) throw new Error(payload.error || "Не удалось отправить сообщение");
      setMessages((current) => mergeMessages(current.filter((message) => message.id !== optimisticId), [payload.message!]));
      attributionSent.current = true;
      lastMessageIdRef.current = payload.message.id;
      setSessionReady(true);
    } catch (cause) {
      setMessages((current) => current.map((message) => message.id === optimisticId
        ? { ...message, deliveryStatus: "failed", retryText: text }
        : message));
      setError(cause instanceof Error ? cause.message : "Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`messenger-widget${open ? " messenger-widget--open" : ""}${isBannerOpen ? " messenger-widget--mobile-hidden" : ""}`} ref={shellRef}>
      {open && (
        <div className="messenger-widget-panel" role="dialog" aria-label="Связаться с ChinaChild">
          <header className="messenger-widget-header">
            <span className="messenger-widget-avatar messenger-widget-avatar--large">
              <Image src="/staff/messenger-curator.png" alt="" width={66} height={66} sizes="66px" />
              <i aria-hidden="true" />
            </span>
            <span className="messenger-widget-team-copy">
              <strong>Денис</strong>
              <small>Куратор</small>
            </span>
            <button className="messenger-widget-close" type="button" aria-label="Закрыть" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z"
                />
              </svg>
            </button>
          </header>

          <div className="messenger-widget-conversation">
            <time>{timeLabel}</time>
            <div className="messenger-widget-message-row">
              <span className="messenger-widget-avatar messenger-widget-avatar--small">
                <Image src="/staff/messenger-curator.png" alt="" width={36} height={36} sizes="36px" />
              </span>
              <p>
                <span>Здравствуйте 👋</span>
                <span>Чем я могу помочь?</span>
              </p>
            </div>
            {messages.map((message) => (
              <div key={message.id} className={`messenger-widget-chat-message messenger-widget-chat-message--${message.direction}`}>
                <p>{message.text}</p>
                <small>
                  {message.deliveryStatus === "pending" ? "Отправляется…" : message.deliveryStatus === "failed" ? "Не отправлено" : "Доставлено"}
                </small>
                {message.deliveryStatus === "failed" ? (
                  <button type="button" onClick={() => void sendMessage(message)}>Повторить</button>
                ) : null}
              </div>
            ))}
            <label className="messenger-widget-reply">
              <span className="sr-only">Сообщение куратору</span>
              <input
                type="text"
                value={draft}
                maxLength={500}
                placeholder="Введите ваш запрос"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <button type="button" aria-label="Отправить сообщение" disabled={!draft.trim() || sending} onClick={() => void sendMessage()}>
                <Send aria-hidden="true" />
              </button>
            </label>
          </div>

          <div className="messenger-widget-options" aria-label="Способы связи">
            {CHANNELS.map((channel) => (
              <button key={channel.id} type="button" aria-label={channel.label} title={channel.label} onClick={() => void start(channel.id)} disabled={loading !== null}>
                <Image src={channel.logo} alt="" width={54} height={54} sizes="54px" />
              </button>
            ))}
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Обращение с сайта ChinaChild")}&body=${encodeURIComponent(draft.trim() || WEBSITE_CONTACT_TEMPLATE)}`} aria-label="Почта" title="Почта">
              <Mail aria-hidden="true" />
            </a>
            <a href={`tel:${CONTACT_PHONE_TEL}`} aria-label={`Позвонить ${CONTACT_PHONE}`} title={`Позвонить ${CONTACT_PHONE}`}>
              <Phone aria-hidden="true" />
            </a>
          </div>
          {error && <p className="messenger-widget-error" role="status">{error}</p>}
        </div>
      )}
      <button className="messenger-widget-toggle" type="button" aria-expanded={open} aria-label={open ? "Закрыть способы связи" : "Написать нам"} onClick={() => setOpen((value) => !value)}>
        <MessageCircleMore aria-hidden="true" />
      </button>
    </div>
  );
}
