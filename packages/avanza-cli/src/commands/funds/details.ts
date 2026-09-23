import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Details extends ApiRequestCommand {
  public static override summary = 'Read fund details, fees, and returns';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Details);
    await this.request(flags, (client) => client.funds.details(flags['orderbook-id']));
  }
}
