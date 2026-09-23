import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class OrderDepth extends ApiRequestCommand {
  public static override summary = 'Read stock order depth';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(OrderDepth);
    await this.request(flags, (client) => client.market.orderDepth(flags['orderbook-id']));
  }
}
