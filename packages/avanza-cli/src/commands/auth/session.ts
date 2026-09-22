import { Command } from '@oclif/core';
import { AvanzaClient, type AvanzaSession } from 'avanza-ts';

import {
  deleteSession,
  InvalidStoredSessionError,
  loadSession,
  saveSession,
} from '../../services/session/session-store.js';

export default class Session extends Command {
  public static override summary = 'Validate and show the current authentication session';

  public async run(): Promise<void> {
    await this.parse(Session);

    let stored: AvanzaSession | undefined;
    try {
      stored = await loadSession();
    } catch (error) {
      if (!(error instanceof InvalidStoredSessionError)) throw error;
      await deleteSession();
      this.log('Stored session was invalid and has been removed.');
      return;
    }

    if (stored === undefined) {
      this.log('Not signed in.');
      return;
    }

    const client = new AvanzaClient({ session: stored });
    if (!(await client.auth.validateSession())) {
      await deleteSession();
      this.log('Session expired. Sign in again.');
      return;
    }

    if (client.session === undefined) {
      this.error('Avanza validated the session without returning session data.');
    }
    await saveSession(client.session);

    const info = await client.auth.getSessionInfo();
    this.log('Signed in');
    this.log(`Method: ${client.session.mode === 'bankid' ? 'BankID' : 'TOTP'}`);
    if (typeof info.user.greetingName === 'string' && info.user.greetingName.length > 0) {
      this.log(`User: ${info.user.greetingName}`);
    }
  }
}
