import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Sectors extends ApiRequestCommand {
  public static override summary = 'List fund allocation by sector';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Sectors);
    await this.request(flags, (client) => client.funds.sectors(flags['orderbook-id']));
  }
}
