import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class EstimateHistory extends ApiRequestCommand {
  public static override summary = 'Read past analyst recommendations and price targets';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(EstimateHistory);
    await this.request(
      flags,
      (client) => client.market.estimateHistory(flags['orderbook-id']),
      true,
    );
  }
}
