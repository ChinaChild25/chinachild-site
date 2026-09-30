"use client";

import { Goals, trackEvent } from "@/lib/analytics";
import type {
  ApplicationMessengerChannel,
  ApplicationMessengerLinks,
} from "@/lib/leads/application-messenger-links";
import { CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

const LABELS: Record<ApplicationMessengerChannel, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  max: "MAX",
};

// The messengers' own marks (geometry from their brand SVGs): a brand disc with a white
// glyph for Telegram and MAX, the full-colour logo for WhatsApp.
function MessengerMark({ channel }: { channel: ApplicationMessengerChannel }) {
  if (channel === "whatsapp") {
    return (
      <svg viewBox="0 0 175.216 175.552" width="20" height="20" className="shrink-0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="lead-whatsapp-green" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#57d163" />
            <stop offset="1" stopColor="#23b33a" />
          </linearGradient>
        </defs>
        <path fill="#fff" d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z" />
        <path fill="url(#lead-whatsapp-green)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z" />
        <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0" aria-hidden="true" focusable="false">
      {channel === "max" ? (
        <defs>
          <linearGradient id="lead-max-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00BFFF" />
            <stop offset="0.54" stopColor="#471AFF" />
            <stop offset="1" stopColor="#9500FF" />
          </linearGradient>
        </defs>
      ) : null}
      <circle cx="12" cy="12" r="12" fill={channel === "max" ? "url(#lead-max-mark)" : "#229ED9"} />
      {channel === "max" ? (
        <svg x="5.5" y="5.5" width="13" height="13" viewBox="0 0 100 100">
          <path fill="#fff" d="M50.757 0.262c27.536 0 49.129 22.335 49.129 49.885 0 27.55-22.279 49.343-48.865 49.343-9.435 0-14.007-1.328-21.371-6.543-.507-.357-1.2-.264-1.629.193-5.664 6.043-20.171 10.286-20.835 2.036C7.186 80.79 0 71.447 0 49.876 0 21.555 23.221.262 50.757.262Zm.772 24.55c-13.065-.686-23.265 8.385-25.515 22.571-1.864 11.75 1.436 26.072 4.265 26.793 1.2.307 4.078-1.9 6.178-3.879.393-.371.993-.435 1.45-.15 3.272 2 6.972 3.5 11.05 3.715 13.414.7 25.3-9.8 26.007-23.215.7-13.414-10.021-25.143-23.435-25.843v.008Z" />
        </svg>
      ) : (
        <svg x="4.5" y="5" width="14" height="14" viewBox="35 50 155 135">
          <path fill="#fff" d="m81.486 130.178-29.286-9.542s-3.5-1.42-2.373-4.64c.232-.664.7-1.229 2.1-2.2 6.489-4.523 120.106-45.36 120.106-45.36s3.208-1.081 5.1-.362a2.766 2.766 0 0 1 1.885 2.055c.254.85.34 1.73.254 2.585-.009.752-.1 1.449-.169 2.542-.692 11.165-21.4 94.493-21.4 94.493s-1.239 4.876-5.678 5.043a8.13 8.13 0 0 1-5.925-2.292c-8.711-7.493-38.819-27.727-45.472-32.177a1.27 1.27 0 0 1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6 53.821-51.492c.108-.379-.3-.566-.848-.4-3.482 1.281-63.844 39.4-70.506 43.607a3.21 3.21 0 0 1-1.48.09Z" />
        </svg>
      )}
    </svg>
  );
}

/**
 * Optional second step after a stored application: continue right away in a messenger
 * instead of waiting for the curator. Plain links (no JS navigation), so mobile browsers
 * never block them as pop-ups; the visitor may ignore the step entirely.
 */
export default function LeadMessengerStep({ links }: { links: ApplicationMessengerLinks }) {
  const channels = (Object.keys(LABELS) as ApplicationMessengerChannel[]).filter((channel) => links[channel]);
  if (!channels.length) return null;

  return (
    <div className="grid gap-3" data-testid="lead-messenger-step">
      <div className="grid gap-1">
        <p className="m-0 text-[1rem] font-medium leading-[1.4]">Хотите продолжить общение прямо сейчас?</p>
        <p className="lead-success-text">
          Напишите нам в удобный мессенджер — куратор увидит вашу заявку и ответит там.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {channels.map((channel) => (
          <a
            key={channel}
            href={links[channel]}
            target="_blank"
            rel="noopener noreferrer"
            // Utilities only: the unlayered .btn-pill/.btn-white would override Tailwind's sizes.
            // White fill on the grey success card (dark fill in the dark theme) — no border.
            className="inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] bg-white px-3 py-[13px] text-[0.9rem] font-medium leading-none no-underline transition-colors hover:bg-[#f7f7f8] [html[data-theme=dark]_&]:bg-[#2a2a2a] [html[data-theme=dark]_&]:hover:bg-[#353535]"
            data-channel={channel}
            onClick={() => trackEvent(Goals.MESSENGER_HANDOFF_CLICK, { channel })}
          >
            <MessengerMark channel={channel} />
            {/* Colour sits on the label: the site's unlayered `a { color: inherit }` beats
                utilities on the anchor, and the orange lead modal makes inherited text white. */}
            <span className="text-[#262626] [html[data-theme=dark]_&]:text-[#ededed]">{LABELS[channel]}</span>
          </a>
        ))}
      </div>
      <p className="lead-success-text text-[0.85rem]">
        Удобнее по телефону?{" "}
        <a href={`tel:${CONTACT_PHONE_TEL}`} className="underline underline-offset-2">
          {CONTACT_PHONE}
        </a>
      </p>
    </div>
  );
}
