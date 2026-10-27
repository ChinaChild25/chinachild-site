export type SubmissionGate = { current: boolean };

export function beginLeadSubmission(gate: SubmissionGate): boolean {
  if (gate.current) return false;
  gate.current = true;
  return true;
}

export function releaseLeadSubmission(gate: SubmissionGate): void {
  gate.current = false;
}

export function leadSubmissionIdentity(
  ref: { current: { id: string; signature: string } | null },
  lead: { name: string; phone: string; email?: string | null; course?: string; message?: string; source_page?: string; call_time?: string; timezone?: string },
): string {
  const signature = JSON.stringify([lead.name, lead.phone, lead.email, lead.course, lead.message, lead.source_page, lead.call_time, lead.timezone]);
  if (ref.current?.signature !== signature) ref.current = { id: crypto.randomUUID(), signature };
  return ref.current.id;
}
