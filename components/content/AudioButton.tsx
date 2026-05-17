"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play, Volume2 } from "lucide-react";

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
  md: "size-[18px]",
  lg: "size-5",
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
    state === "error" ? "bg-[#fdf0e8] text-[#8a3e1f] ring-[#e0a888]" : baseClass;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={state === "error" ? "Озвучка недоступна" : ariaLabel}
      title={state === "error" ? "Озвучка недоступна" : ariaLabel}
      disabled={!src}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
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
      ) : state === "error" ? (
        <Volume2 className={iconSizes[size]} aria-hidden />
      ) : (
        <Play className={iconSizes[size]} aria-hidden />
      )}
    </button>
  );
}
