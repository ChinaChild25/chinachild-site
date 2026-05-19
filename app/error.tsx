"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="page-shell-wide flex min-h-[70vh] flex-col items-center justify-center py-20 text-center text-[#262626]">
      <meta name="robots" content="noindex" />
      <h1 className="text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
        Что-то пошло не так
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-[1.55] text-[#6b6b6b] sm:text-base">
        Мы уже знаем о проблеме и разбираемся. Можно попробовать перезагрузить
        страницу или вернуться на главную.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-6 max-w-full overflow-auto rounded-lg bg-[#f3f0e8] p-4 text-left text-xs text-[#262626]">
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-pill btn-ink">
          Попробовать снова
        </button>
        <Link href="/" className="btn-pill btn-white">
          На главную
        </Link>
        <Link href="/zayavka" className="btn-pill btn-white">
          Записаться
        </Link>
      </div>
    </main>
  );
}
