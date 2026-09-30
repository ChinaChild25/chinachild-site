export type PersistedLeadResponse = {
  ok: true;
  accepted: true;
  persisted: true;
  id: string;
  /** Optional post-submit messenger links; validate with parseApplicationMessengerLinks. */
  messengers?: unknown;
};

export function isPersistedLeadResponse(
  value: unknown,
): value is PersistedLeadResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const response = value as Record<string, unknown>;
  return (
    response.ok === true &&
    response.accepted === true &&
    response.persisted === true &&
    typeof response.id === "string" &&
    response.id.trim().length > 0
  );
}
