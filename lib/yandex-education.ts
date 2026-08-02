import {
  CONTACT_EMAIL,
  LICENSEE,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "./site-config.ts";
import {
  COURSE_PACKAGES,
  type CoursePackageId,
} from "./course-packages.ts";
import {
  INDIVIDUAL_COURSE_MODULE_LIST,
  INDIVIDUAL_MODULE_CONTINUATION_COPY,
  INDIVIDUAL_MODULE_TERMS,
} from "./course-modules.ts";

export const YANDEX_EDUCATION_FEED_PATH = "/yandex-education.yml";
const YANDEX_EDUCATION_CANONICAL_ORIGIN = "https://chinachild.ru";

export const YANDEX_EDUCATION_SHOP = {
  name: SITE_NAME,
  company: LICENSEE.legalName,
  url: YANDEX_EDUCATION_CANONICAL_ORIGIN,
  email: CONTACT_EMAIL,
  picture: `${YANDEX_EDUCATION_CANONICAL_ORIGIN}/brand/logo.svg`,
  description: SITE_DESCRIPTION,
} as const;

export const YANDEX_EDUCATION_CATEGORIES = [
  { id: "10000", name: "Школьные предметы" },
  { id: "10023", parentId: "10000", name: "Китайский язык" },
  { id: "20000", name: "Языки" },
  { id: "20006", parentId: "20000", name: "Китайский язык" },
] as const;

export const CONFIRMED_COMMERCIAL_ROUTES = [
  "/courses/online-chinese",
  "/repetitor-kitayskogo",
  "/courses/chinese-for-adults",
  "/courses/chinese-for-kids",
  "/courses/hsk-preparation",
  "/courses/business-chinese",
  "/corporate",
  "/price",
  "/free-trial",
] as const;

export const YANDEX_EDUCATION_OFFER_ROUTES = [
  "/courses/chinese-for-adults",
  "/courses/chinese-for-kids",
  "/courses/hsk-preparation",
] as const;

const allowedOfferRoutes = new Set<string>(YANDEX_EDUCATION_OFFER_ROUTES);

export type YandexEducationDurationUnit = "час" | "день" | "месяц";
export type YandexEducationFormat =
  | "Самостоятельно"
  | "Самостоятельно с наставником"
  | "В группе с наставником"
  | "С преподавателем";

export type YandexEducationPlanItem = {
  order: number;
  title: string;
  hours: number;
  description: string;
};

export type YandexEducationOffer = {
  id: string;
  name: string;
  path: (typeof CONFIRMED_COMMERCIAL_ROUTES)[number];
  categoryId: "10023" | "20006";
  priceSource: CoursePackageId;
  priceRub: number;
  monthlyPriceRub: number;
  isSubscription: false;
  lessonCount: number;
  lessonMinutes: number;
  guidedHours: number;
  duration: {
    value: number;
    unit: YandexEducationDurationUnit;
  };
  plan: readonly YandexEducationPlanItem[];
  format: YandexEducationFormat;
  description: string;
  picture?: string;
  hasVideoLessons?: boolean;
  hasTextLessons?: boolean;
  hasHomework?: boolean;
  hasTrainingSimulators?: boolean;
  hasFreePart?: boolean;
  classes?: string;
};

export const YANDEX_EDUCATION_OFFERS: readonly YandexEducationOffer[] =
  INDIVIDUAL_COURSE_MODULE_LIST.map((module) => ({
    id: module.id,
    name: module.feedName,
    path: module.path,
    categoryId: module.categoryId,
    priceSource: "individual",
    // Yandex treats <price> as the full fixed course price. This modular
    // product has no mandatory full-program total, so the official monthly
    // price parameter carries the real orderable module price.
    priceRub: 0,
    monthlyPriceRub: INDIVIDUAL_MODULE_TERMS.priceRub,
    isSubscription: false,
    lessonCount: INDIVIDUAL_MODULE_TERMS.lessonCount,
    lessonMinutes: INDIVIDUAL_MODULE_TERMS.lessonMinutes,
    guidedHours: INDIVIDUAL_MODULE_TERMS.guidedHours,
    duration: {
      value: INDIVIDUAL_MODULE_TERMS.durationMonths,
      unit: "месяц",
    },
    plan: module.stages,
    format: "С преподавателем",
    description: `${module.description} ${INDIVIDUAL_MODULE_CONTINUATION_COPY}`,
    classes: "classes" in module ? module.classes : undefined,
  }));

type FeedRenderOptions = {
  generatedAt?: Date;
  offers?: readonly YandexEducationOffer[];
  allowEmpty?: boolean;
};

const durationUnits = new Set<YandexEducationDurationUnit>([
  "час",
  "день",
  "месяц",
]);
const formats = new Set<YandexEducationFormat>([
  "Самостоятельно",
  "Самостоятельно с наставником",
  "В группе с наставником",
  "С преподавателем",
]);
const categoryIds = new Set(
  YANDEX_EDUCATION_CATEGORIES.map((category) => category.id),
);
const forbiddenXmlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;
const classRangeListPattern = /^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/;

function requireText(value: string, label: string, errors: string[]): void {
  if (!value.trim()) errors.push(`${label} is empty`);
  if (forbiddenXmlCharacters.test(value)) {
    errors.push(`${label} contains an XML 1.0 control character`);
  }
}

function offerUrl(offer: YandexEducationOffer): string {
  return `${YANDEX_EDUCATION_CANONICAL_ORIGIN}${offer.path}`;
}

export function escapeYandexEducationXml(value: string): string {
  if (forbiddenXmlCharacters.test(value)) {
    throw new Error("XML text contains a forbidden XML 1.0 control character");
  }
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function validateYandexEducationOffers(
  offers: readonly YandexEducationOffer[],
  options: { allowEmpty?: boolean } = {},
): string[] {
  const errors: string[] = [];
  if (!options.allowEmpty && offers.length === 0) {
    errors.push("offer set is empty");
  }

  const ids = new Set<string>();
  const names = new Set<string>();
  const urls = new Set<string>();

  for (const [index, offer] of offers.entries()) {
    const prefix = `offers[${index}]`;
    requireText(offer.id, `${prefix}.id`, errors);
    requireText(offer.name, `${prefix}.name`, errors);
    requireText(offer.description, `${prefix}.description`, errors);

    if (!/^[A-Za-z0-9_-]+$/.test(offer.id)) {
      errors.push(`${prefix}.id must contain only stable ASCII ID characters`);
    }
    if (ids.has(offer.id)) errors.push(`${prefix}.id is duplicated`);
    if (names.has(offer.name)) errors.push(`${prefix}.name is duplicated`);
    ids.add(offer.id);
    names.add(offer.name);

    if (!allowedOfferRoutes.has(offer.path)) {
      errors.push(`${prefix}.path is not an approved canonical offer route`);
    }
    const url = offerUrl(offer);
    if (urls.has(url)) errors.push(`${prefix}.url is duplicated`);
    urls.add(url);
    if (!url.startsWith(`${YANDEX_EDUCATION_CANONICAL_ORIGIN}/`)) {
      errors.push(`${prefix}.url must use the production HTTPS origin`);
    }

    if (!categoryIds.has(offer.categoryId)) {
      errors.push(`${prefix}.categoryId is absent from the pinned rubricator`);
    }
    if (!Number.isInteger(offer.priceRub) || offer.priceRub < 0) {
      errors.push(`${prefix}.priceRub must be a non-negative integer`);
    }
    if (
      !Number.isInteger(offer.monthlyPriceRub) ||
      offer.monthlyPriceRub <= 0
    ) {
      errors.push(`${prefix}.monthlyPriceRub must be a positive integer`);
    }
    if (
      COURSE_PACKAGES[offer.priceSource]?.priceRub !== offer.monthlyPriceRub
    ) {
      errors.push(
        `${prefix}.monthlyPriceRub differs from its canonical price source`,
      );
    }
    if (offer.priceRub === 0 && offer.monthlyPriceRub <= 0) {
      errors.push(`${prefix} would be interpreted as a free offer`);
    }
    if (offer.isSubscription !== false) {
      errors.push(`${prefix}.isSubscription must be false`);
    }
    if (
      offer.lessonCount !== INDIVIDUAL_MODULE_TERMS.lessonCount ||
      offer.lessonMinutes !== INDIVIDUAL_MODULE_TERMS.lessonMinutes ||
      offer.guidedHours !== INDIVIDUAL_MODULE_TERMS.guidedHours
    ) {
      errors.push(`${prefix} lesson terms differ from the canonical module`);
    }
    if (
      !Number.isFinite(offer.duration.value) ||
      offer.duration.value <= 0 ||
      !durationUnits.has(offer.duration.unit)
    ) {
      errors.push(`${prefix}.duration is invalid`);
    }
    if (!formats.has(offer.format)) {
      errors.push(`${prefix}.format is invalid`);
    }
    if (
      offer.classes &&
      !classRangeListPattern.test(offer.classes.replace(/[–—]/g, "-"))
    ) {
      errors.push(`${prefix}.classes must be a comma-separated range list`);
    }
    if (offer.plan.length < 3) {
      errors.push(`${prefix}.plan must contain at least three stages`);
    }

    const planOrders = new Set<number>();
    for (const [planIndex, item] of offer.plan.entries()) {
      const planPrefix = `${prefix}.plan[${planIndex}]`;
      requireText(item.title, `${planPrefix}.title`, errors);
      requireText(item.description, `${planPrefix}.description`, errors);
      if (!Number.isInteger(item.order) || item.order <= 0) {
        errors.push(`${planPrefix}.order must be a positive integer`);
      }
      if (planOrders.has(item.order)) {
        errors.push(`${planPrefix}.order is duplicated`);
      }
      planOrders.add(item.order);
      if (!Number.isFinite(item.hours) || item.hours <= 0) {
        errors.push(`${planPrefix}.hours must be a positive number`);
      }
    }
    const expectedOrders = Array.from(
      { length: offer.plan.length },
      (_, order) => order + 1,
    );
    if (
      expectedOrders.some((order) => !planOrders.has(order)) ||
      planOrders.size !== expectedOrders.length
    ) {
      errors.push(`${prefix}.plan orders must be sequential from 1`);
    }
    const plannedHours = offer.plan.reduce(
      (total, item) => total + item.hours,
      0,
    );
    if (plannedHours !== offer.guidedHours) {
      errors.push(
        `${prefix}.plan totals ${plannedHours} hours instead of ${offer.guidedHours}`,
      );
    }

    if (
      offer.picture &&
      (!offer.picture.startsWith(`${YANDEX_EDUCATION_CANONICAL_ORIGIN}/`) ||
        !/\.(?:png|svg)$/i.test(new URL(offer.picture).pathname))
    ) {
      errors.push(`${prefix}.picture must be a production PNG or SVG URL`);
    }
    if (
      (offer.format === "Самостоятельно с наставником" ||
        offer.format === "В группе с наставником")
    ) {
      errors.push(
        `${prefix}.format requires a verified nearest start date, which this adapter does not model`,
      );
    }
  }

  return errors;
}

function renderBooleanParam(name: string, value: boolean | undefined): string {
  return value === undefined
    ? ""
    : `        <param name="${name}">${value ? "true" : "false"}</param>\n`;
}

function renderClassesParam(value: string | undefined): string {
  if (!value) return "";
  const rangeList = value.replace(/[–—]/g, "-");
  return `        <param name="Классы">${escapeYandexEducationXml(rangeList)}</param>\n`;
}

function renderOffer(offer: YandexEducationOffer): string {
  const plans = offer.plan
    .map(
      (item) =>
        `        <param name="План" order="${item.order}" unit="${escapeYandexEducationXml(item.title)}" hours="${item.hours}">${escapeYandexEducationXml(item.description)}</param>`,
    )
    .join("\n");

  return `      <offer id="${escapeYandexEducationXml(offer.id)}">
        <name>${escapeYandexEducationXml(offer.name)}</name>
        <url>${escapeYandexEducationXml(offerUrl(offer))}</url>
        <categoryId>${offer.categoryId}</categoryId>
        <price>${offer.priceRub}</price>
        <currencyId>RUR</currencyId>
        <param name="Ежемесячная цена">${offer.monthlyPriceRub}</param>
        <param name="Цена за подписку">${offer.isSubscription ? "true" : "false"}</param>
        <param name="Продолжительность" unit="${offer.duration.unit}">${offer.duration.value}</param>
${plans}
        <param name="Формат обучения">${offer.format}</param>
${renderBooleanParam("Есть видеоуроки", offer.hasVideoLessons)}${renderBooleanParam("Есть текстовые уроки", offer.hasTextLessons)}${renderBooleanParam("Есть домашние работы", offer.hasHomework)}${renderBooleanParam("Есть тренажеры", offer.hasTrainingSimulators)}${renderBooleanParam("Есть бесплатная часть", offer.hasFreePart)}${renderClassesParam(offer.classes)}${offer.picture ? `        <picture>${escapeYandexEducationXml(offer.picture)}</picture>\n` : ""}        <description>${escapeYandexEducationXml(offer.description)}</description>
      </offer>`;
}

function ymlDate(value: Date): string {
  if (Number.isNaN(value.getTime())) throw new Error("generatedAt is invalid");
  return value.toISOString().slice(0, 16).replace("T", " ");
}

export function renderYandexEducationFeed(
  options: FeedRenderOptions = {},
): string {
  const offers = options.offers ?? YANDEX_EDUCATION_OFFERS;
  const errors = validateYandexEducationOffers(offers, {
    allowEmpty: options.allowEmpty,
  });
  if (errors.length) {
    throw new Error(`Invalid Yandex Education feed:\n- ${errors.join("\n- ")}`);
  }

  const renderedOffers = offers.map(renderOffer).join("\n");

  return `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<yml_catalog date="${ymlDate(options.generatedAt ?? new Date())}">
  <shop>
    <name>${escapeYandexEducationXml(YANDEX_EDUCATION_SHOP.name)}</name>
    <company>${escapeYandexEducationXml(YANDEX_EDUCATION_SHOP.company)}</company>
    <url>${escapeYandexEducationXml(YANDEX_EDUCATION_SHOP.url)}</url>
    <email>${escapeYandexEducationXml(YANDEX_EDUCATION_SHOP.email)}</email>
    <picture>${escapeYandexEducationXml(YANDEX_EDUCATION_SHOP.picture)}</picture>
    <description>${escapeYandexEducationXml(YANDEX_EDUCATION_SHOP.description)}</description>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <offers>${renderedOffers ? `\n${renderedOffers}\n    ` : ""}</offers>
  </shop>
</yml_catalog>
`;
}
