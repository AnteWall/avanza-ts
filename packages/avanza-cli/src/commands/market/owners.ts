import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Owners extends ApiRequestCommand {
  public static override summary = 'Read the history of Avanza owners';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Owners);
    await this.request(flags, (client) => client.market.numberOfOwners(flags['orderbook-id']));
  }
}
