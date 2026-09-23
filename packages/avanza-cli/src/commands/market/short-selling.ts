import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class ShortSelling extends ApiRequestCommand {
  public static override summary = 'Read short-selling history for a stock';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ShortSelling);
    await this.request(flags, (client) => client.market.shortSelling(flags['orderbook-id']));
  }
}
