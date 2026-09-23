import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class IsFavourite extends ApiRequestCommand {
  public static override summary = 'Check whether a fund is saved as a favourite';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(IsFavourite);
    await this.request(flags, (client) => client.funds.isFavourite(flags['orderbook-id']), true);
  }
}
