export type LeadAntiAbusePayload = {
  company?: unknown;
  website?: unknown;
  url?: unknown;
  fax?: unknown;
  form_started_at?: unknown;
};

export function isSpamPayload(
  body: LeadAntiAbusePayload,
  now = Date.now(),
): boolean {
  const honeypotValues = [body.company, body.website, body.url, body.fax];
  if (
    honeypotValues.some(
      (value) => typeof value === "string" && value.trim() !== "",
    )
  ) {
    return true;
  }

  if (typeof body.form_started_at === "string") {
    const startedAt = Number(body.form_started_at);
    if (Number.isFinite(startedAt) && now - startedAt < 800) return true;
  }

  return false;
}
