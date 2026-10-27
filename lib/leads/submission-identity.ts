import { createHash } from "node:crypto";

export function validSubmissionId(value: unknown): string | undefined {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value.toLowerCase() : undefined;
}

/** Deliberately excludes time, consent, and attribution, which can change on a network retry. */
export function submissionFingerprint(lead: {
  name: string; phone: string; email?: string; course?: string; message?: string; source_page?: string; call_time?: string; timezone?: string;
}): string {
  return createHash("sha256").update(JSON.stringify([
    lead.name, lead.phone, lead.email ?? "", lead.course ?? "", lead.message ?? "", lead.source_page ?? "", lead.call_time ?? "", lead.timezone ?? "",
  ])).digest("hex");
}
