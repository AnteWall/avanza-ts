import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Orderbook extends ApiRequestCommand {
  public static override summary = 'Read trading rules for an orderbook';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Orderbook);
    await this.request(flags, (client) => client.orders.orderbook(flags['orderbook-id']), true);
  }
}
