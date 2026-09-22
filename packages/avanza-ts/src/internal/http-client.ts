import type { AvanzaSession } from '../auth/session.js';
import { AvanzaAuthenticationRequiredError, AvanzaHttpError } from '../errors.js';
import type { HttpRequest, HttpTransport, QueryValue } from './http-types.js';

const DEFAULT_BASE_URL = 'https://www.avanza.se/';

export interface HttpClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly getSession: () => AvanzaSession | undefined;
}

export class HttpClient implements HttpTransport {
  readonly #baseUrl: URL;
  readonly #fetch: typeof globalThis.fetch;
  readonly #getSession: () => AvanzaSession | undefined;

  public constructor(options: HttpClientOptions) {
    this.#baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#getSession = options.getSession;
  }

  public async request<Response>(request: HttpRequest): Promise<Response> {
    const session = this.#getSession();

    if (request.access === 'required' && session === undefined) {
      throw new AvanzaAuthenticationRequiredError();
    }

    const headers = createHeaders(request, session);
    const init: RequestInit = {
      headers,
      method: request.method,
    };

    if (request.body !== undefined) {
      const body = JSON.stringify(request.body);

      if (body === undefined) {
        throw new TypeError('Request body must be JSON serializable.');
      }

      init.body = body;
    }

    if (request.signal !== undefined) {
      init.signal = request.signal;
    }

    const response = await this.#fetch(createUrl(this.#baseUrl, request), init);
    const body = await parseResponseBody(response);

    if (!response.ok) {
      throw new AvanzaHttpError({
        body,
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
        statusText: response.statusText,
      });
    }

    return body as Response;
  }
}

function normalizeBaseUrl(value: string): URL {
  return new URL(value.endsWith('/') ? value : `${value}/`);
}

function createUrl(baseUrl: URL, request: HttpRequest): URL {
  const url = new URL(request.path.replace(/^\/+/, ''), baseUrl);

  for (const [key, value] of Object.entries(request.query ?? {})) {
    appendQueryValue(url.searchParams, key, value);
  }

  return url;
}

function appendQueryValue(searchParams: URLSearchParams, key: string, value: QueryValue): void {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      searchParams.append(key, String(item));
    }

    return;
  }

  searchParams.append(key, String(value));
}

function createHeaders(request: HttpRequest, session: AvanzaSession | undefined): Headers {
  const headers = new Headers(request.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (request.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (session !== undefined) {
    headers.set('X-AuthenticationSession', session.authenticationSession);
    headers.set('X-SecurityToken', session.securityToken);
  }

  return headers;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const text = await response.text();

  if (text.length === 0) {
    return undefined;
  }

  if (response.headers.get('Content-Type')?.includes('json') === true) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  return text;
}
