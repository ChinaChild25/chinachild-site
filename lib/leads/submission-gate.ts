export type SubmissionGate = { current: boolean };

export function beginLeadSubmission(gate: SubmissionGate): boolean {
  if (gate.current) return false;
  gate.current = true;
  return true;
}

export function releaseLeadSubmission(gate: SubmissionGate): void {
  gate.current = false;
}
