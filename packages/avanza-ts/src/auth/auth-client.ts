import type { ClientContext } from '../internal/client-context.js';

export class AuthClient {
  public constructor(protected readonly context: ClientContext) {}
}
