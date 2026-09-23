import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Data extends ApiRequestCommand {
  public static override summary = 'Read trading market data for an orderbook';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Data);
    await this.request(flags, (client) => client.market.marketData(flags['orderbook-id']), true);
  }
}
