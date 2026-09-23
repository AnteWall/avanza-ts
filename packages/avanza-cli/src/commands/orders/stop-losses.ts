import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class StopLosses extends ApiRequestCommand {
  public static override summary = 'List active stop-loss orders';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ description: 'Account ID; defaults to all' }),
    'orderbook-id': Flags.string({ description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(StopLosses);
    await this.request(
      flags,
      (client) =>
        client.orders.stopLosses({
          accountId: flags['account-id'],
          orderbookId: flags['orderbook-id'],
        }),
      true,
    );
  }
}
