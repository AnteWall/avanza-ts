import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Holdings extends ApiRequestCommand {
  public static override summary = 'List top fund holdings';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Holdings);
    await this.request(flags, (client) => client.funds.holdings(flags['orderbook-id']));
  }
}
