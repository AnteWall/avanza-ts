import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Orderbook extends ApiRequestCommand {
  public static override summary = 'Read fund trading terms and NAV';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Orderbook);
    await this.request(flags, (client) => client.funds.orderbook(flags['orderbook-id']));
  }
}
