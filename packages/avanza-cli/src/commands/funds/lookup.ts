import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Lookup extends ApiRequestCommand {
  public static override summary = 'Look up fund names and orderbook IDs';
  public static override flags = {
    ...ApiRequestCommand.flags,
    query: Flags.string({ required: true, description: 'Search text' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Lookup);
    await this.request(flags, (client) => client.funds.instrumentSearch(flags.query));
  }
}
