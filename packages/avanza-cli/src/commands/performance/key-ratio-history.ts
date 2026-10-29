import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class KeyRatioHistory extends ApiRequestCommand {
  public static override summary = 'Read Sharpe ratio, standard deviation, and CAGR over time';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs; defaults to all accounts',
    }),
    from: Flags.string({ description: 'History start (yyyy-MM-dd); defaults to earliest' }),
    'include-closed': Flags.boolean({ description: 'Include closed accounts' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(KeyRatioHistory);
    await this.request(
      flags,
      (client) =>
        client.performance.keyRatioHistory({
          accountIds: flags['account-ids'],
          fromDate: flags.from,
          includeClosedAccounts: flags['include-closed'],
        }),
      true,
    );
  }
}
