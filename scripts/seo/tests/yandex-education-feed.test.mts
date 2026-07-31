import assert from "node:assert/strict";
import test from "node:test";
import {
  CONFIRMED_COMMERCIAL_ROUTES,
  escapeYandexEducationXml,
  renderYandexEducationFeed,
  validateYandexEducationOffers,
  YANDEX_EDUCATION_CATEGORIES,
  YANDEX_EDUCATION_OFFERS,
  YANDEX_EDUCATION_OFFER_ROUTES,
  type YandexEducationOffer,
} from "../../../lib/yandex-education.ts";
import { validateYandexEducationXml } from "../yandex-education.mts";

function validOffer(
  overrides: Partial<YandexEducationOffer> = {},
): YandexEducationOffer {
  return {
    id: "adult-individual-monthly-module",
    name: "Китайский для взрослых — индивидуальный модуль",
    path: "/courses/chinese-for-adults",
    categoryId: "20006",
    priceSource: "individual",
    priceRub: 0,
    monthlyPriceRub: 17_990,
    isSubscription: false,
    lessonCount: 8,
    lessonMinutes: 60,
    guidedHours: 8,
    duration: { value: 1, unit: "месяц" },
    plan: [
      {
        order: 1,
        title: "Фонетика & пиньинь",
        hours: 2,
        description: "Четыре тона <без догадок> и базовое произношение.",
      },
      {
        order: 2,
        title: "Иероглифы",
        hours: 2,
        description: "Ключи, порядок черт и базовая лексика.",
      },
      {
        order: 3,
        title: "Диалоги",
        hours: 4,
        description: "Аудирование, чтение и бытовые сценарии.",
      },
    ],
    format: "С преподавателем",
    description:
      "Онлайн-курс китайского для взрослых с нуля: кириллица, 汉字 и HSK 1–2.",
    hasVideoLessons: true,
    hasTextLessons: true,
    hasTrainingSimulators: true,
    ...overrides,
  };
}

test("renderer escapes XML while preserving Cyrillic and Chinese text", () => {
  assert.equal(
    escapeYandexEducationXml(`Курс & "тона" <HSK> '入门'`),
    "Курс &amp; &quot;тона&quot; &lt;HSK&gt; &apos;入门&apos;",
  );
  const xml = renderYandexEducationFeed({
    generatedAt: new Date("2026-07-30T20:15:00.000Z"),
    offers: [validOffer()],
  });
  assert.match(xml, /Фонетика &amp; пиньинь/);
  assert.match(xml, /Четыре тона &lt;без догадок&gt;/);
  assert.match(xml, /кириллица, 汉字 и HSK 1–2/);
  assert.deepEqual(
    validateYandexEducationXml(xml, { expectedOffers: [validOffer()] }).errors,
    [],
  );
});

test("generation is deterministic for a fixed date and keeps stable offer IDs", () => {
  const options = {
    generatedAt: new Date("2026-07-30T20:15:00.000Z"),
    offers: [validOffer()],
  };
  const first = renderYandexEducationFeed(options);
  const second = renderYandexEducationFeed(options);
  assert.equal(first, second);
  assert.match(first, /<offer id="adult-individual-monthly-module">/);
  assert.match(first, /date="2026-07-30 20:15"/);
});

test("Education XML omits local categories and unmodeled sets", () => {
  const xml = renderYandexEducationFeed({
    generatedAt: new Date("2026-07-30T20:15:00.000Z"),
    offers: [validOffer()],
  });
  assert.doesNotMatch(xml, /<categories\b|<sets\b|<set-ids\b/);
});

test("school classes use the provider-required RANGELIST type", () => {
  const xml = renderYandexEducationFeed({
    generatedAt: new Date("2026-07-30T20:15:00.000Z"),
    offers: [validOffer({ classes: "5–11" })],
  });
  assert.match(
    xml,
    /<param name="Классы" type="RANGELIST">5-11<\/param>/,
  );
  assert.deepEqual(
    validateYandexEducationXml(xml, {
      expectedOffers: [validOffer({ classes: "5–11" })],
    }).errors,
    [],
  );
});

test("validator rejects the three structures reported by Yandex Webmaster", () => {
  const base = renderYandexEducationFeed({
    generatedAt: new Date("2026-07-30T20:15:00.000Z"),
    offers: [validOffer({ classes: "5–11" })],
  });
  const withCategories = base.replace(
    "    <offers>",
    "    <categories><category id=\"20006\">Китайский язык</category></categories>\n    <offers>",
  );
  const withEmptySets = base.replace("    <offers>", "    <sets></sets>\n    <offers>");
  const withoutRangeType = base.replace(' type="RANGELIST"', "");
  assert.ok(
    errorsContain(
      validateYandexEducationXml(withCategories, {
        expectedOffers: [validOffer({ classes: "5–11" })],
      }).errors,
      "must not declare local categories",
    ),
  );
  assert.ok(
    errorsContain(
      validateYandexEducationXml(withEmptySets, {
        expectedOffers: [validOffer({ classes: "5–11" })],
      }).errors,
      "must not declare unmodeled sets",
    ),
  );
  assert.ok(
    errorsContain(
      validateYandexEducationXml(withoutRangeType, {
        expectedOffers: [validOffer({ classes: "5–11" })],
      }).errors,
      "classes type must be RANGELIST",
    ),
  );
});

