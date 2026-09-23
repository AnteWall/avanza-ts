import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Search extends ApiRequestCommand {
  public static override summary = 'Search funds by name';
  public static override flags = {
    ...ApiRequestCommand.flags,
    name: Flags.string({ required: true, description: 'Fund name or part of it' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Search);
    await this.request(flags, (client) => client.funds.search(flags.name));
  }
}
