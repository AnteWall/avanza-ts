import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class ForumPosts extends ApiRequestCommand {
  public static override summary = 'Read the latest Placera forum posts about a stock';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ForumPosts);
    await this.request(flags, (client) => client.market.forumPosts(flags['orderbook-id']));
  }
}
