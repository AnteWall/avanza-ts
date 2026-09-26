export interface AvanzaCookie {
  readonly creation?: string;
  readonly domain?: string;
  readonly expires?: string;
  readonly extensions?: readonly string[];
  readonly hostOnly?: boolean;
  readonly httpOnly?: boolean;
  readonly key: string;
  readonly lastAccessed?: string;
  readonly maxAge?: number | string;
  readonly path?: string;
  readonly pathIsDefault?: boolean;
  readonly sameSite?: string;
  readonly secure?: boolean;
  readonly value: string;
}

export interface TotpSession {
  readonly mode: 'totp';
  readonly authenticationSession: string;
  readonly securityToken: string;
  readonly cookies?: readonly AvanzaCookie[];
  readonly pushSubscriptionId?: string;
  readonly customerId?: string;
}

export interface BankIdSession {
  readonly mode: 'bankid';
  readonly cookies: readonly AvanzaCookie[];
  readonly securityToken?: string;
  readonly customerId?: string;
}

export type AvanzaSession = BankIdSession | TotpSession;