test("duplicate URLs and IDs are rejected", () => {
  const duplicate = validOffer({
    name: "Другое название",
  });
  const errors = validateYandexEducationOffers([validOffer(), duplicate]);
  assert.ok(errors.some((error) => error.includes("id is duplicated")));
  assert.ok(errors.some((error) => error.includes("url is duplicated")));
});

test("monthly module price is required and must match the canonical package source", () => {
  const missing = validateYandexEducationOffers([
    validOffer({ monthlyPriceRub: 0 }),
  ]);
  assert.ok(errorsContain(missing, "positive integer"));
  assert.ok(errorsContain(missing, "canonical price source"));

  const stale = validateYandexEducationOffers([
    validOffer({ monthlyPriceRub: 18_990 }),
  ]);
  assert.ok(errorsContain(stale, "canonical price source"));
});

test("monthly module is not rendered as free, a subscription, or an instalment", () => {
  const xml = renderYandexEducationFeed({
    generatedAt: new Date("2026-07-30T20:15:00.000Z"),
    offers: [validOffer()],
  });
  assert.match(xml, /<price>0<\/price>/);
  assert.match(xml, /<param name="Ежемесячная цена">17990<\/param>/);
  assert.match(xml, /<param name="Цена за подписку">false<\/param>/);
  assert.doesNotMatch(xml, /Оплата в рассрочку|скидк|71960|107940/i);
});

test("invalid rubric categories, images, and noncanonical routes are rejected", () => {
  const invalidCategory = validOffer({
    categoryId: "99999" as YandexEducationOffer["categoryId"],
  });
  const invalidImage = validOffer({
    picture: "https://chinachild.ru/course.webp",
  });
  const invalidRoute = validOffer({
    path: "/price",
  });
  assert.ok(
    errorsContain(
      validateYandexEducationOffers([invalidCategory]),
      "pinned rubricator",
    ),
  );
  assert.ok(
    errorsContain(
      validateYandexEducationOffers([invalidImage]),
      "production PNG or SVG",
    ),
  );
  assert.ok(
    errorsContain(
      validateYandexEducationOffers([invalidRoute]),
      "approved canonical",
    ),
  );
});

test("incomplete plans and an empty offer set fail submission validation", () => {
  const incomplete = validateYandexEducationOffers([
    validOffer({ plan: validOffer().plan.slice(0, 2) }),
  ]);
  assert.ok(errorsContain(incomplete, "at least three stages"));
  assert.deepEqual(validateYandexEducationOffers([]), ["offer set is empty"]);
  assert.deepEqual(validateYandexEducationOffers([], { allowEmpty: true }), []);
});

test("malformed XML and contradictory currency fail parsed-feed validation", () => {
  const malformed = validateYandexEducationXml("<yml_catalog><shop>");
  assert.ok(errorsContain(malformed.errors, "XML parsing failed"));

  const xml = renderYandexEducationFeed({
    generatedAt: new Date("2026-07-30T20:15:00.000Z"),
    offers: [validOffer()],
  }).replace("<currencyId>RUR</currencyId>", "<currencyId>USD</currencyId>");
  assert.ok(
    errorsContain(
      validateYandexEducationXml(xml, { expectedOffers: [validOffer()] }).errors,
      "currencyId is not RUR",
    ),
  );
});

test("current rubricator and route guard contain only confirmed canonical values", () => {
  assert.deepEqual(
    YANDEX_EDUCATION_CATEGORIES.map(({ id }) => id),
    ["10000", "10023", "20000", "20006"],
  );
  assert.ok(CONFIRMED_COMMERCIAL_ROUTES.includes("/repetitor-kitayskogo"));
  assert.deepEqual(YANDEX_EDUCATION_OFFER_ROUTES, [
    "/courses/chinese-for-adults",
    "/courses/chinese-for-kids",
    "/courses/hsk-preparation",
  ]);
  assert.deepEqual(
    YANDEX_EDUCATION_OFFERS.map(({ id, path }) => ({ id, path })),
    [
      {
        id: "adult-individual-monthly-module",
        path: "/courses/chinese-for-adults",
      },
      {
        id: "schoolchildren-12plus-individual-monthly-module",
        path: "/courses/chinese-for-kids",
      },
      {
        id: "hsk-individual-monthly-module",
        path: "/courses/hsk-preparation",
      },
    ],
  );
  assert.ok(
    YANDEX_EDUCATION_OFFERS.every(
      (offer) =>
        offer.priceRub === 0 &&
        offer.monthlyPriceRub === 17_990 &&
        offer.isSubscription === false &&
        offer.plan.reduce((total, stage) => total + stage.hours, 0) === 8,
    ),
  );
});

function errorsContain(errors: readonly string[], fragment: string): boolean {
  return errors.some((error) => error.includes(fragment));
}
