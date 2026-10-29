import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class CompareOrderbooks extends ApiRequestCommand {
  public static override summary = 'Read the relative development of instruments over a range';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-ids': Flags.string({
      required: true,
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated orderbook IDs',
    }),
    from: Flags.string({ required: true, description: 'Range start (yyyy-MM-dd)' }),
    to: Flags.string({ required: true, description: 'Range end (yyyy-MM-dd)' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(CompareOrderbooks);
    await this.request(
      flags,
      (client) =>
        client.performance.orderbookCharts(flags['orderbook-ids'], {
          from: flags.from,
          to: flags.to,
        }),
      true,
    );
  }
}
