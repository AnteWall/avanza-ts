import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Orderbooks extends ApiRequestCommand {
  public static override summary = 'Read orderbook details for positions';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-ids': Flags.string({
      required: true,
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated orderbook IDs',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Orderbooks);
    await this.request(
      flags,
      (client) => client.positions.orderbooks(flags['orderbook-ids']),
      true,
    );
  }
}
