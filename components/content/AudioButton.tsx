"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pause } from "lucide-react";

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="8" width="2.75" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M6.75 8 12 5v14l-5.25-3"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 9.25c1.65 1.35 1.65 4.15 0 5.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M15.75 7c2.75 2.25 2.75 7.75 0 10"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M18 4.75c3.85 3.15 3.85 10.35 0 14.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

type AudioState = "idle" | "loading" | "playing" | "error";

// Site-native audio button. Used for cached Mandarin TTS clips on dictionary
// word pages and grammar example cards. Always streams a pre-generated URL
// (Supabase public storage) — never calls OpenAI from the client.
//
// All buttons subscribe to a tiny window-scoped event bus so that starting
// one clip stops any other playing clip. Keeps the page calm.

const STOP_EVENT = "chinachild:audio:stop";

function emitStop(id: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STOP_EVENT, { detail: { id } }));
}

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const iconSizes: Record<Size, string> = {
  sm: "size-4",
  md: "size-[17px]",
  lg: "size-5",
};

const primaryShapeClasses: Record<Size, string> = {
  sm: "rounded-[8px]",
  md: "rounded-[11px]",
  lg: "rounded-[13px]",
};

export default function AudioButton({
  src,
  ariaLabel,
  size = "md",
  variant = "neutral",
  className,
}: {
  src: string;
  ariaLabel: string;
  size?: Size;
  variant?: "neutral" | "primary";
  className?: string;
}) {
  const [state, setState] = useState<AudioState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const idRef = useRef<string>(`audio-${Math.random().toString(36).slice(2)}`);

  // Stop this button if another button starts.
  useEffect(() => {
    function handle(event: Event) {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      if (detail?.id === idRef.current) return;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setState((current) => (current === "playing" || current === "loading" ? "idle" : current));
    }
    window.addEventListener(STOP_EVENT, handle);
    return () => window.removeEventListener(STOP_EVENT, handle);
  }, []);

  async function toggle() {
    if (!src) return;
    const audio = audioRef.current;

    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      setState("idle");
      return;
    }

    emitStop(idRef.current);
    try {
      setState("loading");
      const el = audio ?? new Audio(src);
      audioRef.current = el;
      el.onended = () => setState("idle");
      el.onerror = () => setState("error");
      el.onpause = () => setState((current) => (current === "playing" ? "idle" : current));
      el.onplaying = () => setState("playing");
      await el.play();
    } catch {
      setState("error");
    }
  }

  const baseClass =
    variant === "primary"
      ? "bg-[#262626] text-white hover:bg-[#1a1a1a]"
      : "bg-white text-[#1b1b1b] ring-1 ring-black/[0.08] hover:bg-[#f6f3eb]";

  const stateClass =
    state === "error"
      ? variant === "primary"
        ? "bg-[#8a3e1f] text-white"
        : "bg-[#fdf0e8] text-[#8a3e1f] ring-1 ring-[#e0a888]"
      : baseClass;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={state === "error" ? "Озвучка недоступна" : ariaLabel}
      title={state === "error" ? "Озвучка недоступна" : ariaLabel}
      disabled={!src}
      className={[
        "inline-flex shrink-0 items-center justify-center transition-colors",
        variant === "primary" ? primaryShapeClasses[size] : "rounded-full",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#262626] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        stateClass,
        className ?? "",
      ].join(" ")}
    >
      {state === "loading" ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} aria-hidden />
      ) : state === "playing" ? (
        <Pause className={iconSizes[size]} aria-hidden />
      ) : (
        <SpeakerIcon className={iconSizes[size]} />
      )}
    </button>
  );
}
