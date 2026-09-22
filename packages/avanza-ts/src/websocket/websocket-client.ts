import type { ClientContext } from '../internal/client-context.js';

export class WebSocketClient {
  public constructor(protected readonly context: ClientContext) {}
}
