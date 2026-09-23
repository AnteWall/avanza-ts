export function parseJsonArray(value: string): unknown[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Report the same input error for malformed JSON and non-arrays.
  }
  throw new TypeError('--data must be a JSON array.');
}

export function parseJsonObject(value: string, flag: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Report the same input error for malformed JSON and non-objects.
  }
  throw new Error(`${flag} must be a JSON object.`);
}
