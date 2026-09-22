import { AvanzaAuthenticationError, AvanzaHttpError } from '../errors.js';
import type { ClientContext } from '../internal/client-context.js';
import type { HttpSession } from '../internal/http-client.js';
import { asObject, optionalString, requiredString, toAuthenticationError } from './auth-helpers.js';
import type { StartBankIdOptions, TotpLoginOptions } from './auth-types.js';
import { BankIdAuthAttempt, parseSessionInfo } from './bankid-auth-attempt.js';
import type { AvanzaCookie, AvanzaSession, TotpSession } from './session.js';
import { generateTotpCode } from './totp.js';

const USER_CREDENTIALS_PATH = '/_api/authentication/sessions/usercredentials';
const TOTP_PATH = '/_api/authentication/sessions/totp';
const SESSION_INFO_PATH = '/_api/authentication/session/info/session';
const LOGOUT_PATH = '/_api/authentication/sessions/webtoken';
const MIN_INACTIVE_MINUTES = 30;
const MAX_INACTIVE_MINUTES = 24 * 60;
const TOTP_PERIOD_MS = 30_000;

export class AuthClient {
  public constructor(protected readonly context: ClientContext) {}

  public startBankId(options: StartBankIdOptions = {}): Promise<BankIdAuthAttempt> {
    return BankIdAuthAttempt.start(this.context, options);
  }

  public async validateSession(signal?: AbortSignal): Promise<boolean> {
    const session = this.context.session.get();
    if (session === undefined) {
      return false;
    }

    try {
      const http = this.context.createHttpSession(session.mode === 'bankid' ? session.cookies : []);
      const response = await http.requestDetailed<unknown>(
        {
          access: 'anonymous',
          method: 'GET',
          path: SESSION_INFO_PATH,
          redirect: 'error',
          ...(signal === undefined ? {} : { signal }),
        },
        { includeCookies: session.mode === 'bankid', session },
      );
      const info = parseSessionInfo(response.body);

      if (!info.verified) {
        this.context.session.clear();
        return false;
      }

      const updated = updateValidatedSession(session, http.cookies, info.securityToken);
      this.context.session.set(updated);
      return true;
    } catch (error) {
      if (isAborted(signal)) {
        throw new AvanzaAuthenticationError({ code: 'cancelled' });
      }
      if (error instanceof AvanzaHttpError && (error.status === 401 || error.status === 403)) {
        this.context.session.clear();
        return false;
      }

      throw toAuthenticationError(error);
    }
  }

  public async logout(signal?: AbortSignal): Promise<void> {
    const session = this.context.session.get();
    if (session === undefined) {
      return;
    }

    let failure: unknown;

    try {
      const http = this.context.createHttpSession(session.mode === 'bankid' ? session.cookies : []);
      await http.requestDetailed<unknown>(
        {
          access: 'anonymous',
          method: 'DELETE',
          path: LOGOUT_PATH,
          redirect: 'error',
          ...(signal === undefined ? {} : { signal }),
        },
        { includeCookies: session.mode === 'bankid', session },
      );
    } catch (error) {
      if (!(error instanceof AvanzaHttpError) || error.status !== 401) {
        failure = error;
      }
    } finally {
      this.context.session.clear();
    }

    if (failure !== undefined) {
      if (isAborted(signal)) {
        throw new AvanzaAuthenticationError({ code: 'cancelled' });
      }
      throw toAuthenticationError(failure);
    }
  }

  public async loginWithTotp(options: TotpLoginOptions): Promise<TotpSession> {
    validateTotpOptions(options);

    try {
      return await this.loginWithTotpOnce(options);
    } catch (error) {
      if (isAborted(options.signal)) {
        throw new AvanzaAuthenticationError({ code: 'cancelled' });
      }
      if (
        options.totpSecret === undefined ||
        options.retryWithNextCode !== true ||
        !(error instanceof AvanzaHttpError) ||
        error.status !== 401
      ) {
        throw toAuthenticationError(error, { invalidCredentials: true });
      }

      try {
        await waitForNextTotpWindow(options.signal);
      } catch (waitError) {
        if (isAborted(options.signal)) {
          throw new AvanzaAuthenticationError({ code: 'cancelled' });
        }
        throw toAuthenticationError(waitError);
      }

      try {
        return await this.loginWithTotpOnce(options);
      } catch (retryError) {
        if (isAborted(options.signal)) {
          throw new AvanzaAuthenticationError({ code: 'cancelled' });
        }
        throw toAuthenticationError(retryError, { invalidCredentials: true });
      }
    }
  }

