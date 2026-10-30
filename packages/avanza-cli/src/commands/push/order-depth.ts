import { Flags } from '@oclif/core';

import { PushCommand } from '../../output/push-command.js';

export default class OrderDepth extends PushCommand {
  public static override summary = 'Stream live order depth as JSON lines';
  public static override flags = {
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(OrderDepth);
    await this.stream((client, signal) =>
      client.push.orderDepth(flags['orderbook-id'], { signal }),
    );
  }
}
