import type { BankIdSession } from './session.js';

interface TotpLoginBase {
  readonly maxInactiveMinutes?: number;
  readonly password: string;
  readonly retryWithNextCode?: boolean;
  readonly signal?: AbortSignal;
  readonly username: string;
}

export interface TotpCodeLoginOptions extends TotpLoginBase {
  readonly totpCode: string;
  readonly totpSecret?: never;
}

export interface TotpSecretLoginOptions extends TotpLoginBase {
  readonly totpCode?: never;
  readonly totpSecret: string;
}

export type TotpLoginOptions = TotpCodeLoginOptions | TotpSecretLoginOptions;

export interface StartBankIdOptions {
  readonly signal?: AbortSignal;
}

export interface SessionInfoResponse {
  readonly invalidSessionId: string;
  readonly isContextVerifiedWithBackend?: boolean;
  readonly user: {
    readonly company: boolean;
    readonly customerGroup: string;
    readonly greetingName: string;
    readonly id: string;
    readonly loggedIn: boolean;
    readonly minor: boolean;
    readonly pushBaseUrl: string;
    readonly pushSubscriptionId: string;
    readonly securityToken: string;
    readonly start: boolean;
  };
}

export interface BankIdChallenge {
  readonly autostartToken: string;
  readonly autostartUrl: string;
  readonly qrPayload: string;
  readonly refreshAfterMs: number;
}

export type BankIdPollResult =
  | { readonly challenge: BankIdChallenge; readonly status: 'pending' }
  | { readonly session: BankIdSession; readonly status: 'complete' }
  | { readonly status: 'denied' }
  | { readonly status: 'expired' };
