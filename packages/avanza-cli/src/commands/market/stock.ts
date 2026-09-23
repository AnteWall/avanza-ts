import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Stock extends ApiRequestCommand {
  public static override summary = 'Read stock details, key indicators, and quote';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Stock);
    await this.request(flags, (client) => client.market.stock(flags['orderbook-id']));
  }
}
