import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  INDIVIDUAL_COURSE_MODULE_LIST,
  INDIVIDUAL_MODULE_CONTINUATION_COPY,
  INDIVIDUAL_MODULE_TERMS,
} from "../../../lib/course-modules.ts";
import {
  LEAD_RESPONSE_COMPACT,
  LEAD_RESPONSE_FULL,
  LEAD_RESPONSE_HOURS,
} from "../../../lib/site-config.ts";
import {
  renderYandexEducationFeed,
  YANDEX_EDUCATION_OFFERS,
} from "../../../lib/yandex-education.ts";

const PUBLIC_WORDING_FILES = [
  "app/about/page.tsx",
  "app/cities/[slug]/page.tsx",
  "app/courses/business-chinese/page.tsx",
  "app/courses/chinese-for-adults/page.tsx",
  "app/courses/chinese-for-kids/page.tsx",
  "app/courses/hsk-preparation/page.tsx",
  "app/courses/online-chinese/page.tsx",
  "app/courses/page.tsx",
  "app/free-trial/page.tsx",
  "app/license/page.tsx",
  "app/page.tsx",
  "app/price/page.tsx",
  "app/repetitor-kitayskogo/page.tsx",
  "app/results/page.tsx",
  "app/zayavka/page.tsx",
  "components/calculators/TaxDeductionCalculator.tsx",
  "components/forms/LeadForm.tsx",
  "components/hsk-test/HskTestLeadInline.tsx",
  "components/layout/Footer.tsx",
  "components/sections/FAQSection.tsx",
  "components/sections/PricingSection.tsx",
  "components/sections/ResultsSection.tsx",
  "lib/cities.ts",
  "lib/site-data.ts",
] as const;

async function readPublicWording(): Promise<string> {
  return (
    await Promise.all(
      PUBLIC_WORDING_FILES.map(async (file) => `${file}\n${await readFile(file, "utf8")}`),
    )
  ).join("\n");
}

test("individual module terms describe optional separately paid continuation", () => {
  assert.deepEqual(
    {
      priceRub: INDIVIDUAL_MODULE_TERMS.priceRub,
      durationMonths: INDIVIDUAL_MODULE_TERMS.durationMonths,
      lessonCount: INDIVIDUAL_MODULE_TERMS.lessonCount,
      lessonMinutes: INDIVIDUAL_MODULE_TERMS.lessonMinutes,
      guidedHours: INDIVIDUAL_MODULE_TERMS.guidedHours,
      subscription: INDIVIDUAL_MODULE_TERMS.isSubscription,
      installment: INDIVIDUAL_MODULE_TERMS.isInstallment,
      nextModulePurchasedSeparately:
        INDIVIDUAL_MODULE_TERMS.nextModulePurchasedSeparately,
    },
    {
      priceRub: 17_990,
      durationMonths: 1,
      lessonCount: 8,
      lessonMinutes: 60,
      guidedHours: 8,
      subscription: false,
      installment: false,
      nextModulePurchasedSeparately: true,
    },
  );
  assert.match(INDIVIDUAL_MODULE_CONTINUATION_COPY, /может продолжить обучение/i);
  assert.match(INDIVIDUAL_MODULE_CONTINUATION_COPY, /отдельно оплатив следующий модуль/i);
  assert.match(INDIVIDUAL_MODULE_CONTINUATION_COPY, /автоматического списания/i);
  assert.match(INDIVIDUAL_MODULE_CONTINUATION_COPY, /обязательной покупки/i);
});

test("all three education offers inherit the approved continuation terms", () => {
  assert.equal(INDIVIDUAL_COURSE_MODULE_LIST.length, 3);
  assert.equal(YANDEX_EDUCATION_OFFERS.length, 3);
  assert.ok(
    YANDEX_EDUCATION_OFFERS.every(
      (offer) =>
        offer.description.includes(INDIVIDUAL_MODULE_CONTINUATION_COPY) &&
        offer.monthlyPriceRub === 17_990 &&
        offer.duration.value === 1 &&
        offer.duration.unit === "месяц" &&
        offer.lessonCount === 8 &&
        offer.lessonMinutes === 60 &&
        offer.isSubscription === false,
    ),
  );
  const xml = renderYandexEducationFeed({
    generatedAt: new Date("2026-07-31T12:00:00.000Z"),
  });
  assert.equal(
    xml.match(/После завершения модуля ученик может продолжить обучение/g)?.length,
    3,
  );
  assert.equal(xml.match(/Автоматического списания/g)?.length, 3);
});

test("lead-response policy has one shared daily Moscow-time source", () => {
  assert.equal(LEAD_RESPONSE_HOURS, "ежедневно с 09:00 до 21:00 МСК");
  assert.match(LEAD_RESPONSE_COMPACT, /1–2 часов/i);
  assert.match(LEAD_RESPONSE_FULL, /ночью/i);
  assert.match(LEAD_RESPONSE_FULL, /следующего периода обработки заявок/i);
});

test("reviewed public surfaces contain no obsolete tax or response promises", async () => {
  const source = await readPublicWording();
  assert.doesNotMatch(source, /15(?:\s|&nbsp;)*600/);
  assert.doesNotMatch(source, /09:00.{0,12}19:00/i);
  assert.doesNotMatch(source, /в течение рабочего дня/i);
  assert.doesNotMatch(source, /перезванивает в рабочий день/i);
});
