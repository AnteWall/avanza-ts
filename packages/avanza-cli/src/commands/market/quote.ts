import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Quote extends ApiRequestCommand {
  public static override summary = 'Read the latest stock quote';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Quote);
    await this.request(flags, (client) => client.market.quote(flags['orderbook-id']));
  }
}
