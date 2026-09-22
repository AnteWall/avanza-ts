import { AvanzaAuthenticationError, AvanzaHttpError } from '../errors.js';
import type { ClientContext } from '../internal/client-context.js';
import type { HttpSession, HttpSessionResponse } from '../internal/http-client.js';
import type { HttpRequest } from '../internal/http-types.js';
import { asObject, optionalString, requiredString, toAuthenticationError } from './auth-helpers.js';
import type { BankIdChallenge, BankIdPollResult, StartBankIdOptions } from './auth-types.js';
import type { BankIdSession } from './session.js';

const START_PATH = '/_api/authentication/v2/sessions/bankid';
const RESTART_PATH = `${START_PATH}/restart`;
const COLLECT_PATH = `${START_PATH}/collect`;
const CANCEL_PATH = `${START_PATH}/cancel`;
const SESSION_INFO_PATH = '/_api/authentication/session/info/session';
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;
const DEFAULT_ATTEMPT_TIMEOUT_MS = 120_000;
const REFRESH_AFTER_MS = 1_500;

export interface SessionInfo {
  readonly securityToken?: string;
  readonly userId?: string;
  readonly verified: boolean;
}

export class BankIdAuthAttempt {
  readonly #context: ClientContext;
  readonly #deadline: number;
  readonly #http: HttpSession;
  readonly #signal: AbortSignal | undefined;
  readonly #transactionId: string;
  #cancelled = false;
  #challenge: BankIdChallenge;
  #polling = false;
  #terminal = false;

  private constructor(options: {
    challenge: BankIdChallenge;
    context: ClientContext;
    deadline: number;
    http: HttpSession;
    signal: AbortSignal | undefined;
    transactionId: string;
  }) {
    this.#challenge = options.challenge;
    this.#context = options.context;
    this.#deadline = options.deadline;
    this.#http = options.http;
    this.#signal = options.signal;
    this.#transactionId = options.transactionId;
  }

  public get challenge(): BankIdChallenge {
    return this.#challenge;
  }

  public static async start(
    context: ClientContext,
    options: StartBankIdOptions = {},
  ): Promise<BankIdAuthAttempt> {
    const http = context.createHttpSession();
    const deadline = Date.now() + DEFAULT_ATTEMPT_TIMEOUT_MS;

    try {
      const response = await requestWithDeadline<unknown>(
        http,
        {
          access: 'anonymous',
          body: { method: 'QR_START', returnScheme: 'NOP' },
          method: 'POST',
          path: START_PATH,
          redirect: 'error',
        },
        deadline,
        DEFAULT_REQUEST_TIMEOUT_MS,
        options.signal,
      );
      const body = asObject(response.body);
      const autostartToken = optionalString(body, 'autostartToken', 4096);
      const qrPayload = requiredString(body, 'qrToken', 4096);
      const transactionId = requiredString(body, 'transactionId', 512);
      const challenge = createChallenge(autostartToken, qrPayload);

      return new BankIdAuthAttempt({
        challenge,
        context,
        deadline,
        http,
        signal: options.signal,
        transactionId,
      });
    } catch (error) {
      throw toBankIdError(error);
    }
  }

