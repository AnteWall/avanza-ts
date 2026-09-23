import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Notes extends ApiRequestCommand {
  public static override summary = 'List instrument notes';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ description: 'Only notes for this orderbook' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Notes);
    await this.request(flags, (client) => client.collections.notes(flags['orderbook-id']), true);
  }
}
