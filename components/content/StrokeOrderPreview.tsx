"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

type StoredStrokeData = {
  hanzi: string;
  strokes: unknown;
  medians: unknown;
};

type CharacterJson = {
  strokes: string[];
  medians: number[][][];
};

type WriterInstance = {
  animateCharacter: (options?: { onComplete?: () => void }) => void;
};

function isCharacterJson(value: StoredStrokeData): CharacterJson | null {
  if (!Array.isArray(value.strokes) || !Array.isArray(value.medians)) return null;
  if (!value.strokes.every((stroke) => typeof stroke === "string")) return null;
  return {
    strokes: value.strokes,
    medians: value.medians as number[][][],
  };
}

function RiceGrid() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 size-full text-[#7d735f]"
      aria-hidden
      preserveAspectRatio="none"
    >
      <rect x="0.5" y="0.5" width="99" height="99" fill="none" stroke="currentColor" strokeOpacity="0.38" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.24" />
      <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeOpacity="0.24" />
      <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeOpacity="0.16" strokeDasharray="4 4" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeOpacity="0.16" strokeDasharray="4 4" />
    </svg>
  );
}

function StrokeCell({
  character,
  playSession,
  active,
  onComplete,
}: {
  character: StoredStrokeData;
  playSession: number;
  active: boolean;
  onComplete: () => void;
}) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<WriterInstance | null>(null);
  const [renderPx, setRenderPx] = useState(160);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const data = useMemo(() => isCharacterJson(character), [character]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return undefined;

    const syncSize = () => {
      const { width, height } = el.getBoundingClientRect();
      const px = Math.floor(Math.min(width, height));
      if (px > 0) setRenderPx(px);
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [character.hanzi]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || renderPx <= 0) {
      writerRef.current = null;
      if (el) el.innerHTML = "";
      return undefined;
    }

    let cancelled = false;
    el.innerHTML = "";
    setLoadFailed(false);
    setLoading(active);

    import("hanzi-writer")
      .then(({ default: HanziWriter }) => {
        if (cancelled || !targetRef.current) return;
        const writer = HanziWriter.create(targetRef.current, character.hanzi, {
          width: renderPx,
          height: renderPx,
          padding: 18,
          showOutline: true,
          showCharacter: !active,
          strokeAnimationSpeed: 1.15,
          delayBetweenStrokes: 90,
          strokeColor: "#262626",
          radicalColor: null,
          outlineColor: "#d8c79a",
          highlightColor: "#ffdf39",
          drawingColor: "#262626",
          highlightCompleteColor: "#fee47c",
          ...(data ? { charDataLoader: (_char: string, onLoad: (json: CharacterJson) => void) => onLoad(data) } : {}),
          onLoadCharDataSuccess: () => {
            if (cancelled) return;
            setLoading(false);
            if (active) {
              writer.animateCharacter({
                onComplete: () => {
                  if (!cancelled) onComplete();
                },
              });
            }
          },
          onLoadCharDataError: () => {
            if (cancelled) return;
            setLoading(false);
            setLoadFailed(true);
            if (active) onComplete();
          },
        }) as WriterInstance;
        writerRef.current = writer;
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadFailed(true);
          if (active) onComplete();
        }
      });

    return () => {
      cancelled = true;
      writerRef.current = null;
      if (el) el.innerHTML = "";
    };
  }, [active, character.hanzi, data, onComplete, playSession, renderPx]);

  const unavailable = loadFailed;

  return (
    <div className="min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card-md)] border border-[#e8e3da] bg-[#fbfaf5]">
        <RiceGrid />
        {unavailable ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
            <span className="text-6xl font-medium leading-none text-[#1b1b1b]">{character.hanzi}</span>
            <span className="mt-3 text-xs leading-4 text-[#6b6b6b]">
              Порядок черт пока недоступен
            </span>
          </div>
        ) : null}
        <div
          ref={targetRef}
          className={unavailable ? "hidden" : "absolute inset-[10px]"}
          role="img"
          aria-label={`Порядок черт: ${character.hanzi}`}
        />
        {loading ? (
          <div className="absolute inset-0 grid place-items-center bg-[#fbfaf5]/70 text-sm text-[#6b6b6b]">
            Загрузка…
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-center text-2xl font-medium leading-none text-[#1b1b1b]">{character.hanzi}</p>
    </div>
  );
}

export default function StrokeOrderPreview({ characters }: { characters: StoredStrokeData[] }) {
  const animatableIndices = useMemo(() => characters.map((_, index) => index), [characters]);
  const [playSession, setPlaySession] = useState(0);
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const isRunning = activePosition !== null;

  function start() {
    if (animatableIndices.length === 0) return;
    setPlaySession((session) => session + 1);
    setActivePosition(0);
  }

  const completeActive = useCallback(function completeActive() {
    setActivePosition((position) => {
      if (position === null) return null;
      const next = position + 1;
      return next >= animatableIndices.length ? null : next;
    });
  }, [animatableIndices.length]);

  if (characters.length === 0) {
    return (
      <section className="card-block card-cream">
        <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">Порядок черт</h2>
        <p className="mt-3 text-sm leading-6 text-[#6b6b6b]">Порядок черт пока недоступен</p>
      </section>
    );
  }

  const activeIndex = activePosition === null ? null : animatableIndices[activePosition];

  return (
    <section className="card-block card-cream">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">Порядок черт</h2>
          <p className="mt-2 text-sm leading-6 text-[#5a5a5a]">
            Короткая анимация написания. Полная практика остаётся в платформе.
          </p>
        </div>
        {animatableIndices.length > 0 ? (
          <button
            type="button"
            onClick={start}
            disabled={isRunning}
            className="btn-pill inline-flex items-center gap-2 bg-[#262626] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="size-4" aria-hidden />
            {playSession > 0 ? "Повторить" : "Показать порядок"}
          </button>
        ) : null}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(128px,1fr))]">
        {characters.map((character, index) => (
          <StrokeCell
            key={`${character.hanzi}-${index}`}
            character={character}
            playSession={playSession}
            active={activeIndex === index}
            onComplete={completeActive}
          />
        ))}
      </div>
    </section>
  );
}
