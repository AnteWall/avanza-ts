import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Analysis extends ApiRequestCommand {
  public static override summary = 'Read key ratios, financials, and dividends by year and quarter';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Analysis);
    await this.request(flags, (client) => client.market.stockAnalysis(flags['orderbook-id']));
  }
}
