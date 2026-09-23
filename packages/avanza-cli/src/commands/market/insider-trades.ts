import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class InsiderTrades extends ApiRequestCommand {
  public static override summary = 'List individual insider transactions';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(InsiderTrades);
    await this.request(flags, (client) => client.market.insiderTrades(flags['orderbook-id']));
  }
}
