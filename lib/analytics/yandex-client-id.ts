"use client";

import { validateYandexClientId } from "./yandex-client-id-value.ts";

declare global {
  interface Window {
    ym?: (counter: number, action: string, ...args: unknown[]) => void;
  }
}

let cachedClientId: string | null = null;
let captureStarted = false;

export function getCachedYandexClientId(): string | undefined {
  return cachedClientId ?? undefined;
}

function captureYandexClientId(): void {
  if (
    cachedClientId ||
    captureStarted ||
    typeof window === "undefined" ||
    typeof window.ym !== "function"
  ) {
    return;
  }

  const counterId = Number(process.env.NEXT_PUBLIC_YM_ID);
  if (!Number.isSafeInteger(counterId) || counterId <= 0) return;

  captureStarted = true;
  try {
    window.ym(counterId, "getClientID", (value: unknown) => {
      const clientId = validateYandexClientId(value);
      if (clientId) {
        cachedClientId = clientId;
      } else {
        captureStarted = false;
      }
    });
  } catch {
    captureStarted = false;
  }
}

export function startYandexClientIdCapture(): () => void {
  if (typeof window === "undefined") return () => {};

  captureYandexClientId();
  window.addEventListener("load", captureYandexClientId, { once: true });
  const retry = window.setTimeout(captureYandexClientId, 1_000);

  return () => {
    window.removeEventListener("load", captureYandexClientId);
    window.clearTimeout(retry);
  };
}
