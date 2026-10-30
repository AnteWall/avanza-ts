import { Flags } from '@oclif/core';

import { PushCommand } from '../../output/push-command.js';

export default class TradeState extends PushCommand {
  public static override summary = 'Stream trading state changes as JSON lines';
  public static override flags = {
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(TradeState);
    await this.stream((client, signal) =>
      client.push.tradeState(flags['orderbook-id'], { signal }),
    );
  }
}
