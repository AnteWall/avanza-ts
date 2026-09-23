import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Trades extends ApiRequestCommand {
  public static override summary = 'Read the latest stock trades';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Trades);
    await this.request(flags, (client) => client.market.trades(flags['orderbook-id']));
  }
}
