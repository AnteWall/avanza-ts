import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Guide extends ApiRequestCommand {
  public static override summary = 'Read the complete fund page';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Guide);
    await this.request(flags, (client) => client.funds.guide(flags['orderbook-id']));
  }
}
