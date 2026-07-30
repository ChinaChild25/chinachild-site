export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asRecord(value: unknown, context: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${context}: expected an object`);
  }
  return value;
}

export function asArray(value: unknown, context: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${context}: expected an array`);
  }
  return value;
}

export function asOptionalArray(value: unknown, context: string): unknown[] {
  if (value === undefined || value === null) return [];
  return asArray(value, context);
}

export function asString(value: unknown, context: string): string {
  if (typeof value !== "string") {
    throw new Error(`${context}: expected a string`);
  }
  return value;
}

export function asOptionalString(value: unknown, context: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return asString(value, context);
}

export function asNumber(value: unknown, context: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(parsed)) {
    throw new Error(`${context}: expected a finite number`);
  }
  return parsed;
}

export function asOptionalNumber(value: unknown, context: string): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return asNumber(value, context);
}

export function asBoolean(value: unknown, context: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${context}: expected a boolean`);
  }
  return value;
}

export function requireKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  context: string,
): void {
  const missing = keys.filter((key) => !(key in value));
  if (missing.length > 0) {
    throw new Error(`${context}: missing ${missing.join(", ")}`);
  }
}

export function parseDimensionName(value: unknown, context: string): string {
  if (typeof value === "string") return value;
  const record = asRecord(value, context);
  return asString(record.name ?? record.id, `${context}.name`);
}
