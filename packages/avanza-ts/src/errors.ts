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
