export function parseJsonArray(value: string): unknown[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Report the same input error for malformed JSON and non-arrays.
  }
  throw new TypeError('--data must be a JSON array.');
}
