import { Command } from '@oclif/core';
import { AvanzaClient, type AvanzaSession } from 'avanza-ts';

import {
  deleteSession,
  InvalidStoredSessionError,
  loadSession,
} from '../../services/session/session-store.js';

export default class Logout extends Command {
  public static override summary = 'Sign out and remove the stored session';

  public async run(): Promise<void> {
    await this.parse(Logout);

    let stored: AvanzaSession | undefined;
    try {
      stored = await loadSession();
    } catch (error) {
      if (!(error instanceof InvalidStoredSessionError)) throw error;
      await deleteSession();
      this.log('Invalid local session removed.');
      return;
    }

    if (stored === undefined) {
      this.log('Already signed out.');
      return;
    }

    const client = new AvanzaClient({ session: stored });
    let remoteFailure = false;
    try {
      await client.auth.logout();
    } catch {
      remoteFailure = true;
    } finally {
      await deleteSession();
    }

    if (remoteFailure) {
      this.error('Local session removed, but the Avanza logout request failed.');
    }
    this.log('Signed out.');
  }
}
