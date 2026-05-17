"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Feather, RotateCcw } from "lucide-react";
import { strokeHanziCellClass } from "@/lib/content/word-hanzi-size";

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
  showCharacter: (options?: { duration?: number; onComplete?: () => void }) => void;
  updateDimensions: (options: { width: number; height: number; padding?: number }) => void;
};

/** Reject incomplete DB stroke JSON; Hanzi Writer CDN is used as fallback. */
function validateCharacterJson(value: StoredStrokeData): CharacterJson | null {
  if (!Array.isArray(value.strokes) || !Array.isArray(value.medians)) return null;
  if (value.strokes.length === 0 || value.strokes.length !== value.medians.length) return null;
  if (!value.strokes.every((stroke) => typeof stroke === "string" && stroke.length > 0)) {
    return null;
  }
  if (
    !value.medians.every(
      (median) =>
        Array.isArray(median) &&
        median.length > 0 &&
        median.every((point) => Array.isArray(point) && point.length >= 2),
    )
  ) {
    return null;
  }
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
  const cellRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<WriterInstance | null>(null);
  const onCompleteRef = useRef(onComplete);
  const [renderPx, setRenderPx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [writerReady, setWriterReady] = useState(false);
  const charData = useMemo(() => validateCharacterJson(character), [character]);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    const cell = cellRef.current;
    if (!cell) return undefined;

    const syncSize = () => {
      const { width, height } = cell.getBoundingClientRect();
      const px = Math.floor(Math.min(width, height));
      if (px > 0) setRenderPx(px);
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(cell);
    return () => ro.disconnect();
  }, [character.hanzi]);

  useEffect(() => {
    const writer = writerRef.current;
    if (!writer || renderPx <= 0) return;
    writer.updateDimensions({ width: renderPx, height: renderPx, padding: 12 });
  }, [renderPx]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || renderPx <= 0) {
      writerRef.current = null;
      setWriterReady(false);
      if (el) el.innerHTML = "";
      return undefined;
    }

    let cancelled = false;
    el.innerHTML = "";
    setLoadFailed(false);
    setLoading(true);
    setWriterReady(false);

    import("hanzi-writer")
      .then(({ default: HanziWriter }) => {
        if (cancelled || !targetRef.current) return;
        const writer = HanziWriter.create(targetRef.current, character.hanzi, {
          width: renderPx,
          height: renderPx,
          padding: 12,
          showOutline: true,
          showCharacter: true,
          strokeAnimationSpeed: 1.15,
          delayBetweenStrokes: 90,
          strokeColor: "#262626",
          radicalColor: null,
          outlineColor: "#d8c79a",
          highlightColor: "#ffdf39",
          drawingColor: "#262626",
          highlightCompleteColor: "#fee47c",
          ...(charData
            ? {
                charDataLoader: (_char: string, onLoad: (json: CharacterJson) => void) =>
                  onLoad(charData),
              }
            : {}),
          onLoadCharDataSuccess: () => {
            if (cancelled) return;
            setLoading(false);
            setWriterReady(true);
            writer.showCharacter({ duration: 0 });
          },
          onLoadCharDataError: () => {
            if (cancelled) return;
            setLoading(false);
            setLoadFailed(true);
            setWriterReady(false);
          },
        }) as WriterInstance;
        writerRef.current = writer;
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadFailed(true);
          setWriterReady(false);
        }
      });

    return () => {
      cancelled = true;
      writerRef.current = null;
      setWriterReady(false);
      if (el) el.innerHTML = "";
    };
  }, [character.hanzi, charData, playSession, renderPx]);

  useEffect(() => {
    const writer = writerRef.current;
    if (!writer || !writerReady || loadFailed) return;

    let cancelled = false;

    if (active) {
      writer.animateCharacter({
        onComplete: () => {
          if (!cancelled) onCompleteRef.current();
        },
      });
    } else {
      writer.showCharacter({ duration: 0 });
    }

    return () => {
      cancelled = true;
    };
  }, [active, writerReady, loadFailed]);

  const unavailable = loadFailed;

  const square = (
    <>
      <RiceGrid />
      {unavailable ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <span className="text-3xl font-medium leading-none text-[#1b1b1b] sm:text-4xl">
            {character.hanzi}
          </span>
          <span className="mt-2 text-[10px] leading-3 text-[#6b6b6b]">Недоступно</span>
        </div>
      ) : null}
      <div
        ref={targetRef}
        className={unavailable ? "hidden" : "absolute inset-0"}
        role="img"
        aria-label={`Порядок черт: ${character.hanzi}`}
      />
      {loading ? (
        <div className="absolute inset-0 grid place-items-center bg-[#fbfaf5]/70 text-xs text-[#6b6b6b]">
          …
        </div>
      ) : null}
    </>
  );

  return (
    <div ref={cellRef} className={strokeHanziCellClass}>
      {square}
    </div>
  );
}

export default function StrokeOrderPreview({
  characters,
  className = "",
}: {
  characters: StoredStrokeData[];
  className?: string;
}) {
  const animatableIndices = useMemo(() => characters.map((_, index) => index), [characters]);
  const [playSession, setPlaySession] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
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
      if (next >= animatableIndices.length) {
        setHasFinished(true);
        return null;
      }
      return next;
    });
  }, [animatableIndices.length]);

  if (characters.length === 0) {
    return (
      <section className={`card-block card-cream h-full ${className}`}>
        <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">Порядок черт</h2>
        <p className="mt-3 text-sm leading-6 text-[#6b6b6b]">Порядок черт пока недоступен</p>
      </section>
    );
  }

  const activeIndex = activePosition === null ? null : animatableIndices[activePosition];
  const actionLabel = hasFinished ? "Повторить" : "Показать порядок";
  return (
    <section className={`card-block card-cream flex h-full flex-col ${className}`}>
      <div className="relative shrink-0 pr-11">
        <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1b1b1b]">Порядок черт</h2>
        <p className="mt-2 text-sm leading-6 text-[#5a5a5a]">
          Короткая анимация написания. Полная практика остаётся в платформе.
        </p>
        {animatableIndices.length > 0 ? (
          <button
            type="button"
            onClick={start}
            disabled={isRunning}
            aria-label={actionLabel}
            title={actionLabel}
            className="absolute right-0 top-0 grid size-9 place-items-center rounded-full bg-[#262626] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {hasFinished ? (
              <RotateCcw className="size-4" aria-hidden />
            ) : (
              <Feather className="size-4 -rotate-[24deg]" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex w-fit max-w-full justify-start divide-x divide-[#e8e3da] overflow-hidden border border-[#e8e3da] bg-[#fbfaf5] max-lg:flex-none lg:min-h-0 lg:flex-1">
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
