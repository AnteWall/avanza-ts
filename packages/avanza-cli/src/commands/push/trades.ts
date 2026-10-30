import { Flags } from '@oclif/core';

import { PushCommand } from '../../output/push-command.js';

export default class Trades extends PushCommand {
  public static override summary = 'Stream live trades as JSON lines';
  public static override flags = {
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Trades);
    await this.stream((client, signal) => client.push.trades(flags['orderbook-id'], { signal }));
  }
}
