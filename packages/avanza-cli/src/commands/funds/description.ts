import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Description extends ApiRequestCommand {
  public static override summary = 'Read the fund description';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Description);
    await this.request(flags, (client) => client.funds.description(flags['orderbook-id']));
  }
}
