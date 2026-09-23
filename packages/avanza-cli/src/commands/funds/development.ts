import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Development extends ApiRequestCommand {
  public static override summary = 'Read fund returns over standard periods';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'orderbook-id': Flags.string({ required: true, description: 'Fund orderbook ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Development);
    await this.request(flags, (client) => client.funds.development(flags['orderbook-id']));
  }
}