  public async poll(): Promise<BankIdPollResult> {
    this.ensureActive();
    if (this.#polling) {
      throw new AvanzaAuthenticationError({ code: 'protocol' });
    }

    this.#polling = true;
    try {
      const collected = await this.request<unknown>({
        access: 'anonymous',
        body: {},
        method: 'POST',
        path: COLLECT_PATH,
        redirect: 'error',
      });
      const body = asObject(collected.body);
      const state = requiredString(body, 'state', 64);

      if (state === 'USER_CANCEL' || state === 'CANCELLED' || state === 'CANCELED') {
        this.#terminal = true;
        return { status: 'denied' };
      }
      if (state === 'EXPIRED_TRANSACTION') {
        this.#terminal = true;
        return { status: 'expired' };
      }
      if (state === 'COMPLETE') {
        const session = await this.complete(body);
        this.#terminal = true;
        this.#context.session.set(session);
        return { session, status: 'complete' };
      }
      if (state !== 'OUTSTANDING_TRANSACTION' && state !== 'PENDING') {
        throw new AvanzaAuthenticationError({ code: 'malformed_response' });
      }

      const restarted = await this.request<unknown>({
        access: 'anonymous',
        body: {},
        method: 'POST',
        path: RESTART_PATH,
        redirect: 'error',
      });
      const qrPayload = requiredString(asObject(restarted.body), 'qrToken', 4096);
      this.#challenge = createChallenge(this.#challenge.autostartToken, qrPayload);
      return { challenge: this.#challenge, status: 'pending' };
    } catch (error) {
      throw toBankIdError(error);
    } finally {
      this.#polling = false;
    }
  }

  public async cancel(): Promise<void> {
    if (this.#cancelled || this.#terminal) {
      return;
    }

    this.#cancelled = true;
    try {
      await requestWithDeadline<unknown>(
        this.#http,
        {
          access: 'anonymous',
          body: { transactionId: this.#transactionId },
          method: 'POST',
          path: CANCEL_PATH,
          redirect: 'error',
        },
        Date.now() + DEFAULT_REQUEST_TIMEOUT_MS,
        DEFAULT_REQUEST_TIMEOUT_MS,
        undefined,
      );
    } catch (error) {
      if (!(error instanceof AvanzaHttpError) || error.status !== 404) {
        throw toBankIdError(error);
      }
    } finally {
      this.#http.replaceCookies([]);
    }
  }

  private ensureActive(): void {
    if (this.#cancelled) {
      throw new AvanzaAuthenticationError({ code: 'cancelled' });
    }
    if (this.#terminal) {
      throw new AvanzaAuthenticationError({ code: 'protocol' });
    }
    if (Date.now() >= this.#deadline) {
      throw new AvanzaAuthenticationError({ code: 'timeout' });
    }
  }

  private async request<Response>(request: HttpRequest): Promise<HttpSessionResponse<Response>> {
    this.ensureActive();
    const response = await requestWithDeadline<Response>(
      this.#http,
      request,
      this.#deadline,
      DEFAULT_REQUEST_TIMEOUT_MS,
      this.#signal,
    );
    this.ensureActive();
    return response;
  }

  private async complete(collectBody: Record<string, unknown>): Promise<BankIdSession> {
    let info = await this.getSessionInfo();
    let customerId: string | undefined;

    if (!info.verified) {
      customerId = singleCustomerId(collectBody);
      await this.request<unknown>({
        access: 'anonymous',
        method: 'GET',
        path: `${COLLECT_PATH}/${encodeURIComponent(customerId)}`,
        redirect: 'error',
      });
      info = await this.getSessionInfo();
    }

    if (!info.verified) {
      throw new AvanzaAuthenticationError({ code: 'session_unverified' });
    }

    const cookies = this.#http.cookies;
    if (cookies.length === 0) {
      throw new AvanzaAuthenticationError({ code: 'session_unverified' });
    }

    return {
      cookies,
      ...(customerId === undefined ? {} : { customerId }),
      mode: 'bankid',
      ...(info.securityToken === undefined ? {} : { securityToken: info.securityToken }),
    };
  }

  private async getSessionInfo(): Promise<SessionInfo> {
    const response = await this.request<unknown>({
      access: 'anonymous',
      method: 'GET',
      path: SESSION_INFO_PATH,
      redirect: 'error',
    });
    return parseSessionInfo(response.body);
  }
}

function createChallenge(autostartToken: string | undefined, qrPayload: string): BankIdChallenge {
  return {
    ...(autostartToken === undefined
      ? {}
      : {
          autostartToken,
          autostartUrl: `bankid:///?autostarttoken=${encodeURIComponent(autostartToken)}&redirect=null`,
        }),
    qrPayload,
    refreshAfterMs: REFRESH_AFTER_MS,
  };
}

function parseSessionInfo(value: unknown): SessionInfo {
  const body = asObject(value);
  const user = asObject(body.user);
  const loggedIn = user.loggedIn;
  const backendVerified = body.isContextVerifiedWithBackend;

  if (
    typeof loggedIn !== 'boolean' ||
    (backendVerified !== undefined && typeof backendVerified !== 'boolean')
  ) {
    throw new AvanzaAuthenticationError({ code: 'malformed_response' });
  }
  if (!loggedIn || backendVerified === false) {
    return { verified: false };
  }

  const rawUserId = user.id;
  if (
    typeof rawUserId === 'boolean' ||
    (typeof rawUserId !== 'string' && typeof rawUserId !== 'number')
  ) {
    throw new AvanzaAuthenticationError({ code: 'malformed_response' });
  }
  const userId = String(rawUserId);
  if (userId.length === 0 || userId.length > 256) {
    throw new AvanzaAuthenticationError({ code: 'malformed_response' });
  }

  const rawToken = user.securityToken;
  if (rawToken === undefined || rawToken === null || rawToken === '-') {
    return { userId, verified: true };
  }
  if (typeof rawToken !== 'string' || rawToken.length === 0 || rawToken.length > 4096) {
    throw new AvanzaAuthenticationError({ code: 'malformed_response' });
  }

  return { securityToken: rawToken, userId, verified: true };
}

function singleCustomerId(body: Record<string, unknown>): string {
  if (!Array.isArray(body.logins)) {
    throw new AvanzaAuthenticationError({ code: 'customer_selection' });
  }

  const customerIds = body.logins.map((login) =>
    requiredString(asObject(login), 'customerId', 256),
  );
  if (customerIds.length !== 1) {
    throw new AvanzaAuthenticationError({ code: 'customer_selection' });
  }

  return customerIds[0]!;
}

async function requestWithDeadline<Response>(
  http: HttpSession,
  request: HttpRequest,
  deadline: number,
  requestTimeoutMs: number,
  externalSignal: AbortSignal | undefined,
): Promise<HttpSessionResponse<Response>> {
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    throw new AvanzaAuthenticationError({ code: 'timeout' });
  }

  const timeoutSignal = AbortSignal.timeout(Math.min(remaining, requestTimeoutMs));
  const signal =
    externalSignal === undefined ? timeoutSignal : AbortSignal.any([externalSignal, timeoutSignal]);

  try {
    return await http.requestDetailed<Response>({ ...request, signal });
  } catch (error) {
    if (externalSignal?.aborted === true) {
      throw new AvanzaAuthenticationError({ code: 'cancelled' });
    }
    if (timeoutSignal.aborted) {
      throw new AvanzaAuthenticationError({ code: 'timeout' });
    }
    throw error;
  }
}

function toBankIdError(error: unknown): AvanzaAuthenticationError {
  if (error instanceof AvanzaHttpError) {
    const body =
      typeof error.body === 'object' && error.body !== null
        ? (error.body as Record<string, unknown>)
        : undefined;
    const values = ['state', 'error', 'errorCode', 'code']
      .map((key) => body?.[key])
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.toUpperCase());

    if (values.some((value) => ['USER_CANCEL', 'CANCELLED', 'CANCELED'].includes(value))) {
      return new AvanzaAuthenticationError({ code: 'denied', upstreamStatus: error.status });
    }
    if (values.includes('EXPIRED_TRANSACTION')) {
      return new AvanzaAuthenticationError({ code: 'timeout', upstreamStatus: error.status });
    }
  }

  return toAuthenticationError(error);
}

export { parseSessionInfo };
