import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class BulkOrder extends ApiRequestCommand {
  public static override summary = 'Read a saved bulk order';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'bulk-order-id': Flags.string({ required: true, description: 'Bulk order ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(BulkOrder);
    await this.request(flags, (client) => client.orders.bulkOrder(flags['bulk-order-id']), true);
  }
}
