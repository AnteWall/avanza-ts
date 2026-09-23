import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Countries extends ApiRequestCommand {
  public static override summary = 'Read country allocations for positions';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ description: 'Optional account URL parameter ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Countries);
    await this.request(flags, (client) => client.positions.countries(flags['account-id']), true);
  }
}
