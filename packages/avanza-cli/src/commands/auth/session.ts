import { AvanzaClient, type AvanzaSession } from 'avanza-ts';

import { ApiCommand } from '../../output/api-output.js';
import { recordFixture } from '../../output/http-fixture.js';
import {
  deleteSession,
  InvalidStoredSessionError,
  loadSession,
  saveSession,
} from '../../services/session/session-store.js';

export default class Session extends ApiCommand {
  public static override summary = 'Validate and show the current authentication session';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Session);

    let stored: AvanzaSession | undefined;
    try {
      stored = await loadSession();
    } catch (error) {
      if (!(error instanceof InvalidStoredSessionError)) throw error;
      await deleteSession();
      return this.respond(flags, {
        human: () => this.log('Stored session was invalid and has been removed.'),
        json: { status: 'invalid_session' },
      });
    }

    if (stored === undefined) {
      return this.respond(flags, {
        human: () => this.log('Not signed in.'),
        json: { status: 'not_signed_in' },
      });
    }

    const recorder = recordFixture(flags.fixture);
    const client = new AvanzaClient({ session: stored, fetch: recorder.fetch });
    if (!(await client.auth.validateSession())) {
      await deleteSession();
      return this.respond(flags, {
        human: () => this.log('Session expired. Sign in again.'),
        json: { status: 'expired_session' },
      });
    }

    const session = client.session;
    if (session === undefined) {
      this.error('Avanza validated the session without returning session data.');
    }
    await saveSession(session);

    const info = await client.auth.getSessionInfo();
    return this.respond(flags, {
      fixture: recorder.latest(),
      human: () => {
        this.log('Signed in');
        this.log(`Method: ${session.mode === 'bankid' ? 'BankID' : 'TOTP'}`);
        if (typeof info.user.greetingName === 'string' && info.user.greetingName.length > 0) {
          this.log(`User: ${info.user.greetingName}`);
        }
      },
      json: info,
      redactions: [['user', 'securityToken']],
    });
  }
}
