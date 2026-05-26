"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import {
  TAX_DEDUCTION_LIMIT_CHILD_RUB,
  TAX_DEDUCTION_LIMIT_SELF_RUB,
  TAX_DEDUCTION_RATE,
} from "@/lib/site-config";

type Recipient = "self" | "child";

const PRESETS = [4_990, 15_990, 31_990, 50_000, 100_000, 150_000];

function formatRub(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function limitFor(recipient: Recipient): number {
  return recipient === "self"
    ? TAX_DEDUCTION_LIMIT_SELF_RUB
    : TAX_DEDUCTION_LIMIT_CHILD_RUB;
}

function RecipientCard({
  active,
  title,
  hint,
  refundMax,
  limit,
  onClick,
}: {
  active: boolean;
  title: string;
  hint: string;
  refundMax: number;
  limit: number;
  onClick: () => void;
}) {
  // Активная карточка — тёмная (card-ink). Неактивная — белая полупрозрачная,
  // та же сетка контрастов, что в PricingSection для tier.featured.
  const tone = active ? "card-ink" : "bg-white/70";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`card-block flex h-full flex-col text-left transition hover:-translate-y-1 ${tone}`}
    >
      <div className="text-[1.25rem] font-medium tracking-[-0.01em] leading-[1.2]">
        {title}
      </div>
      <p className="mt-2 text-sm leading-[1.55] opacity-72">{hint}</p>
      <p className="mt-5 text-sm leading-[1.55] opacity-72">
        Лимит {formatRub(limit)} · возврат до {formatRub(refundMax)}
      </p>
    </button>
  );
}

function ResultBlock({
  tone,
  caption,
  value,
  hint,
}: {
  tone: "soft" | "ink";
  caption: string;
  value: string;
  hint: string;
}) {
  const className =
    tone === "ink" ? "card-block card-ink" : "card-block bg-white/70";
  return (
    <div className={className}>
      <div className="text-sm opacity-72">{caption}</div>
      <div className="mt-3 text-[2.25rem] font-medium tracking-[-0.02em] leading-[1.05] sm:text-[2.5rem]">
        {value}
      </div>
      <p className="mt-2 text-sm leading-[1.55] opacity-72">{hint}</p>
    </div>
  );
}

export default function TaxDeductionCalculator() {
  const fieldId = useId();

  const [tuition, setTuition] = useState<number>(50_000);
  const [recipient, setRecipient] = useState<Recipient>("self");

  const { eligible, refund, limit, capped } = useMemo(() => {
    const lim = limitFor(recipient);
    const eli = Math.min(Math.max(tuition, 0), lim);
    const ref = Math.round(eli * TAX_DEDUCTION_RATE);
    return { eligible: eli, refund: ref, limit: lim, capped: tuition > lim };
  }, [tuition, recipient]);

  const maxRefund = Math.round(limit * TAX_DEDUCTION_RATE);

  return (
    <article className="card-block card-block-lg card-violet-soft">
      <span className="tag-pill self-start">Калькулятор</span>
      <h2 className="mt-6 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
        Сколько вернёте через налоговый вычет 13%
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-[1.6] text-[#4b4b4b]">
        Социальный вычет по&nbsp;статье&nbsp;219 НК&nbsp;РФ. Школа лицензирована
        Департаментом образования и науки Москвы — расходы на наше обучение
        попадают под вычет.
      </p>

      <div className="mt-7 grid gap-3 md:grid-cols-2">
        <RecipientCard
          active={recipient === "self"}
          title="За себя"
          hint="Или за брата&#8202;/&#8202;сестру до 24 лет на очной форме."
          limit={TAX_DEDUCTION_LIMIT_SELF_RUB}
          refundMax={Math.round(TAX_DEDUCTION_LIMIT_SELF_RUB * TAX_DEDUCTION_RATE)}
          onClick={() => setRecipient("self")}
        />
        <RecipientCard
          active={recipient === "child"}
          title="За ребёнка"
          hint="Своего ребёнка до 24 лет на очной форме обучения."
          limit={TAX_DEDUCTION_LIMIT_CHILD_RUB}
          refundMax={Math.round(TAX_DEDUCTION_LIMIT_CHILD_RUB * TAX_DEDUCTION_RATE)}
          onClick={() => setRecipient("child")}
        />
      </div>

      <div className="mt-8">
        <label
          htmlFor={fieldId}
          className="block text-base font-medium text-[#1b1b1b]"
        >
          Стоимость обучения за год
        </label>
        <div className="mt-3 flex items-center gap-4">
          <input
            id={fieldId}
            type="number"
            min={0}
            max={1_000_000}
            step={1000}
            value={tuition}
            onChange={(e) => setTuition(Math.max(0, Number(e.target.value) || 0))}
            className="lead-input max-w-[220px]"
            aria-describedby={`${fieldId}-hint`}
          />
          <span className="text-base text-[#4b4b4b]">₽ за год</span>
        </div>
        <input
          type="range"
          min={0}
          max={300_000}
          step={1000}
          value={Math.min(tuition, 300_000)}
          onChange={(e) => setTuition(Number(e.target.value))}
          className="tax-calc-range mt-5 w-full"
          aria-label="Стоимость обучения, ползунок"
        />
        <div
          id={`${fieldId}-hint`}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <span className="text-sm text-[#4b4b4b]">Часто выбирают</span>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTuition(preset)}
              className="tag-pill"
              aria-pressed={tuition === preset}
            >
              {formatRub(preset)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <ResultBlock
          tone="soft"
          caption="Засчитают"
          value={formatRub(eligible)}
          hint={`из ${formatRub(tuition)}`}
        />
        <ResultBlock
          tone="ink"
          caption="Вернёте на карту"
          value={formatRub(refund)}
          hint="13% от засчитанной суммы"
        />
        <ResultBlock
          tone="soft"
          caption="Лимит вычета"
          value={formatRub(maxRefund)}
          hint={`при расходах ${formatRub(limit)}`}
        />
      </div>

      {capped ? (
        <p className="mt-6 text-sm leading-[1.6] text-[#4b4b4b]">
          Сумма обучения превышает лимит — возврат рассчитан от {formatRub(limit)}.
          Если оплачиваете обучение нескольких членов семьи, расходы суммируются
          до соответствующих лимитов.
        </p>
      ) : null}

      <div className="mt-7 grid gap-3 text-sm leading-[1.6] text-[#4b4b4b] md:grid-cols-2">
        <p>
          Для вычета нужен документ от лицензированной школы и платёжные документы.{" "}
          <Link
            href="/license"
            className="underline underline-offset-2 hover:text-[#1b1b1b]"
          >
            Образовательная лицензия школы
          </Link>{" "}
          — никаких отдельных бумаг от вас не потребуется.
        </p>
        <p>
          Подробная инструкция, как подать 3-НДФЛ и за что —{" "}
          <Link
            href="/blog/license-tax-deduction-chinese-school"
            className="underline underline-offset-2 hover:text-[#1b1b1b]"
          >
            в статье блога
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
