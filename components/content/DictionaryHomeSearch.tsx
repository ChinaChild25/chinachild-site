"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

// Global dictionary search input on /dictionary.
// The actual results are server-rendered by the page below; this component
// only controls the URL ?q= param. We use replace() to keep history clean.
export default function DictionaryHomeSearch({
  initialQuery,
  placeholder,
}: {
  initialQuery: string;
  placeholder: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  // Keep the input in sync if the URL changes (e.g. back button).
  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `/dictionary?${queryString}` : "/dictionary");
    });
  }

  function clear() {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `/dictionary?${queryString}` : "/dictionary");
    });
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex w-full max-w-2xl items-center gap-2 rounded-full bg-white px-5 py-3 shadow-sm"
      aria-label="Поиск по китайскому словарю"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Запрос поиска"
        className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#9a9a9a]"
      />
      {initialQuery ? (
        <button
          type="button"
          onClick={clear}
          className="text-xs text-[#6b6b6b] underline-offset-4 hover:underline"
          aria-label="Сбросить запрос"
        >
          Сбросить
        </button>
      ) : null}
      <button type="submit" className="btn-pill btn-pill-compact btn-ink" disabled={pending}>
        {pending ? "…" : "Найти"}
      </button>
    </form>
  );
}
