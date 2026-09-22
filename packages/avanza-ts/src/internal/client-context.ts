import type { AvanzaSession } from '../auth/session.js';
import type { HttpTransport } from './http-types.js';

export interface SessionController {
  clear(): void;
  get(): AvanzaSession | undefined;
  set(session: AvanzaSession): void;
}

export interface ClientContext {
  readonly http: HttpTransport;
  readonly session: SessionController;
}
