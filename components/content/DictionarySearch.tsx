"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

// Local search box for a single HSK level page. Pushes ?q= to the URL.
export default function DictionarySearch({
  basePath,
  placeholder,
  initialQuery,
}: {
  basePath: string;
  placeholder: string;
  initialQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${basePath}?${queryString}` : basePath);
    });
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex w-full max-w-2xl items-center gap-2 rounded-[var(--radius-input)] bg-[#f5f5f6] px-5 py-3 transition-colors focus-within:bg-[#ebeaed]"
      aria-label="Поиск по словам уровня"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Запрос поиска"
        className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#9a9a9a]"
      />
      <button type="submit" className="btn-pill btn-pill-compact btn-ink" disabled={pending}>
        {pending ? "…" : "Найти"}
      </button>
    </form>
  );
}
