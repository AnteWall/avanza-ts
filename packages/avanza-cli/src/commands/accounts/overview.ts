import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Overview extends ApiRequestCommand {
  public static override summary = 'Inspect one account';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ required: true, description: 'Account URL parameter ID' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Overview);
    await this.request(flags, (client) => client.accounts.overview(flags['account-id']), true);
  }
}
