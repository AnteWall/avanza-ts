export class AvanzaError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class AvanzaAuthenticationRequiredError extends AvanzaError {
  public constructor() {
    super('This request requires an authenticated Avanza session.');
  }
}

export type AvanzaAuthenticationErrorCode =
  | 'cancelled'
  | 'customer_selection'
  | 'denied'
  | 'invalid_credentials'
  | 'malformed_response'
  | 'network'
  | 'protocol'
  | 'session_unverified'
  | 'timeout'
  | 'unsupported_method';

export interface AvanzaAuthenticationErrorOptions {
  readonly code: AvanzaAuthenticationErrorCode;
  readonly upstreamStatus?: number;
}

export class AvanzaAuthenticationError extends AvanzaError {
  public readonly code: AvanzaAuthenticationErrorCode;
  public readonly upstreamStatus: number | undefined;

  public constructor(options: AvanzaAuthenticationErrorOptions) {
    const suffix = options.upstreamStatus === undefined ? '' : ` (HTTP ${options.upstreamStatus})`;
    super(`Avanza authentication failed: ${options.code}${suffix}.`);
    this.code = options.code;
    this.upstreamStatus = options.upstreamStatus;
  }
}

export interface AvanzaHttpErrorOptions {
  readonly body: unknown;
  readonly headers: Readonly<Record<string, string>>;
  readonly status: number;
  readonly statusText: string;
}

export class AvanzaHttpError extends AvanzaError {
  public readonly body: unknown;
  public readonly headers: Readonly<Record<string, string>>;
  public readonly status: number;
  public readonly statusText: string;

  public constructor(options: AvanzaHttpErrorOptions) {
    const suffix = options.statusText ? ` ${options.statusText}` : '';
    super(`Avanza request failed with status ${options.status}${suffix}.`);
    this.body = options.body;
    this.headers = options.headers;
    this.status = options.status;
    this.statusText = options.statusText;
  }
}