  private async loginWithTotpOnce(options: TotpLoginOptions): Promise<TotpSession> {
    const http = this.context.createHttpSession();
    const initial = await http.requestDetailed<unknown>({
      access: 'anonymous',
      body: {
        maxInactiveMinutes: options.maxInactiveMinutes ?? MAX_INACTIVE_MINUTES,
        password: options.password,
        username: options.username,
      },
      method: 'POST',
      path: USER_CREDENTIALS_PATH,
      redirect: 'error',
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
    const initialBody = asObject(initial.body);
    const secondFactor = initialBody.twoFactorLogin;

    if (secondFactor === undefined || secondFactor === null) {
      const login = asObject(initialBody.successfulLogin);
      return this.installTotpSession(login, initial.headers);
    }

    const secondFactorBody = asObject(secondFactor);
    if (requiredString(secondFactorBody, 'method', 64) !== 'TOTP') {
      throw new AvanzaAuthenticationError({ code: 'unsupported_method' });
    }

    const transactionId = requiredString(secondFactorBody, 'transactionId', 512);
    if (/[,;\r\n]/.test(transactionId)) {
      throw new AvanzaAuthenticationError({ code: 'malformed_response' });
    }
    http.setCookie(`AZAMFATRANSACTION=${transactionId}; Path=/; Secure; HttpOnly`);

    const code =
      options.totpSecret === undefined ? options.totpCode : generateTotpCode(options.totpSecret);
    const completed = await this.completeTotp(http, code, options.signal);
    return this.installTotpSession(asObject(completed.body), completed.headers);
  }

  private async completeTotp(http: HttpSession, code: string, signal?: AbortSignal) {
    return http.requestDetailed<unknown>({
      access: 'anonymous',
      body: { method: 'TOTP', totpCode: code },
      method: 'POST',
      path: TOTP_PATH,
      redirect: 'error',
      ...(signal === undefined ? {} : { signal }),
    });
  }

  private installTotpSession(login: Record<string, unknown>, headers: Headers): TotpSession {
    const securityToken = headers.get('X-SecurityToken');
    if (securityToken === null || securityToken.length === 0 || securityToken.length > 4096) {
      throw new AvanzaAuthenticationError({ code: 'malformed_response' });
    }

    const customerId = optionalString(login, 'customerId', 256);
    const pushSubscriptionId = optionalString(login, 'pushSubscriptionId', 512);
    const session: TotpSession = {
      authenticationSession: requiredString(login, 'authenticationSession', 4096),
      ...(customerId === undefined ? {} : { customerId }),
      mode: 'totp',
      ...(pushSubscriptionId === undefined ? {} : { pushSubscriptionId }),
      securityToken,
    };
    this.context.session.set(session);
    return session;
  }
}

function validateTotpOptions(options: TotpLoginOptions): void {
  if (options.username.length === 0 || options.password.length === 0) {
    throw new TypeError('TOTP login requires a username and password.');
  }
  if (options.totpCode !== undefined && !/^\d{6}$/.test(options.totpCode)) {
    throw new TypeError('TOTP code must contain exactly six digits.');
  }
  if (options.totpSecret !== undefined) {
    generateTotpCode(options.totpSecret);
  }

  const maxInactiveMinutes = options.maxInactiveMinutes ?? MAX_INACTIVE_MINUTES;
  if (
    !Number.isInteger(maxInactiveMinutes) ||
    maxInactiveMinutes < MIN_INACTIVE_MINUTES ||
    maxInactiveMinutes > MAX_INACTIVE_MINUTES
  ) {
    throw new TypeError(
      `Session timeout must be between ${MIN_INACTIVE_MINUTES} and ${MAX_INACTIVE_MINUTES} minutes.`,
    );
  }
}

function updateValidatedSession(
  session: AvanzaSession,
  cookies: readonly AvanzaCookie[],
  securityToken: string | undefined,
): AvanzaSession {
  if (session.mode === 'totp') {
    return securityToken === undefined ? session : { ...session, securityToken };
  }

  const { securityToken: _previousSecurityToken, ...sessionWithoutToken } = session;
  return {
    ...sessionWithoutToken,
    cookies,
    ...(securityToken === undefined ? {} : { securityToken }),
  };
}

async function waitForNextTotpWindow(signal?: AbortSignal): Promise<void> {
  const delay = TOTP_PERIOD_MS - (Date.now() % TOTP_PERIOD_MS);

  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(resolve, delay);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

function isAborted(signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true;
}
