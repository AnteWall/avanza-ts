import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Marketplace extends ApiRequestCommand {
  public static override summary = 'Read opening hours and status for the stock market';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Marketplace);
    await this.request(flags, (client) => client.market.marketplace(flags['orderbook-id']));
  }
}
