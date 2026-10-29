import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class ForumStats extends ApiRequestCommand {
  public static override summary = 'Read Placera forum activity and how members trade a stock';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ForumStats);
    await this.request(flags, (client) => client.market.forumStats(flags['orderbook-id']));
  }
}
