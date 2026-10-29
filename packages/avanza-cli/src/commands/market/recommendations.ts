import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Recommendations extends ApiRequestCommand {
  public static override summary = 'Read analyst recommendation counts and consensus';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Recommendations);
    await this.request(
      flags,
      (client) => client.market.analystRecommendations(flags['orderbook-id']),
      true,
    );
  }
}
