export const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const ATTRIBUTION_MAX_TOUCHES = 100;
export const ATTRIBUTION_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "yclid", "gclid", "campaign_id", "ad_id", "gbid", "phrase_id",
] as const;

export type SourceTouch = {
  at: number;
  source: string;
  kind: "paid" | "tagged" | "search_unclassified" | "referral" | "conflicting";
  landingPath: string;
  referrerHost?: string;
  tags: Record<string, string>;
};
export type AttributionHistory = {
  version: 1;
  first: SourceTouch | null;
  last: SourceTouch | null;
  lastPaid: SourceTouch | null;
  history: SourceTouch[];
  truncated: boolean;
};

export function sanitizeAttributionTags(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const tags: Record<string, string> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const raw = input[key];
    if (typeof raw !== "string") continue;
    const v = raw.trim();
    if (!v || v.length > 200 || /[\u0000-\u001f\u007f{}<>@]/u.test(v)) continue;
    if (["yclid", "campaign_id", "ad_id", "gbid", "phrase_id"].includes(key) && !/^\d{1,64}$/.test(v)) continue;
    if (key === "gclid" && !/^[a-zA-Z0-9_-]{1,200}$/.test(v)) continue;
    tags[key] = v;
  }
  return tags;
}

function httpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch { return null; }
}

function internalHost(host: string, siteHost: string): boolean {
  const root = siteHost === "chinachild.ru" || siteHost.endsWith(".chinachild.ru") ? "chinachild.ru" : siteHost.replace(/^www\./, "");
  return host === root || host.endsWith(`.${root}`);
}

export function sourceTouch(urlString: string, referrer: string, at: number): SourceTouch | null {
  const url = httpUrl(urlString);
  if (!url) return null;
  const ref = httpUrl(referrer);
  if (ref && internalHost(ref.hostname, url.hostname)) return null;
  const tags = sanitizeAttributionTags(Object.fromEntries(url.searchParams));
  const source = tags.utm_source?.toLowerCase();
  const hasYandex = Boolean(tags.yclid);
  const hasGoogle = Boolean(tags.gclid);
  const conflicting = (hasYandex && hasGoogle) ||
    (hasYandex && Boolean(source && /^google([-_].*)?$/.test(source))) ||
    (hasGoogle && Boolean(source && /^(ya|yandex)([-_].*)?$/.test(source)));
  const paid = hasYandex || hasGoogle || /^(cpc|ppc|paid|paidsearch|paid_search|display|cpm|retargeting)$/i.test(tags.utm_medium ?? "");
  const base = { at, landingPath: url.pathname.slice(0, 300), tags,
    ...(ref ? { referrerHost: ref.hostname } : {}) };
  if (conflicting) return { ...base, source: "unknown", kind: "conflicting" };
  if (paid) return { ...base, source: hasYandex ? "yandex" : hasGoogle ? "google" : source ?? "unknown", kind: "paid" };
  if (Object.keys(tags).length) return { ...base, source: source ?? "unknown", kind: "tagged" };
  if (!ref) return null;
  // A search referrer alone cannot prove either paid or organic origin.
  if (/(^|\.)(yandex\.(ru|com|by|kz|uz)|ya\.ru)$/.test(ref.hostname)) return { ...base, source: "yandex", kind: "search_unclassified" };
  if (/(^|\.)google\.(com|[a-z]{2}|(co|com)\.[a-z]{2})$/.test(ref.hostname)) return { ...base, source: "google", kind: "search_unclassified" };
  if (/(^|\.)(bing\.com|duckduckgo\.com|search\.yahoo\.com|go\.mail\.ru|search\.mail\.ru|search\.brave\.com|qwant\.com)$/.test(ref.hostname)) return { ...base, source: ref.hostname, kind: "search_unclassified" };
  return { ...base, source: ref.hostname, kind: "referral" };
}

function validTouch(value: unknown, now: number): SourceTouch | null {
  if (!value || typeof value !== "object") return null;
  const v = value as SourceTouch;
  if (!Number.isFinite(v.at) || v.at > now || v.at <= now - ATTRIBUTION_TTL_MS ||
    typeof v.source !== "string" || !v.source.trim() || v.source.length > 200 || /[\u0000-\u001f\u007f{}<>@]/u.test(v.source) ||
    !["paid", "tagged", "search_unclassified", "referral", "conflicting"].includes(v.kind) ||
    typeof v.landingPath !== "string" || !v.landingPath.startsWith("/") || v.landingPath.startsWith("//")) return null;
  return { at: v.at, source: v.source, kind: v.kind,
    landingPath: v.landingPath.split(/[?#]/, 1)[0].slice(0, 300),
    ...(typeof v.referrerHost === "string" && /^[a-z0-9.-]{1,253}$/i.test(v.referrerHost) ? { referrerHost: v.referrerHost } : {}),
    tags: sanitizeAttributionTags(v.tags) };
}

export function attributionHistory(value: unknown, touch: SourceTouch | null, now = Date.now()): AttributionHistory {
  const input = value && typeof value === "object" ? value as Partial<AttributionHistory> : {};
  const history = (input.version === 1 && Array.isArray(input.history) ? input.history : [])
    .slice(-ATTRIBUTION_MAX_TOUCHES).map((v) => validTouch(v, now)).filter((v): v is SourceTouch => Boolean(v))
    .sort((a, b) => a.at - b.at);
  const next = validTouch(touch, now);
  const sameClick = next && history.some((v) =>
    (next.tags.yclid && v.tags.yclid === next.tags.yclid) ||
    (next.tags.gclid && v.tags.gclid === next.tags.gclid));
  if (next && !sameClick && !history.some((v) => JSON.stringify(v) === JSON.stringify(next))) history.push(next);
  history.sort((a, b) => a.at - b.at);
  const retainedFirst = validTouch(input.first, now);
  const first = [retainedFirst, ...history].filter((v): v is SourceTouch => Boolean(v)).sort((a, b) => a.at - b.at)[0] ?? null;
  const lastPaid = [...history].reverse().find((v) => v.kind === "paid") ?? validTouch(input.lastPaid, now);
  return { version: 1, first, last: history.at(-1) ?? null, lastPaid,
    history: history.slice(-ATTRIBUTION_MAX_TOUCHES),
    truncated: input.truncated === true || history.length > ATTRIBUTION_MAX_TOUCHES || (Array.isArray(input.history) && input.history.length > ATTRIBUTION_MAX_TOUCHES) };
}
