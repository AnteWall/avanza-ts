import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class PriceTargets extends ApiRequestCommand {
  public static override summary = 'Read analyst price targets';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(PriceTargets);
    await this.request(flags, (client) => client.market.priceTargets(flags['orderbook-id']), true);
  }
}
