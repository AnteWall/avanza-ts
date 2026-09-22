import { AvanzaAuthenticationError, AvanzaHttpError } from '../errors.js';

export function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AvanzaAuthenticationError({ code: 'malformed_response' });
  }

  return value as Record<string, unknown>;
}

export function optionalString(
  value: Record<string, unknown>,
  key: string,
  maximumLength = 4096,
): string | undefined {
  const field = value[key];

  if (field === undefined || field === null) {
    return undefined;
  }
  if (typeof field !== 'string' || field.length === 0 || field.length > maximumLength) {
    throw new AvanzaAuthenticationError({ code: 'malformed_response' });
  }

  return field;
}

export function requiredString(
  value: Record<string, unknown>,
  key: string,
  maximumLength = 4096,
): string {
  const field = optionalString(value, key, maximumLength);

  if (field === undefined) {
    throw new AvanzaAuthenticationError({ code: 'malformed_response' });
  }

  return field;
}

export function toAuthenticationError(
  error: unknown,
  options: { readonly invalidCredentials?: boolean } = {},
): AvanzaAuthenticationError {
  if (error instanceof AvanzaAuthenticationError) {
    return error;
  }
  if (error instanceof AvanzaHttpError) {
    let code: 'invalid_credentials' | 'network' | 'protocol' | 'timeout' = 'protocol';

    if (options.invalidCredentials === true && (error.status === 401 || error.status === 403)) {
      code = 'invalid_credentials';
    } else if (error.status === 408) {
      code = 'timeout';
    } else if (error.status === 429 || error.status >= 500) {
      code = 'network';
    }

    return new AvanzaAuthenticationError({ code, upstreamStatus: error.status });
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return new AvanzaAuthenticationError({ code: 'cancelled' });
  }
  if (error instanceof Error && error.name === 'TimeoutError') {
    return new AvanzaAuthenticationError({ code: 'timeout' });
  }

  return new AvanzaAuthenticationError({ code: 'network' });
}
