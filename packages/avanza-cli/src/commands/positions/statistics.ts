import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Statistics extends ApiRequestCommand {
  public static override summary = 'Read position statistics for an orderbook';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Statistics);
    await this.request(flags, (client) => client.positions.categories(flags['orderbook-id']), true);
  }
}
