import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class BrokerTrades extends ApiRequestCommand {
  public static override summary = 'Read broker trade summaries for a stock';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(BrokerTrades);
    await this.request(flags, (client) =>
      client.market.brokerTradeSummaries(flags['orderbook-id']),
    );
  }
}
