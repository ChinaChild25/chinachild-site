"use client";

import { useState, type RefObject } from "react";
import { HskTestGoals } from "@/lib/hsk-test/analytics";
import type { HskTestLevel } from "@/lib/hsk-test/types";

type ShareResultButtonsProps = {
  level: HskTestLevel;
  shareUrl: string;
  shareText: string;
  /** DOM ref to the certificate node — required for PNG export. */
  certRef?: RefObject<HTMLDivElement | null>;
};

export default function ShareResultButtons({
  level,
  shareUrl,
  shareText,
  certRef,
}: ShareResultButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const downloadCert = async () => {
    const node = certRef?.current;
    if (!node) return;
    setDownloading(true);
    HskTestGoals.shared(level, "png");
    try {
      // Lazy-load to keep the initial bundle lean.
      const { toPng } = await import("html-to-image");
      // PrintableCertificate is locked to 1414×1000 (A4 landscape ratio).
      // Pixel-ratio 1 keeps the export at native resolution; 2× would be
      // 2828×2000 — overkill for social sharing and a download size hog.
      const dataUrl = await toPng(node, {
        pixelRatio: 1.5,
        cacheBust: true,
        width: 1414,
        height: 1000,
        backgroundColor: undefined,
        style: {
          // html-to-image inherits ancestor transforms otherwise. Reset.
          transform: "none",
          left: "0",
          top: "0",
        },
      });
      const link = document.createElement("a");
      link.download = `chinachild-hsk-${level}-certificate.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("[hsk-test] certificate PNG export failed", err);
    } finally {
      setDownloading(false);
    }
  };

  // Share URL stays clean — Telegram/VK render the OG preview off it,
  // and we don't want a long ?utm=... tail in the message. UTMs only
  // attach to the "copy link" button so analytics still get the attribution.
  const utmCopyLink =
    `${shareUrl}?utm_source=share&utm_medium=social&utm_campaign=hsk_test&utm_content=level_${level}_copy`;

  const openShare = (url: string, network: string) => {
    HskTestGoals.shared(level, network);
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=560");
  };

  const copyLink = async () => {
    HskTestGoals.shared(level, "copy");
    try {
      await navigator.clipboard?.writeText(utmCopyLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — Clipboard API may be unavailable
    }
  };

  return (
    <div className="hsk-test-share">
      <button
        type="button"
        className="hsk-test-share-btn"
        onClick={() =>
          openShare(
            `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            "telegram",
          )
        }
      >
        Telegram
      </button>
      <button
        type="button"
        className="hsk-test-share-btn"
        onClick={() =>
          openShare(
            `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
            "vk",
          )
        }
      >
        ВКонтакте
      </button>
      <button
        type="button"
        className="hsk-test-share-btn hsk-test-share-btn-ghost"
        onClick={copyLink}
      >
        {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
      </button>
      {certRef ? (
        <button
          type="button"
          className="hsk-test-share-btn hsk-test-share-btn-ghost"
          onClick={downloadCert}
          disabled={downloading}
        >
          {downloading ? "Готовим PNG…" : "Скачать сертификат"}
        </button>
      ) : null}
    </div>
  );
}
