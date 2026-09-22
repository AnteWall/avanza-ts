import type { ClientContext } from '../internal/client-context.js';

export class MarketClient {
  public constructor(protected readonly context: ClientContext) {}
}
