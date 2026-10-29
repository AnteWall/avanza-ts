import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class YearSummary extends ApiRequestCommand {
  public static override summary =
    'Read the yearly summary: development, best and worst holdings and days';
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
    const { flags } = await this.parse(YearSummary);
    await this.request(
      flags,
      (client) => client.performance.yearSummary(flags.year, flags['account-ids']),
      true,
    );
  }
}
