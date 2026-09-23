import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Sustainability extends ApiRequestCommand {
  public static override summary = 'Read fund sustainability data';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Sustainability);
    await this.request(flags, (client) => client.funds.sustainability(flags['orderbook-id']));
  }
}
