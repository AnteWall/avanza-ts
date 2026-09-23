import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Etf extends ApiRequestCommand {
  public static override summary = 'Inspect an ETF';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Etf);
    await this.request(flags, (client) => client.market.etf(flags['orderbook-id']));
  }
}
