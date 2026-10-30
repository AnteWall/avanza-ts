import { Flags } from '@oclif/core';

import { PushCommand } from '../../output/push-command.js';

export default class Orders extends PushCommand {
  public static override summary = 'Stream your order updates as JSON lines';
  public static override flags = {
    'orderbook-id': Flags.string({ description: 'Only events for this orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Orders);
    await this.stream((client, signal) =>
      client.push.orders({
        ...(flags['orderbook-id'] === undefined ? {} : { orderbookId: flags['orderbook-id'] }),
        signal,
      }),
    );
  }
}
