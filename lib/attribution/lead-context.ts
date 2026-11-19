import { sanitizeAttributionTags, sourceTouch, summarizeAttribution, attributionHistory } from "./history.ts";

/** One document's context, read only when a visitor submits a consented application.
 * No visitor ID, storage, history or analytics request is needed for this evidence. */
export type LeadContext = {
  version: 1;
  basis: "form_submission";
  landingPath: string;
  referrerHost?: string;
  tags: Record<string, string>;
};

function webUrl(value: unknown): URL | null {
  try {
    const url = new URL(String(value));
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url : null;
  } catch { return null; }
}

export function documentLeadContext(urlValue: string, referrer: string): LeadContext | undefined {
  let url = webUrl(urlValue);
  if (!url) return undefined;
  const ref = webUrl(referrer);
  const internal = ref?.origin === url.origin;
  let tags = sanitizeAttributionTags(Object.fromEntries(url.searchParams));
  // A full document navigation may leave the tagged landing URL in its same-site
  // referrer. Recover only our own URL's allowlisted tags, never another site's tags.
  if (!Object.keys(tags).length && ref && ref.origin === url.origin) {
    const previous = sanitizeAttributionTags(Object.fromEntries(ref.searchParams));
    if (Object.keys(previous).length) { tags = previous; url = ref; }
  }
  return { version: 1, basis: "form_submission", landingPath: url.pathname.slice(0, 300),
    ...(ref ? { referrerHost: internal ? "chinachild.ru" : ref.hostname } : {}), tags };
}

export function sanitizeLeadContext(value: unknown): LeadContext | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const v = value as Record<string, unknown>;
  if (v.version !== 1 || v.basis !== "form_submission" || typeof v.landingPath !== "string" ||
    !v.landingPath.startsWith("/") || v.landingPath.startsWith("//") || /[\u0000-\u001f\u007f<>\\]/u.test(v.landingPath)) return undefined;
  return { version: 1, basis: "form_submission", landingPath: v.landingPath.split(/[?#]/, 1)[0].slice(0, 300),
    ...(typeof v.referrerHost === "string" && /^(?=.{1,253}$)[a-z0-9]+(?:[.-][a-z0-9]+)*$/i.test(v.referrerHost)
      ? { referrerHost: v.referrerHost.toLowerCase() } : {}), tags: sanitizeAttributionTags(v.tags) };
}

export function leadContextSource(context: LeadContext, now = Date.now()) {
  const url = new URL(context.landingPath, "https://chinachild.ru");
  for (const [key, value] of Object.entries(context.tags)) url.searchParams.set(key, value);
  return sourceTouch(url.href, Object.keys(context.tags).length ? "" : context.referrerHost ? `https://${context.referrerHost}/` : "", now);
}

export function summarizeLeadContext(context: LeadContext, now = Date.now()) {
  const source = leadContextSource(context, now);
  const summary = summarizeAttribution(attributionHistory(undefined, source, now), false, "granted");
  return { ...summary, basis: "form_submission" as const,
    channel: source?.kind === "search_unclassified" ? "search" : source?.kind === "tagged" && summary.channel === "unknown" ? "other" : summary.channel,
    reason: !source ? context.referrerHost ? "internal_referrer" : "referrer_missing" : summary.reason };
}
