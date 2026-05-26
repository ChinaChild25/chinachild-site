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

export default function TaxDeductionCalculator() {
  const fieldId = useId();
  const radioName = useId();

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
    <div className="card-block card-block-lg card-violet-soft">
      <div className="flex flex-col gap-2">
        <span className="tag-pill self-start">Калькулятор</span>
        <h3 className="text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-[2rem]">
          Сколько вернёте через налоговый вычет 13%
        </h3>
        <p className="max-w-2xl text-sm leading-[1.55] text-[#262626]/72">
          Социальный вычет по&nbsp;ст.&nbsp;219 НК РФ. Школа лицензирована Департаментом
          образования и науки Москвы — расходы на наше обучение попадают под вычет.
        </p>
      </div>

      <fieldset className="mt-7 grid gap-3 md:grid-cols-2">
        <legend className="sr-only">Кто учился</legend>
        <label
          className={`tax-calc-radio ${recipient === "self" ? "tax-calc-radio--active" : ""}`}
        >
          <input
            type="radio"
            name={radioName}
            value="self"
            checked={recipient === "self"}
            onChange={() => setRecipient("self")}
            className="sr-only"
          />
          <div className="text-sm font-semibold text-[#1b1b1b]">За себя</div>
          <div className="mt-1 text-xs text-[#262626]/72">
            или за брата/сестру до 24 лет на очном
          </div>
          <div className="mt-3 text-xs text-[#262626]/55">
            лимит: {formatRub(TAX_DEDUCTION_LIMIT_SELF_RUB)} → возврат до{" "}
            {formatRub(Math.round(TAX_DEDUCTION_LIMIT_SELF_RUB * TAX_DEDUCTION_RATE))}
          </div>
        </label>
        <label
          className={`tax-calc-radio ${recipient === "child" ? "tax-calc-radio--active" : ""}`}
        >
          <input
            type="radio"
            name={radioName}
            value="child"
            checked={recipient === "child"}
            onChange={() => setRecipient("child")}
            className="sr-only"
          />
          <div className="text-sm font-semibold text-[#1b1b1b]">За ребёнка</div>
          <div className="mt-1 text-xs text-[#262626]/72">
            до 24 лет, очная форма
          </div>
          <div className="mt-3 text-xs text-[#262626]/55">
            лимит: {formatRub(TAX_DEDUCTION_LIMIT_CHILD_RUB)} → возврат до{" "}
            {formatRub(Math.round(TAX_DEDUCTION_LIMIT_CHILD_RUB * TAX_DEDUCTION_RATE))}
          </div>
        </label>
      </fieldset>

      <div className="mt-7">
        <label htmlFor={fieldId} className="block text-sm font-semibold text-[#1b1b1b]">
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
            className="lead-input max-w-[200px]"
            aria-describedby={`${fieldId}-hint`}
          />
          <span className="text-base text-[#262626]/72">₽ за год</span>
        </div>
        <input
          type="range"
          min={0}
          max={300_000}
          step={1000}
          value={Math.min(tuition, 300_000)}
          onChange={(e) => setTuition(Number(e.target.value))}
          className="tax-calc-range mt-4 w-full"
          aria-label="Стоимость обучения, ползунок"
        />
        <div
          id={`${fieldId}-hint`}
          className="mt-3 flex flex-wrap gap-2 text-xs text-[#262626]/55"
        >
          <span>Часто выбирают:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTuition(preset)}
              className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-[#1b1b1b] transition hover:bg-white"
            >
              {formatRub(preset)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[14px] bg-white/70 p-5">
          <div className="text-xs uppercase tracking-[0.06em] text-[#262626]/55">
            Засчитают
          </div>
          <div className="mt-2 text-[1.75rem] font-medium leading-[1.05] text-[#1b1b1b]">
            {formatRub(eligible)}
          </div>
          <div className="mt-1 text-xs text-[#262626]/55">
            из {formatRub(tuition)}
          </div>
        </div>
        <div className="rounded-[14px] bg-[#1b1b1b] p-5 text-white">
          <div className="text-xs uppercase tracking-[0.06em] text-white/65">
            Вернёте на карту
          </div>
          <div className="mt-2 text-[2rem] font-medium leading-[1.05]">
            {formatRub(refund)}
          </div>
          <div className="mt-1 text-xs text-white/72">
            13% от засчитанной суммы
          </div>
        </div>
        <div className="rounded-[14px] bg-white/70 p-5">
          <div className="text-xs uppercase tracking-[0.06em] text-[#262626]/55">
            Лимит вычета
          </div>
          <div className="mt-2 text-[1.75rem] font-medium leading-[1.05] text-[#1b1b1b]">
            {formatRub(maxRefund)}
          </div>
          <div className="mt-1 text-xs text-[#262626]/55">
            при расходах {formatRub(limit)}
          </div>
        </div>
      </div>

      {capped ? (
        <p className="mt-5 text-sm leading-[1.55] text-[#262626]/72">
          Сумма обучения превышает лимит — возврат рассчитан от{" "}
          {formatRub(limit)}. Если вы оплачиваете обучение нескольких членов семьи,
          сумма расходов суммируется до соответствующих лимитов.
        </p>
      ) : null}

      <div className="mt-7 grid gap-3 text-xs leading-[1.55] text-[#262626]/65 md:grid-cols-2">
        <p>
          Чтобы получить вычет, нужен документ от лицензированной школы и платёжные
          документы. У нас уже{" "}
          <Link href="/license" className="underline underline-offset-2 hover:text-[#1b1b1b]">
            образовательная лицензия
          </Link>{" "}
          — никаких отдельных бумаг от вас не потребуется.
        </p>
        <p>
          Подробная инструкция «как подать декларацию 3-НДФЛ и за что» —{" "}
          <Link
            href="/blog/license-tax-deduction-chinese-school"
            className="underline underline-offset-2 hover:text-[#1b1b1b]"
          >
            в статье блога
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
