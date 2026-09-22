import type { AvanzaCookie, AvanzaSession } from '../auth/session.js';
import { AvanzaAuthenticationRequiredError, AvanzaHttpError } from '../errors.js';
import { CookieStore } from './cookie-store.js';
import type { HttpRequest, HttpResponse, HttpTransport, QueryValue } from './http-types.js';

const DEFAULT_BASE_URL = 'https://www.avanza.se/';

export interface HttpClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly getSession: () => AvanzaSession | undefined;
  readonly updateSession?: (session: AvanzaSession) => void;
}

export class HttpClient implements HttpTransport {
  readonly #getSession: () => AvanzaSession | undefined;
  readonly #session: HttpSession;
  readonly #updateSession: ((session: AvanzaSession) => void) | undefined;
  #loadedSession: AvanzaSession | undefined;

  public constructor(options: HttpClientOptions) {
    this.#getSession = options.getSession;
    this.#updateSession = options.updateSession;
    this.#session = new HttpSession({
      ...(options.baseUrl === undefined ? {} : { baseUrl: options.baseUrl }),
      ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
    });
  }

  public async request<Response>(request: HttpRequest): Promise<Response> {
    const session = this.#getSession();

    if (request.access === 'required' && session === undefined) {
      throw new AvanzaAuthenticationRequiredError();
    }

    if (session !== this.#loadedSession) {
      this.#session.replaceCookies(session?.mode === 'bankid' ? session.cookies : []);
      this.#loadedSession = session;
    }

    const includeCredentials = request.access !== 'anonymous' && session !== undefined;
    const response = await this.#session.requestDetailed<Response>(request, {
      captureCookies: includeCredentials && session.mode === 'bankid',
      includeCookies: includeCredentials && session.mode === 'bankid',
      ...(includeCredentials ? { session } : {}),
    });

    if (response.cookiesChanged && session?.mode === 'bankid' && includeCredentials) {
      const updatedSession: AvanzaSession = {
        ...session,
        cookies: this.#session.cookies,
      };
      this.#loadedSession = updatedSession;
      this.#updateSession?.(updatedSession);
    }

    return response.body;
  }

  public createIsolatedSession(cookies: readonly AvanzaCookie[] = []): HttpSession {
    return this.#session.fork(cookies);
  }
}

export interface HttpSessionOptions {
  readonly baseUrl?: string;
  readonly cookies?: readonly AvanzaCookie[];
  readonly fetch?: typeof globalThis.fetch;
}

export interface HttpSessionRequestOptions {
  readonly captureCookies?: boolean;
  readonly includeCookies?: boolean;
  readonly session?: AvanzaSession;
}

export interface HttpSessionResponse<Response> extends HttpResponse<Response> {
  readonly cookiesChanged: boolean;
}

export class HttpSession {
  readonly #baseUrl: URL;
  readonly #cookies: CookieStore;
  readonly #fetch: typeof globalThis.fetch;

  public constructor(options: HttpSessionOptions = {}) {
    this.#baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    this.#cookies = new CookieStore(options.cookies);
    this.#fetch = options.fetch ?? globalThis.fetch;
  }

  public get cookies(): readonly AvanzaCookie[] {
    return this.#cookies.serialize();
  }

  public fork(cookies: readonly AvanzaCookie[] = []): HttpSession {
    return new HttpSession({ baseUrl: this.#baseUrl.toString(), cookies, fetch: this.#fetch });
  }

  public replaceCookies(cookies: readonly AvanzaCookie[]): void {
    this.#cookies.replace(cookies);
  }

  public setCookie(cookie: string): void {
    this.#cookies.set(cookie, this.#baseUrl);
  }

  public async requestDetailed<Response>(
    request: HttpRequest,
    options: HttpSessionRequestOptions = {},
  ): Promise<HttpSessionResponse<Response>> {
    const url = createUrl(this.#baseUrl, request);
    const headers = createHeaders(request, options.session);

    if (options.includeCookies !== false) {
      const cookie = this.#cookies.getHeader(url);
      if (cookie.length > 0) {
        headers.set('Cookie', cookie);
      }
    }

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

    if (request.redirect !== undefined) {
      init.redirect = request.redirect;
    }

    const response = await this.#fetch(url, init);
    const cookiesChanged =
      options.captureCookies === false ? false : this.#cookies.absorb(response.headers, url);
    const body = await parseResponseBody(response);

    if (!response.ok) {
      throw new AvanzaHttpError({
        body,
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
        statusText: response.statusText,
      });
    }

    return {
      body: body as Response,
      cookiesChanged,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    };
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

  if (session?.mode === 'totp') {
    headers.set('X-AuthenticationSession', session.authenticationSession);
    headers.set('X-SecurityToken', session.securityToken);
  } else if (session?.securityToken !== undefined) {
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
