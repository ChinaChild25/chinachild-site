import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  renderYandexEducationFeed,
  validateYandexEducationOffers,
  YANDEX_EDUCATION_CATEGORIES,
  YANDEX_EDUCATION_FEED_PATH,
  YANDEX_EDUCATION_OFFERS,
  YANDEX_EDUCATION_OFFER_ROUTES,
  YANDEX_EDUCATION_SHOP,
  type YandexEducationOffer,
} from "../../lib/yandex-education.ts";

const allowedStatuses = new Set([
  "confirmed compliant",
  "likely compliant but needs owner verification",
  "non-compliant",
  "not verifiable from repository",
  "not applicable",
]);
type ParsedFeed = {
  yml_catalog?: {
    "@_date"?: string;
    shop?: Record<string, unknown>;
  };
};

type AuditResult = {
  checks: string[];
  errors: string[];
  offerCount: number;
  offerIds: string[];
};

function values<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function xmlAttributes(value: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const match of value.matchAll(/\b([A-Za-z_][\w:.-]*)=(["'])(.*?)\2/g)) {
    attributes[`@_${match[1]}`] = decodeXml(match[3]);
  }
  return attributes;
}

function xmlElements(
  xml: string,
  name: string,
): Array<{ attributes: Record<string, string>; body: string }> {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(
    `<${escaped}\\b([^>]*)>([\\s\\S]*?)<\\/${escaped}>`,
    "gi",
  );
  return [...xml.matchAll(expression)].map((match) => ({
    attributes: xmlAttributes(match[1]),
    body: match[2],
  }));
}

function xmlTagText(xml: string, name: string): string {
  const element = xmlElements(xml, name)[0];
  return element ? decodeXml(element.body.trim()) : "";
}

function parseKnownFeed(xml: string): ParsedFeed {
  const catalog = xmlElements(xml, "yml_catalog")[0];
  const shopElement = catalog ? xmlElements(catalog.body, "shop")[0] : undefined;
  if (!catalog || !shopElement) return {};
  const shopXml = shopElement.body;
  const currencyMatch = shopXml.match(/<currency\b([^>]*?)\/?>/i);
  const offersElement = xmlElements(shopXml, "offers")[0];
  const offers = offersElement
    ? xmlElements(offersElement.body, "offer").map((offer) => ({
        ...offer.attributes,
        name: xmlTagText(offer.body, "name"),
        url: xmlTagText(offer.body, "url"),
        categoryId: xmlTagText(offer.body, "categoryId"),
        price: xmlTagText(offer.body, "price"),
        currencyId: xmlTagText(offer.body, "currencyId"),
        description: xmlTagText(offer.body, "description"),
        param: xmlElements(offer.body, "param").map((param) => ({
          ...param.attributes,
          "#text": decodeXml(param.body.trim()),
        })),
      }))
    : [];
  return {
    yml_catalog: {
      ...catalog.attributes,
      shop: {
        name: xmlTagText(shopXml, "name"),
        company: xmlTagText(shopXml, "company"),
        url: xmlTagText(shopXml, "url"),
        email: xmlTagText(shopXml, "email"),
        picture: xmlTagText(shopXml, "picture"),
        description: xmlTagText(shopXml, "description"),
        currencies: {
          currency: currencyMatch ? xmlAttributes(currencyMatch[1]) : {},
        },
        offers: { offer: offers },
      },
    },
  };
}

function validateXmlWithLibxml(xml: string): string | undefined {
  const parsed = spawnSync("xmllint", ["--noout", "-"], {
    input: xml,
    encoding: "utf8",
  });
  if (parsed.error) {
    return `xmllint could not run: ${parsed.error.message}`;
  }
  if (parsed.status !== 0) {
    return (parsed.stderr || "unknown parser error").trim();
  }
  return undefined;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

function canonicalFromHtml(html: string): string {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/\brel=(["'])canonical\1/i.test(tag)) continue;
    return tag.match(/\bhref=(["'])(.*?)\1/i)?.[2] ?? "";
  }
  return "";
}

function normalizedVisibleText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");
}

function visiblePricePattern(priceRub: number): RegExp {
  const grouped = new Intl.NumberFormat("ru-RU")
    .format(priceRub)
    .replace(/\u00a0/g, "[\\s\\u00a0]*");
  return new RegExp(`${grouped}\\s*₽`);
}

export function validateYandexEducationXml(
  xml: string,
  options: {
    allowEmpty?: boolean;
    expectedOffers?: readonly YandexEducationOffer[];
  } = {},
): AuditResult {
  const checks: string[] = [];
  const errors: string[] = [];
  const parserError = validateXmlWithLibxml(xml);
  if (parserError) {
    return {
      checks,
      errors: [`XML parsing failed: ${parserError}`],
      offerCount: 0,
      offerIds: [],
    };
  }
  checks.push("XML is well-formed and UTF-8-declared");

  const parsed = parseKnownFeed(xml);
  const catalog = parsed.yml_catalog;
  const shop = record(catalog?.shop);
  if (!catalog) errors.push("missing yml_catalog root");
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(catalog?.["@_date"] ?? "")) {
    errors.push("yml_catalog date is missing or invalid");
  }

  for (const key of ["name", "company", "url", "email", "picture"]) {
    if (!text(shop[key]).trim()) errors.push(`shop.${key} is empty`);
  }
  if (text(shop.name).length > 30) errors.push("shop.name exceeds 30 characters");
  if (text(shop.url) !== YANDEX_EDUCATION_SHOP.url) {
    errors.push("shop.url differs from the canonical production origin");
  }
  if (!/\.svg$/i.test(new URL(text(shop.picture) || "https://invalid/").pathname)) {
    errors.push("shop.picture is not the approved square SVG logo");
  }

  const currency = record(record(shop.currencies).currency);
  if (currency["@_id"] !== "RUR" || currency["@_rate"] !== "1") {
    errors.push("RUR currency with rate 1 is missing");
  }

  if (/<categories\b/i.test(xml)) {
    errors.push("Education feed must not declare local categories");
  }
  if (/<sets\b/i.test(xml) || /<set-ids\b/i.test(xml)) {
    errors.push("feed must not declare unmodeled sets or set-ids");
  }
  const rubricatorCategoryIds: ReadonlySet<string> = new Set(
    YANDEX_EDUCATION_CATEGORIES.map((category) => category.id),
  );

  const offers = values(record(shop.offers).offer).map(record);
  const offerIds = offers.map((offer) => text(offer["@_id"]));
  if (!options.allowEmpty && offers.length === 0) errors.push("offer set is empty");
  const expectedOffers = options.expectedOffers ?? YANDEX_EDUCATION_OFFERS;
  if (offers.length !== expectedOffers.length) {
    errors.push(
      `rendered offer count ${offers.length} differs from source count ${expectedOffers.length}`,
    );
  }

  const ids = new Set<string>();
  const urls = new Set<string>();
  for (const [index, offer] of offers.entries()) {
    const prefix = `offers[${index}]`;
    const id = text(offer["@_id"]);
    const url = text(offer.url);
    if (!id) errors.push(`${prefix}.id is empty`);
    if (ids.has(id)) errors.push(`${prefix}.id is duplicated`);
    ids.add(id);
    if (!text(offer.name)) errors.push(`${prefix}.name is empty`);
    if (urls.has(url)) errors.push(`${prefix}.url is duplicated`);
    urls.add(url);
    if (!url.startsWith(`${YANDEX_EDUCATION_SHOP.url}/`)) {
      errors.push(`${prefix}.url is not a production offer URL`);
    }
    let offerPath = "";
    try {
      offerPath = new URL(url).pathname;
    } catch {
      errors.push(`${prefix}.url is malformed`);
    }
    if (
      offerPath &&
      !YANDEX_EDUCATION_OFFER_ROUTES.includes(
        offerPath as (typeof YANDEX_EDUCATION_OFFER_ROUTES)[number],
      )
    ) {
      errors.push(`${prefix}.url is not an approved canonical offer route`);
    }
    if (!rubricatorCategoryIds.has(text(offer.categoryId))) {
      errors.push(`${prefix}.categoryId is absent from the pinned rubricator`);
    }
    if (!/^\d+$/.test(text(offer.price)) || Number(offer.price) < 0) {
      errors.push(`${prefix}.price is invalid`);
    }
    if (text(offer.currencyId) !== "RUR") {
      errors.push(`${prefix}.currencyId is not RUR`);
    }
    if (!text(offer.description)) errors.push(`${prefix}.description is empty`);

    const params = values(offer.param).map(record);
    const monthlyPrice = params.find(
      (param) => param["@_name"] === "Ежемесячная цена",
    );
    const subscriptionPrice = params.find(
      (param) => param["@_name"] === "Цена за подписку",
    );
    if (!monthlyPrice || Number(monthlyPrice["#text"]) <= 0) {
      errors.push(`${prefix}.monthly price is missing or invalid`);
    }
    if (!subscriptionPrice || text(subscriptionPrice["#text"]) !== "false") {
      errors.push(`${prefix}.subscription flag must be false`);
    }
    if (Number(offer.price) === 0 && Number(monthlyPrice?.["#text"]) <= 0) {
      errors.push(`${prefix} would be interpreted as free`);
    }
    const duration = params.find(
      (param) => param["@_name"] === "Продолжительность",
    );
    if (
      !duration ||
      !["час", "день", "месяц"].includes(text(duration["@_unit"])) ||
      Number(duration["#text"]) <= 0
    ) {
      errors.push(`${prefix}.duration is missing or invalid`);
    }
    const plans = params.filter((param) => param["@_name"] === "План");
    if (plans.length < 3) errors.push(`${prefix}.plan has fewer than three stages`);
    for (const [planIndex, plan] of plans.entries()) {
      if (!text(plan["@_unit"])) {
        errors.push(`${prefix}.plan[${planIndex}].unit is empty`);
      }
      if (Number(plan["@_hours"]) <= 0) {
        errors.push(`${prefix}.plan[${planIndex}].hours is invalid`);
      }
      if (Number(plan["@_order"]) !== planIndex + 1) {
        errors.push(`${prefix}.plan[${planIndex}].order is not sequential`);
      }
      if (!text(plan["#text"])) {
        errors.push(`${prefix}.plan[${planIndex}] description is empty`);
      }
    }
    const expectedOffer = expectedOffers[index];
    const planHours = plans.reduce(
      (total, plan) => total + Number(plan["@_hours"]),
      0,
    );
    if (expectedOffer && planHours !== expectedOffer.guidedHours) {
      errors.push(
        `${prefix}.plan totals ${planHours} hours instead of ${expectedOffer.guidedHours}`,
      );
    }
    const classes = params.find((param) => param["@_name"] === "Классы");
    if (classes) {
      if (text(classes["@_type"]) !== "RANGELIST") {
        errors.push(`${prefix}.classes type must be RANGELIST`);
      }
      if (!/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/.test(text(classes["#text"]))) {
        errors.push(`${prefix}.classes value is not a normalized range list`);
      }
    }
  }

  if (errors.length === 0) {
    checks.push(`feed business structure is valid (${offers.length} offers)`);
  }
  return { checks, errors, offerCount: offers.length, offerIds };
}

async function validateLocalLogo(
  repositoryRoot: string,
  result: AuditResult,
): Promise<void> {
  const svg = await readFile(
    path.join(repositoryRoot, "public/brand/logo.svg"),
    "utf8",
  );
  const width = Number(svg.match(/<svg[^>]*\bwidth="(\d+)"/i)?.[1]);
  const height = Number(svg.match(/<svg[^>]*\bheight="(\d+)"/i)?.[1]);
  if (width < 100 || height < 100 || width !== height) {
    result.errors.push(
      `shop logo must be square and at least 100×100; found ${width}×${height}`,
    );
  } else {
    result.checks.push(`shop logo is a valid square SVG (${width}×${height})`);
  }
}

async function validateChecklist(
  repositoryRoot: string,
  result: AuditResult,
): Promise<void> {
  const filename = path.join(
    repositoryRoot,
    "seo-data/yandex-education/eligibility-checklist.csv",
  );
  const lines = (await readFile(filename, "utf8"))
    .split(/\r?\n/)
    .filter(Boolean);
  const header = parseCsvLine(lines[0] ?? "");
  const statusIndex = header.indexOf("status");
  if (statusIndex < 0) {
    result.errors.push("eligibility checklist has no status column");
    return;
  }
  const invalidRows = lines
    .slice(1)
    .map(parseCsvLine)
    .filter((row) => !allowedStatuses.has(row[statusIndex]));
  if (invalidRows.length) {
    result.errors.push(
      `${invalidRows.length} eligibility checklist rows use an unsupported status`,
    );
  } else {
    result.checks.push(
      `eligibility checklist uses controlled statuses (${lines.length - 1} requirements)`,
    );
  }
}

async function validateOfferIdBaseline(
  repositoryRoot: string,
  result: AuditResult,
): Promise<void> {
  const filename = path.join(
    repositoryRoot,
    "seo-data/yandex-education/offer-id-baseline.json",
  );
  const baseline = JSON.parse(await readFile(filename, "utf8")) as {
    offerIds?: unknown;
  };
  const expected = Array.isArray(baseline.offerIds)
    ? baseline.offerIds.filter((value): value is string => typeof value === "string")
    : [];
  if (
    expected.length !== result.offerIds.length ||
    expected.some((id, index) => id !== result.offerIds[index])
  ) {
    result.errors.push(
      `offer IDs changed: baseline [${expected.join(", ")}], feed [${result.offerIds.join(", ")}]`,
    );
  } else {
    result.checks.push("offer IDs match the reviewed baseline");
  }
}

async function validateLiveFeed(
  baseUrl: string,
  result: AuditResult,
): Promise<void> {
  const origin = baseUrl.replace(/\/+$/, "");
  const response = await fetch(`${origin}${YANDEX_EDUCATION_FEED_PATH}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: { "User-Agent": "chinachild-yandex-education-audit/1.0" },
  });
  if (response.status !== 200) {
    result.errors.push(`feed URL returned HTTP ${response.status}`);
    return;
  }
  if (!/^(?:application|text)\/xml\b/i.test(response.headers.get("content-type") ?? "")) {
    result.errors.push("feed URL returned an unsupported Content-Type");
  }
  if (
    YANDEX_EDUCATION_OFFERS.length > 0 &&
    response.headers.get("x-yandex-education-readiness") !==
      "ready-for-validation"
  ) {
    result.errors.push("active feed is missing the ready-for-validation header");
  }
  const liveXml = await response.text();
  const liveResult = validateYandexEducationXml(liveXml, {
    allowEmpty: true,
    expectedOffers: YANDEX_EDUCATION_OFFERS,
  });
  result.errors.push(...liveResult.errors.map((error) => `live feed: ${error}`));
  result.checks.push(`feed URL is available at ${origin}${YANDEX_EDUCATION_FEED_PATH}`);

  const logoUrl = new URL(YANDEX_EDUCATION_SHOP.picture);
  const logoResponse = await fetch(`${origin}${logoUrl.pathname}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: { "User-Agent": "chinachild-yandex-education-audit/1.0" },
  });
  const logoContentType = logoResponse.headers.get("content-type") ?? "";
  if (logoResponse.status !== 200) {
    result.errors.push(`shop logo URL returned HTTP ${logoResponse.status}`);
  } else if (!/^image\/(?:png|svg\+xml)(?:;|$)/i.test(logoContentType)) {
    result.errors.push(
      `shop logo URL returned unsupported Content-Type ${logoContentType || "(empty)"}`,
    );
  } else {
    result.checks.push("shop logo URL is directly available as PNG or SVG");
  }

  for (const offer of YANDEX_EDUCATION_OFFERS) {
    const url = `${origin}${offer.path}`;
    const page = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": "chinachild-yandex-education-audit/1.0" },
    });
    if (page.status !== 200) {
      result.errors.push(`${offer.id}: offer URL returned HTTP ${page.status}`);
      continue;
    }
    const html = await page.text();
    const expectedCanonical = `${YANDEX_EDUCATION_SHOP.url}${offer.path}`;
    if (canonicalFromHtml(html) !== expectedCanonical) {
      result.errors.push(`${offer.id}: canonical does not match ${expectedCanonical}`);
    }
    const visibleText = normalizedVisibleText(html);
    if (!visiblePricePattern(offer.monthlyPriceRub).test(visibleText)) {
      result.errors.push(`${offer.id}: current feed price is not visible on its page`);
    }
    if (
      !new RegExp(`${offer.lessonCount}\\s+(?:заняти|урок)`, "i").test(
        visibleText,
      ) ||
      !new RegExp(`${offer.lessonMinutes}\\s+минут`, "i").test(visibleText) ||
      !/один месяц|за месяц|на месяц/i.test(visibleText) ||
      !/следующ(?:ий|его) модул/i.test(visibleText)
    ) {
      result.errors.push(
        `${offer.id}: visible page is missing the reviewed module terms`,
      );
    }
    if (offer.picture) {
      const pictureUrl = new URL(offer.picture);
      const picture = await fetch(`${origin}${pictureUrl.pathname}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
        headers: { "User-Agent": "chinachild-yandex-education-audit/1.0" },
      });
      const pictureContentType = picture.headers.get("content-type") ?? "";
      if (
        picture.status !== 200 ||
        !/^image\/(?:png|svg\+xml)(?:;|$)/i.test(pictureContentType)
      ) {
        result.errors.push(
          `${offer.id}: picture must return 200 as PNG or SVG without a redirect`,
        );
      }
    }
  }
}

export async function auditYandexEducationFeed(options: {
  allowEmpty?: boolean;
  baseUrl?: string;
  repositoryRoot?: string;
  generatedAt?: Date;
} = {}): Promise<AuditResult> {
  const repositoryRoot = options.repositoryRoot ?? process.cwd();
  const sourceErrors = validateYandexEducationOffers(YANDEX_EDUCATION_OFFERS, {
    allowEmpty: options.allowEmpty,
  });
  const xml = renderYandexEducationFeed({
    generatedAt: options.generatedAt,
    offers: YANDEX_EDUCATION_OFFERS,
    allowEmpty: options.allowEmpty,
  });
  const result = validateYandexEducationXml(xml, {
    allowEmpty: options.allowEmpty,
    expectedOffers: YANDEX_EDUCATION_OFFERS,
  });
  for (const error of sourceErrors) {
    if (!result.errors.includes(error)) result.errors.push(error);
  }
  await Promise.all([
    validateLocalLogo(repositoryRoot, result),
    validateChecklist(repositoryRoot, result),
    validateOfferIdBaseline(repositoryRoot, result),
  ]);
  if (options.baseUrl) await validateLiveFeed(options.baseUrl, result);
  return result;
}

function option(args: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const allowEmpty = args.includes("--allow-empty");
  const printXml = args.includes("--print");
  const result = await auditYandexEducationFeed({
    allowEmpty,
    baseUrl: option(args, "base-url"),
  });
  if (printXml) {
    console.log(
      renderYandexEducationFeed({
        offers: YANDEX_EDUCATION_OFFERS,
        allowEmpty,
      }),
    );
  }
  for (const check of result.checks) console.log(`[PASS] ${check}`);
  for (const error of result.errors) console.error(`[FAIL] ${error}`);
  console.log(
    `Yandex Education feed: ${result.offerCount} offers, ${result.errors.length} errors`,
  );
  if (result.errors.length) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
