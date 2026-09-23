import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class PopularStatistics extends ApiRequestCommand {
  public static override summary = 'Read popular position statistics for an orderbook';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(PopularStatistics);
    await this.request(
      flags,
      (client) => client.positions.popularCategories(flags['orderbook-id']),
      true,
    );
  }
}
