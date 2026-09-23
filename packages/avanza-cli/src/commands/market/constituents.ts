import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Constituents extends ApiRequestCommand {
  public static override summary = 'List the constituents of an index';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Constituents);
    await this.request(flags, (client) => client.market.indexConstituents(flags['orderbook-id']));
  }
}
