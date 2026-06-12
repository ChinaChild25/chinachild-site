"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import {
  TAX_DEDUCTION_LIMIT_CHILD_RUB,
  TAX_DEDUCTION_LIMIT_SELF_RUB,
  TAX_DEDUCTION_RATE,
} from "@/lib/site-config";

type Recipient = "self" | "child";

// Потолок шкалы — 180 000 ₽: чуть выше самого большого лимита вычета (150 000 ₽
// «за себя»). Тянуть дальше смысла нет — возврат всё равно не растёт.
const SLIDER_MAX = 180_000;
const SLIDER_STEP = 5_000;

const fmt = (value: number) => value.toLocaleString("ru-RU");

export default function TaxDeductionCalculator() {
  const id = useId();
  const [recipient, setRecipient] = useState<Recipient>("self");
  const [tuition, setTuition] = useState<number>(150_000);

  const { limit, eligible, refund, capped, pct } = useMemo(() => {
    const lim =
      recipient === "self"
        ? TAX_DEDUCTION_LIMIT_SELF_RUB
        : TAX_DEDUCTION_LIMIT_CHILD_RUB;
    const eli = Math.min(Math.max(tuition, 0), lim);
    return {
      limit: lim,
      eligible: eli,
      refund: Math.round(eli * TAX_DEDUCTION_RATE),
      capped: tuition > lim,
      pct: (Math.min(Math.max(tuition, 0), SLIDER_MAX) / SLIDER_MAX) * 100,
    };
  }, [tuition, recipient]);

  return (
    <div className="vychet">
      {/* Иллюстрация-баннер над калькулятором. Чтобы заменить картинку — положи
          свой файл в public/calculators/nalogovyy-vychet.webp (путь не меняется). */}
      <div className="vychet-hero">
        <Image
          src="/calculators/nalogovyy-vychet.webp"
          alt="Монета и папки с документами — налоговый вычет 13% за обучение"
          fill
          className="vychet-hero-img"
          sizes="(min-width: 768px) 680px, 92vw"
          priority
        />
      </div>

      <article className="vychet-card">
        <div className="vychet-toggle" role="tablist" aria-label="За кого вычет">
          <button
            type="button"
            role="tab"
            aria-selected={recipient === "self"}
            data-active={recipient === "self"}
            className="vychet-toggle-btn"
            onClick={() => setRecipient("self")}
          >
            За себя
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={recipient === "child"}
            data-active={recipient === "child"}
            className="vychet-toggle-btn"
            onClick={() => setRecipient("child")}
          >
            За ребёнка
          </button>
        </div>

        <div className="vychet-field">
          <div className="vychet-field-head">
            <label htmlFor={id}>Стоимость обучения за год</label>
            <span className="vychet-amount">
              <input
                id={id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={tuition === 0 ? "" : fmt(tuition)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setTuition(Math.min(Number(digits) || 0, SLIDER_MAX));
                }}
                aria-label="Стоимость обучения за год, рублей"
              />
              <span aria-hidden>₽</span>
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={SLIDER_MAX}
            step={SLIDER_STEP}
            value={Math.min(tuition, SLIDER_MAX)}
            onChange={(e) => setTuition(Number(e.target.value))}
            className="vychet-range"
            style={{ "--pct": `${pct}%` } as React.CSSProperties}
            aria-label="Стоимость обучения, ползунок"
          />
          <div className="vychet-scale" aria-hidden>
            <span>0 ₽</span>
            <span>{fmt(SLIDER_MAX)} ₽</span>
          </div>
        </div>

        <div className="vychet-result">
          <div className="vychet-result-cap">Вернёте на карту</div>
          <div className="vychet-result-value">{fmt(refund)} ₽</div>
          <div className="vychet-result-hint">
            {capped
              ? `Лимит ${fmt(limit)} ₽ в год — больше вернуть не получится`
              : `13% от ${fmt(eligible)} ₽`}
          </div>
        </div>

        <p className="vychet-note">
          Социальный вычет по ст. 219 НК РФ. Школа лицензирована — нужна только{" "}
          <Link href="/license">лицензия</Link> и платёжки.{" "}
          <Link href="/blog/license-tax-deduction-chinese-school">
            Как подать 3-НДФЛ
          </Link>
        </p>
      </article>
    </div>
  );
}
