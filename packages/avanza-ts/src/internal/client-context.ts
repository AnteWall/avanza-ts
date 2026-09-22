import type { AvanzaCookie, AvanzaSession } from '../auth/session.js';
import type { HttpSession } from './http-client.js';
import type { HttpTransport } from './http-types.js';

export interface SessionController {
  clear(): void;
  get(): AvanzaSession | undefined;
  set(session: AvanzaSession): void;
}

export interface ClientContext {
  createHttpSession(cookies?: readonly AvanzaCookie[]): HttpSession;
  readonly http: HttpTransport;
  readonly session: SessionController;
}
