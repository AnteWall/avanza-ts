import type { ClientContext } from '../internal/client-context.js';

export class InstrumentsClient {
  public constructor(protected readonly context: ClientContext) {}
}
