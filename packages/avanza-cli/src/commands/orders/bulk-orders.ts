import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class BulkOrders extends ApiRequestCommand {
  public static override summary = 'List saved bulk orders';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ description: 'Account ID; defaults to all' }),
    side: Flags.string({ description: 'Order side, for example BUY' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(BulkOrders);
    await this.request(
      flags,
      (client) => client.orders.bulkOrders({ accountId: flags['account-id'], side: flags.side }),
      true,
    );
  }
}
