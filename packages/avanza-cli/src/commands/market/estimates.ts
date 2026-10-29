import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Estimates extends ApiRequestCommand {
  public static override summary =
    'Read key ratios, financials, and dividends with analyst estimates';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Estimates);
    await this.request(
      flags,
      (client) => client.market.stockEstimates(flags['orderbook-id']),
      true,
    );
  }
}
