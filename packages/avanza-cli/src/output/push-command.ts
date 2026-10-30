import { Command } from '@oclif/core';
import { AvanzaClient, AvanzaHttpError } from 'avanza-ts';

import { deleteSession, loadSession, saveSession } from '../services/session/session-store.js';

/** Streams Avanza push events as newline-delimited JSON until Ctrl-C. */
export abstract class PushCommand extends Command {
  protected async stream(
    subscribe: (client: AvanzaClient, signal: AbortSignal) => AsyncIterable<unknown>,
  ): Promise<void> {
    const session = await loadSession();
    if (session === undefined) this.signInRequired('Not signed in.');

    const client = new AvanzaClient({ session });
    const controller = new AbortController();
    const stop = (): void => controller.abort();
    process.once('SIGINT', stop);
    try {
      for await (const event of subscribe(client, controller.signal)) {
        this.log(JSON.stringify(event));
      }
    } catch (error) {
      if (error instanceof AvanzaHttpError && error.status === 401) {
        await deleteSession();
        this.signInRequired('Session expired.');
      }
      throw error;
    } finally {
      process.off('SIGINT', stop);
      if (client.session !== undefined && client.session !== session) {
        await saveSession(client.session);
      }
    }
  }

  private signInRequired(reason: string): never {
    this.logToStderr(`${reason} Run avanza auth bankid or avanza auth totp.`);
    this.exit(1);
  }
}
