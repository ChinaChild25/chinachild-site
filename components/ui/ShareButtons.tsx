"use client";

import { useState } from "react";
import { buttonStyles } from "@/components/ui/button";

type ShareButtonsProps = {
  url: string;
  title: string;
};

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=720,height=560");
  };

  const copyLink = async () => {
    const link = window.location.href || url;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className={buttonStyles({ size: "compact" })}
        onClick={() =>
          openShareWindow(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`)
        }
      >
        Telegram
      </button>
      <button
        type="button"
        className={buttonStyles({ variant: "secondary", size: "compact" })}
        onClick={() => openShareWindow(`https://vk.com/share.php?url=${encodedUrl}`)}
      >
        VK
      </button>
      <button
        type="button"
        className={buttonStyles({ variant: "ghost", size: "compact" })}
        onClick={copyLink}
      >
        {copied ? "Скопировано ✓" : "Скопировать ссылку"}
      </button>
    </div>
  );
}
