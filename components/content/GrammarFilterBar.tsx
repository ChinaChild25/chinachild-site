"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import type { GrammarTagGroup } from "@/lib/content/types";

type Props = {
  groups: GrammarTagGroup[];
  initialQuery: string;
};

// Custom multi-select dropdown filter (no native select).
// Selected tags become URL query params: ?tags=a,b,c&q=text
export default function GrammarFilterBar({ groups, initialQuery }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTags = new Set((searchParams.get("tags") ?? "").split(",").filter(Boolean));

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenGroup(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("limit");
      const queryString = params.toString();
      startTransition(() => {
        router.replace(queryString ? `/grammar?${queryString}` : "/grammar");
      });
    },
    [router, searchParams],
  );

  const toggleTag = useCallback(
    (slug: string) => {
      pushParams((params) => {
        const current = new Set((params.get("tags") ?? "").split(",").filter(Boolean));
        if (current.has(slug)) current.delete(slug);
        else current.add(slug);
        if (current.size === 0) params.delete("tags");
        else params.set("tags", [...current].join(","));
      });
    },
    [pushParams],
  );

  const resetAll = useCallback(() => {
    setQuery("");
    pushParams((params) => {
      params.delete("tags");
      params.delete("q");
    });
  }, [pushParams]);

  const submitQuery = useCallback(
    (value: string) => {
      pushParams((params) => {
        if (value.trim()) params.set("q", value.trim());
        else params.delete("q");
      });
    },
    [pushParams],
  );

  return (
    <div ref={containerRef} className="grammar-filter-bar">
      <form
        className="flex w-full max-w-2xl items-center gap-2 rounded-full bg-white px-5 py-3 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuery(query);
        }}
        role="search"
        aria-label="Поиск по правилам грамматики"
      >
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ищи правило, тему или конструкцию"
          aria-label="Запрос поиска"
          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#9a9a9a]"
        />
        <button type="submit" className="btn-pill btn-pill-compact btn-ink">
          Найти
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {groups.map((group) => (
          <FilterDropdown
            key={group.key}
            group={group}
            isOpen={openGroup === group.key}
            onToggle={() => setOpenGroup((value) => (value === group.key ? null : group.key))}
            selectedTags={selectedTags}
            onTagToggle={toggleTag}
          />
        ))}
        {(selectedTags.size > 0 || (searchParams.get("q") ?? "").length > 0) && (
          <button
            type="button"
            className="btn-pill btn-pill-compact btn-ghost"
            onClick={resetAll}
            aria-label="Сбросить фильтры"
          >
            Сбросить
          </button>
        )}
        {pending ? (
          <span className="text-xs text-[#9a9a9a]" aria-live="polite">
            Обновляем…
          </span>
        ) : null}
      </div>

      {selectedTags.size > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Выбранные фильтры">
          {[...selectedTags].map((slug) => {
            const tag = groups.flatMap((group) => group.tags).find((candidate) => candidate.slug === slug);
            if (!tag) return null;
            return (
              <li key={slug}>
                <button
                  type="button"
                  onClick={() => toggleTag(slug)}
                  className="tag-pill tag-pill-ink flex items-center gap-2"
                  aria-label={`Убрать фильтр ${tag.labelRu}`}
                >
                  {tag.labelRu}
                  <span aria-hidden>×</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function FilterDropdown({
  group,
  isOpen,
  onToggle,
  selectedTags,
  onTagToggle,
}: {
  group: GrammarTagGroup;
  isOpen: boolean;
  onToggle: () => void;
  selectedTags: Set<string>;
  onTagToggle: (slug: string) => void;
}) {
  const buttonId = useId();
  const menuId = `${buttonId}-menu`;
  const selectedInGroup = group.tags.filter((tag) => selectedTags.has(tag.slug)).length;
  return (
    <div className="relative">
      <button
        type="button"
        id={buttonId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={onToggle}
        className={`btn-pill btn-pill-compact ${selectedInGroup > 0 ? "btn-ink" : "btn-white"}`}
      >
        {group.label}
        {selectedInGroup > 0 ? (
          <span className="ml-1 rounded-full bg-white/25 px-1.5 text-xs">{selectedInGroup}</span>
        ) : null}
      </button>
      {isOpen ? (
        <ul
          id={menuId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={buttonId}
          className="absolute left-0 z-30 mt-2 max-h-72 w-64 overflow-y-auto rounded-2xl bg-white p-2 shadow-lg"
        >
          {group.tags.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[#9a9a9a]">Нет тегов в этой группе.</li>
          ) : (
            group.tags.map((tag) => {
              const selected = selectedTags.has(tag.slug);
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => onTagToggle(tag.slug)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                      selected ? "bg-[#f1f1ff] text-[#262626]" : "hover:bg-[#f7f7f7]"
                    }`}
                  >
                    <span>{tag.labelRu}</span>
                    <span className="text-xs text-[#9a9a9a]">{tag.articleCount}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
