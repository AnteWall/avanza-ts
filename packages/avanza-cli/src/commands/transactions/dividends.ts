import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Dividends extends ApiRequestCommand {
  public static override summary = 'List received dividends';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-id': Flags.string({ description: 'Account URL parameter ID; defaults to all' }),
    'include-closed': Flags.boolean({ description: 'Include closed accounts' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Dividends);
    await this.request(
      flags,
      (client) =>
        client.transactions.dividends({
          accountId: flags['account-id'],
          includeClosedAccounts: flags['include-closed'],
        }),
      true,
    );
  }
}
