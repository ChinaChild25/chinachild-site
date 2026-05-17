"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function GrammarLoadMore({
  nextLimit,
  remaining,
}: {
  nextLimit: number;
  remaining: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function loadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(nextLimit));
    startTransition(() => {
      router.replace(`/grammar?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="mt-12 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={loadMore}
        disabled={pending}
        className="btn-pill btn-pill-default btn-ink"
        aria-label="Показать ещё статей"
      >
        {pending ? "Загружаем…" : "Показать ещё"}
      </button>
      <p className="text-sm text-[#9a9a9a]">Осталось ещё {remaining}.</p>
    </div>
  );
}
