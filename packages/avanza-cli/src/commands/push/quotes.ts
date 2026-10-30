import { Flags } from '@oclif/core';

import { PushCommand } from '../../output/push-command.js';

export default class Quotes extends PushCommand {
  public static override summary = 'Stream live quotes as JSON lines';
  public static override flags = {
    'orderbook-ids': Flags.string({
      required: true,
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated orderbook IDs',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Quotes);
    await this.stream((client, signal) => client.push.quotes(flags['orderbook-ids'], { signal }));
  }
}
