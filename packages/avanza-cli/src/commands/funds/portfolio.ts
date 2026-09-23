import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Portfolio extends ApiRequestCommand {
  public static override summary = 'Read fund portfolio by country, holding, and sector';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Portfolio);
    await this.request(flags, (client) => client.funds.portfolioData(flags['orderbook-id']));
  }
}
