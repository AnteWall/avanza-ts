import { readFileSync } from 'node:fs';

export interface HttpFixture<ResponseBody = unknown> {
  readonly request: {
    readonly body?: unknown;
    readonly method: string;
    readonly path: string;
  };
  readonly response: {
    readonly body: ResponseBody;
    readonly status: number;
  };
}

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function loadJsonFixture<Value>(path: string): Value {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')) as Value;
}

export function loadHttpFixture<ResponseBody>(path: string): HttpFixture<ResponseBody> {
  const fixture = loadJsonFixture<unknown>(path);
  if (!isRecord(fixture) || !isRecord(fixture.request) || !isRecord(fixture.response)) {
    throw new TypeError(`Invalid HTTP fixture: ${path}`);
  }
  if (
    typeof fixture.request.method !== 'string' ||
    typeof fixture.request.path !== 'string' ||
    !('body' in fixture.response) ||
    typeof fixture.response.status !== 'number'
  ) {
    throw new TypeError(`Invalid HTTP fixture: ${path}`);
  }
  return fixture as HttpFixture<ResponseBody>;
}

export function httpFixtureResponse(
  path: string,
  options: { readonly setCookies?: readonly string[] } = {},
): Response {
  const fixture = loadHttpFixture(path);
  const headers = new Headers();
  for (const cookie of options.setCookies ?? []) headers.append('Set-Cookie', cookie);
  return jsonResponse(fixture.response.body, { headers, status: fixture.response.status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
