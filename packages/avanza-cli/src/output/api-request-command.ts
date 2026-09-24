import { AvanzaClient, AvanzaHttpError } from 'avanza-ts';

import { deleteSession, loadSession, saveSession } from '../services/session/session-store.js';
import { ApiCommand } from './api-output.js';
import { recordFixture } from './http-fixture.js';

export abstract class ApiRequestCommand extends ApiCommand {
  protected async request(
    flags: {
      fields: string | undefined;
      fixture: boolean;
      json: boolean | undefined;
      output: string | undefined;
    },
    operation: (client: AvanzaClient) => Promise<unknown>,
    authenticated = false,
  ): Promise<void> {
    const session = authenticated ? await loadSession() : undefined;
    if (authenticated && session === undefined) {
      this.signInRequired('Not signed in.');
    }
    const recorder = recordFixture(flags.fixture);
    const client = new AvanzaClient({
      ...(session === undefined ? {} : { session }),
      fetch: recorder.fetch,
    });
    let result: unknown;
    try {
      result = await operation(client);
    } catch (error) {
      if (authenticated && error instanceof AvanzaHttpError && error.status === 401) {
        await deleteSession();
        this.signInRequired('Session expired.');
      }
      throw error;
    }
    if (client.session !== undefined && client.session !== session) {
      await saveSession(client.session);
    }
    await this.respond(flags, {
      fixture: recorder.latest(),
      human: () => this.log(JSON.stringify(result, null, 2) ?? 'Done.'),
      json: result,
    });
  }

  private signInRequired(reason: string): never {
    this.logToStderr(`${reason} Run avanza auth bankid or avanza auth totp.`);
    this.exit(1);
  }
}
