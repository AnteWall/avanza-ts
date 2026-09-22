import { AvanzaClient } from 'avanza-ts';

import { loadSession, saveSession } from '../services/session/session-store.js';
import { ApiCommand } from './api-output.js';
import { recordFixture } from './http-fixture.js';

export abstract class InstrumentsCommand extends ApiCommand {
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
    const recorder = recordFixture(flags.fixture);
    const client = new AvanzaClient({
      ...(session === undefined ? {} : { session }),
      fetch: recorder.fetch,
    });
    const result = await operation(client);
    if (client.session !== undefined && client.session !== session) {
      await saveSession(client.session);
    }
    await this.respond(flags, {
      fixture: recorder.latest(),
      human: () => this.log(JSON.stringify(result, null, 2) ?? 'Done.'),
      json: result,
    });
  }
}
