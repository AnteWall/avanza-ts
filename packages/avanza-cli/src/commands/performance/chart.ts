import { Flags } from '@oclif/core';
import { performancePeriods } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Chart extends ApiRequestCommand {
  public static override summary = 'Read the account performance chart';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs; defaults to all accounts',
    }),
    period: Flags.option({ options: performancePeriods, exclusive: ['from', 'to'] })({
      description: 'Time period',
    }),
    from: Flags.string({ dependsOn: ['to'], description: 'Custom range start (yyyy-MM-dd)' }),
    to: Flags.string({ dependsOn: ['from'], description: 'Custom range end (yyyy-MM-dd)' }),
    'include-closed': Flags.boolean({ description: 'Include closed accounts' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Chart);
    const period =
      flags.from !== undefined && flags.to !== undefined
        ? { from: flags.from, to: flags.to }
        : (flags.period ?? 'ONE_YEAR');
    await this.request(
      flags,
      (client) =>
        client.performance.chart(period, {
          accountIds: flags['account-ids'],
          includeClosedAccounts: flags['include-closed'],
        }),
      true,
    );
  }
}
