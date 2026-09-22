import type { ClientContext } from '../internal/client-context.js';

export class OrdersClient {
  public constructor(protected readonly context: ClientContext) {}
}
