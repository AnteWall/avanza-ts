import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class YearTransactions extends ApiRequestCommand {
  public static override summary = 'Read monthly buy and sell totals for a year';
  public static override flags = {
    ...ApiRequestCommand.flags,
    year: Flags.integer({ default: new Date().getFullYear(), description: 'Calendar year' }),
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs; defaults to all accounts',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(YearTransactions);
    await this.request(
      flags,
      (client) => client.performance.yearTransactions(flags.year, flags['account-ids']),
      true,
    );
  }
}
