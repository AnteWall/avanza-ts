import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class KeyRatios extends ApiRequestCommand {
  public static override summary = 'Read Sharpe ratio, standard deviation, and CAGR';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs; defaults to all accounts',
    }),
    'include-closed': Flags.boolean({ description: 'Include closed accounts' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(KeyRatios);
    await this.request(
      flags,
      (client) =>
        client.performance.keyRatios({
          accountIds: flags['account-ids'],
          includeClosedAccounts: flags['include-closed'],
        }),
      true,
    );
  }
}
