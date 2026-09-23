import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class News extends ApiRequestCommand {
  public static override summary = 'List news for an instrument';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(News);
    await this.request(flags, (client) => client.market.news(flags['orderbook-id']));
  }
}
